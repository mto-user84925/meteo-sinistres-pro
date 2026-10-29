import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'mcp_btp_chantiers';

const DEFAULT_CHANTIERS = [
  {
    id: '4043c673-dd58-4989-97b0-bb2313addd08',
    nom: 'GLP SAINT WITZ',
    client: 'IDEC',
    contact: 'Direction Travaux',
    telephone: '01 40 00 00 00',
    email: 'contact@idec.fr',
    adresse: 'ZAC du Moulin, 95470 Saint-Witz',
    commune: 'Saint-Witz',
    codePostal: '95470',
    lat: 49.091,
    lon: 2.568,
    dateDebut: '2026-07-01',
    dateFin: '2026-11-30',
    statut: 'En cours',
    lots: ['Gros Œuvre & Béton Armé', 'Grues à Tour & Appareils de Levage', 'Charpente Métallique & Ossature Acier', 'Étanchéité Toiture-Terrasse Bitumineuse']
  },
  {
    id: 'chantier_1',
    nom: 'Résidence Les Hauts de Douai',
    client: 'Bouygues BTP Nord',
    contact: 'Marc Dubois',
    telephone: '06 12 34 56 78',
    email: 'm.dubois@bouygues-btp.fr',
    adresse: 'Place d\'Armes, 59500 Douai',
    commune: 'Douai',
    codePostal: '59500',
    lat: 50.371,
    lon: 3.080,
    dateDebut: '2026-10-01',
    dateFin: '2026-10-31',
    statut: 'En cours',
    lots: ['Gros Œuvre & Béton Armé', 'Grues à Tour & Appareils de Levage', 'Terrassement & Fouilles', 'Étanchéité Toiture-Terrasse Bitumineuse']
  },
  {
    id: 'chantier_2',
    nom: 'Parc Tertiaire Onnaing Val',
    client: 'Eiffage Construction',
    contact: 'Sarah Bernard',
    telephone: '06 98 76 54 32',
    email: 's.bernard@eiffage.com',
    adresse: '41 Rue Des Perdreaux, 59264 Onnaing',
    commune: 'Onnaing',
    codePostal: '59264',
    lat: 50.387,
    lon: 3.601,
    dateDebut: '2026-10-10',
    dateFin: '2026-10-25',
    statut: 'En cours',
    lots: ['Charpente Bois & Ossature Bois', 'Couverture Tuiles, Ardoises, Zinc', 'Bardage Métallique & Panneaux Sandwiches', 'Menuiseries Extérieures & Murs-Rideaux']
  }
];

export const btpStorageService = {
  getLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.setLocal(DEFAULT_CHANTIERS);
        return DEFAULT_CHANTIERS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CHANTIERS;
    } catch {
      return DEFAULT_CHANTIERS;
    }
  },

  setLocal(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Erreur écriture cache local BTP:', e);
    }
  },

  // Lecture synchrone (0ms) + fetch asynchrone Supabase
  getAll() {
    const local = this.getLocal();
    if (isSupabaseConfigured) {
      this.fetchFromCloud().catch(err => {
        console.warn('Sync Supabase btp_projects:', err.message);
      });
    }
    return local;
  },

  async fetchFromCloud() {
    if (!isSupabaseConfigured) return this.getLocal();

    try {
      const { data, error } = await supabase
        .from('btp_projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const local = this.getLocal();
        const mapped = data.map(row => {
          const meta = row.global_data?.__metadata || {};
          return {
            id: row.id,
            nom: row.name || 'Chantier BTP',
            client: row.project_client || row.client_header || '',
            contact: meta.contact || '',
            telephone: row.emitter_phone || meta.telephone || '',
            email: row.client_email || meta.email || '',
            adresse: row.project_address || meta.adresse || row.name,
            commune: meta.commune || row.project_address?.split(',')[1]?.trim() || row.name,
            codePostal: meta.codePostal || '',
            lat: meta.lat || 50.371,
            lon: meta.lon || 3.080,
            dateDebut: row.start_chantier_date || meta.dateDebut || '2026-10-01',
            dateFin: meta.dateFin || '2026-11-30',
            statut: meta.statut || 'En cours',
            lots: row.active_trades || ['Gros Œuvre & Béton Armé'],
            station_id: row.station_id || '',
            station_name: row.station_name || '',
            _synced: true
          };
        });

        // Merge: keep local items not yet in cloud
        const merged = [...mapped];
        for (const locItem of local) {
          if (!merged.some(m => m.id === locItem.id || m.nom === locItem.nom)) {
            merged.push(locItem);
          }
        }

        this.setLocal(merged);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('btp_chantiers_updated', { detail: merged }));
        }
        return merged;
      }
      return this.getLocal();
    } catch (err) {
      console.warn('Fallback local pour btp_projects:', err.message);
      return this.getLocal();
    }
  },

  async save(chantier) {
    const list = this.getLocal();
    const isNew = !chantier.id || !chantier.id.includes('-');
    const targetId = isNew ? crypto.randomUUID() : chantier.id;
    const itemWithId = { ...chantier, id: targetId, _synced: false };

    const existingIdx = list.findIndex(c => c.id === targetId || c.id === chantier.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = itemWithId;
    } else {
      updated = [itemWithId, ...list];
    }
    this.setLocal(updated);

    // Sync Cloud Supabase
    if (isSupabaseConfigured) {
      try {
        const payload = {
          id: targetId,
          name: chantier.nom,
          project_client: chantier.client || '',
          project_address: chantier.adresse || '',
          start_chantier_date: chantier.dateDebut || '',
          active_trades: chantier.lots || [],
          updated_at: new Date().toISOString(),
          global_data: {
            __metadata: {
              commune: chantier.commune || '',
              codePostal: chantier.codePostal || '',
              lat: chantier.lat,
              lon: chantier.lon,
              dateFin: chantier.dateFin || '',
              statut: chantier.statut || 'En cours',
              contact: chantier.contact || '',
              telephone: chantier.telephone || '',
              email: chantier.email || ''
            }
          }
        };

        const { error } = await supabase.from('btp_projects').upsert([payload]);
        if (!error) {
          itemWithId._synced = true;
          const idx = updated.findIndex(c => c.id === targetId);
          if (idx >= 0) {
            updated[idx]._synced = true;
            this.setLocal(updated);
          }
        } else {
          console.warn('Erreur upsert Supabase btp_projects:', error);
        }
      } catch (err) {
        console.warn('Erreur réseau synchro btp_projects:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('btp_chantiers_updated', { detail: updated }));
    }

    return itemWithId;
  },

  async delete(id) {
    const list = this.getLocal().filter(c => c.id !== id);
    this.setLocal(list);

    if (isSupabaseConfigured && id && id.includes('-')) {
      try {
        await supabase.from('btp_projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Erreur suppression btp_projects Supabase:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('btp_chantiers_updated', { detail: list }));
    }

    return list;
  }
};
