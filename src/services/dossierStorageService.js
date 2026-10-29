import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'meteo_climat_pro_sinistres_v1';

export const dossierStorageService = {
  generateReference() {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `MCP-${year}-${rand}`;
  },

  getLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = this.getInitialSample();
        this.saveAllLocal(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Erreur lecture storage:', e);
      return [];
    }
  },

  saveAllLocal(dossiers) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
    } catch (e) {
      console.error('Erreur écriture storage local:', e);
    }
  },

  // Synchronous read (0ms) + background Cloud fetch
  getAll() {
    const local = this.getLocal();
    // Launch async sync with Supabase
    if (isSupabaseConfigured) {
      this.fetchFromCloud().catch(err => {
        console.warn('Sync Supabase certificats_meteo:', err.message);
      });
    }
    return local;
  },

  async fetchFromCloud() {
    if (!isSupabaseConfigured) return this.getLocal();

    try {
      const { data, error } = await supabase
        .from('certificats_meteo')
        .select('*')
        .order('date_generation', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const local = this.getLocal();
        const mapped = data.map(row => {
          const payload = row.donnees_brutes_json || {};
          return {
            id: row.id,
            reference: payload.reference || `MCP-${row.id.slice(0, 8).toUpperCase()}`,
            status: payload.status || 'Rapport généré',
            createdAt: row.date_generation,
            updatedAt: row.date_generation,
            assure: payload.assure || {
              nom: row.nom_client || 'Assuré',
              prenom: '',
              societe: '',
              telephone: '',
              email: row.email_client || '',
              numContrat: payload.assure?.numContrat || '',
              compagnieAssurance: payload.assure?.compagnieAssurance || ''
            },
            sinistre: payload.sinistre || {
              numSinistre: payload.sinistre?.numSinistre || '',
              sinistreType: row.type_certificat || 'Sinistre Météo',
              adresseSinistre: row.adresse || row.ville || '',
              commune: row.ville || '',
              codePostal: row.code_postal || '',
              dateSinistre: row.date_sinistre || '',
              heureSinistre: row.heure_sinistre || '12h00',
              description: payload.sinistre?.description || '',
              observations: payload.sinistre?.observations || ''
            },
            selectedStations: payload.selectedStations || (row.station_id ? [{
              id: row.station_id,
              name: row.station_reference || 'Station Météo-France',
              distance: 10,
              isTop3: true,
              rank: 1
            }] : []),
            _synced: true
          };
        });

        // Merge: keep local items not yet in cloud
        const merged = [...mapped];
        for (const locItem of local) {
          if (!merged.some(m => m.id === locItem.id || m.reference === locItem.reference)) {
            merged.push(locItem);
          }
        }

        this.saveAllLocal(merged);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sinistres_dossiers_updated', { detail: merged }));
        }
        return merged;
      }
      return this.getLocal();
    } catch (err) {
      console.warn('Fallback local pour certificats_meteo:', err.message);
      return this.getLocal();
    }
  },

  async save(dossier) {
    const all = this.getLocal();
    const isNew = !dossier.id || !dossier.id.includes('-');
    const targetId = isNew ? crypto.randomUUID() : dossier.id;

    const fullDossier = {
      ...dossier,
      id: targetId,
      reference: dossier.reference || this.generateReference(),
      createdAt: dossier.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _synced: false
    };

    const existingIndex = all.findIndex(d => d.id === targetId || d.id === dossier.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = fullDossier;
    } else {
      updated = [fullDossier, ...all];
    }
    this.saveAllLocal(updated);

    // Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        const clientName = `${dossier.assure?.nom || ''} ${dossier.assure?.prenom || ''}`.trim() || dossier.assure?.societe || 'Sans Nom';
        const dateSin = dossier.sinistre?.dateSinistre?.split(' ')[0] || new Date().toISOString().split('T')[0];

        const payload = {
          id: targetId,
          nom_client: clientName,
          adresse: dossier.sinistre?.adresseSinistre || '',
          ville: dossier.sinistre?.commune || '',
          code_postal: dossier.sinistre?.codePostal || '',
          email_client: dossier.assure?.email || '',
          date_sinistre: dateSin,
          heure_sinistre: dossier.sinistre?.heureSinistre || '12h00',
          type_certificat: dossier.sinistre?.sinistreType || 'Sinistre Météo',
          station_reference: dossier.selectedStations?.[0]?.name || '',
          station_id: dossier.selectedStations?.[0]?.id || '',
          donnees_brutes_json: fullDossier,
          date_generation: new Date().toISOString()
        };

        const { error } = await supabase.from('certificats_meteo').upsert([payload]);
        if (!error) {
          fullDossier._synced = true;
          const idx = updated.findIndex(d => d.id === targetId);
          if (idx >= 0) {
            updated[idx]._synced = true;
            this.saveAllLocal(updated);
          }
        } else {
          console.warn('Erreur upsert Supabase certificat:', error);
        }
      } catch (err) {
        console.warn('Erreur réseau synchro certificat Supabase:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sinistres_dossiers_updated', { detail: updated }));
    }

    return fullDossier;
  },

  async delete(id) {
    const all = this.getLocal();
    const updated = all.filter(d => d.id !== id);
    this.saveAllLocal(updated);

    if (isSupabaseConfigured && id && id.includes('-')) {
      try {
        await supabase.from('certificats_meteo').delete().eq('id', id);
      } catch (err) {
        console.warn('Erreur suppression Supabase certificat:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sinistres_dossiers_updated', { detail: updated }));
    }

    return updated;
  },

  getInitialSample() {
    return [
      {
        id: '5f042e08-5bcb-46d4-9fd4-88c44807d95c',
        reference: 'MCP-2026-1023',
        status: 'Rapport certifié',
        createdAt: '2026-10-23T11:58:00Z',
        assure: {
          nom: 'Merle',
          prenom: 'Madame',
          societe: '',
          telephone: '03 20 00 00 00',
          email: 'contact@assurance.fr',
          numContrat: 'POL-2026-59283',
          compagnieAssurance: 'Compagnie d\'Assurance'
        },
        sinistre: {
          numSinistre: 'SIN-2026-1023',
          sinistreType: 'Tempête / Vent violent (Tempête Austen)',
          adresseSinistre: '176 rue du Maréchal Foch, 59283 Raimbeaucourt',
          commune: 'Raimbeaucourt',
          codePostal: '59283',
          lat: 50.440,
          lon: 3.104,
          dateSinistre: '2026-10-23',
          heureSinistre: '11h58',
          description: 'Sinistre toiture et dégâts causés par les violentes rafales de la tempête Austen.',
          observations: 'Rafales de 92 km/h mesurées à Lille-Lesquin (14,5 km) et 96 km/h à Arras (26,4 km).'
        },
        selectedStations: [
          { id: '59343001', name: 'Lille-Lesquin', distance: 14.5, alt: 47, isTop3: true, rank: 1, obs: { fxi: 92, hxi: '11h58', rr: 12.9, tn: 9.2, tx: 13.6 } },
          { id: '62873001', name: 'Arras', distance: 26.4, alt: 100, isTop3: true, rank: 2, obs: { fxi: 96, hxi: '10h59', rr: 9.8, tn: 9.1, tx: 13.4 } },
          { id: '62298001', name: 'Cambrai-Epinoy', distance: 24.2, alt: 80, isTop3: true, rank: 3, obs: { fxi: 90, hxi: '14h14', rr: 9.8, tn: 9.3, tx: 13.2 } },
          { id: '59606004', name: 'Valenciennes', distance: 28.2, alt: 50, isTop3: true, rank: 4, obs: { fxi: 91, hxi: '15h03', rr: 16.2, tn: 9.7, tx: 13.1 } }
        ]
      }
    ];
  }
};
