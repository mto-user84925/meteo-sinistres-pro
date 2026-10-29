import { supabase, isSupabaseConfigured } from './supabaseClient';

const ATTESTATION_STORAGE_KEY = 'mcp_btp_attestations_history';

export const btpAttestationStorageService = {
  getLocal() {
    try {
      const raw = localStorage.getItem(ATTESTATION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async getAll() {
    const local = this.getLocal();
    if (!isSupabaseConfigured) return local;

    try {
      const { data, error } = await supabase
        .from('attestations_intemperies')
        .select('*')
        .order('date_generation', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(ATTESTATION_STORAGE_KEY, JSON.stringify(data.slice(0, 50)));
        return data;
      }
      return local;
    } catch (err) {
      console.warn('Fallback local attestations_intemperies:', err.message);
      return local;
    }
  },

  async saveAttestation({ dossierBtp, daysAnalysis, summary, referenceStation, thresholds }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record = {
      id,
      created_at: now,
      ville: dossierBtp.adresse || dossierBtp.nomChantier || 'Chantier',
      periode_debut: dossierBtp.dateDebut,
      periode_fin: dossierBtp.dateFin,
      station: `${referenceStation?.name || 'Station'} (${referenceStation?.id || ''})`,
      type_document: 1, // Attestation d'intempéries BTP
      nb_jours_intemperies: summary.intemperieDaysCount || 0,
      seuils_json: {
        thresholds,
        summary,
        daysAnalysis,
        dossierBtp
      },
      date_generation: now
    };

    // 1. Sauvegarde locale
    const localList = this.getLocal();
    localList.unshift(record);
    try {
      localStorage.setItem(ATTESTATION_STORAGE_KEY, JSON.stringify(localList.slice(0, 50)));
    } catch (e) {
      console.warn('Erreur cache local attestation:', e);
    }

    // 2. Sauvegarde Supabase Cloud
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('attestations_intemperies')
          .insert([record]);

        if (error) {
          console.warn('Erreur insert attestations_intemperies Supabase:', error);
        } else {
          console.log('✅ Attestation BTP enregistrée avec succès dans Supabase:', id);
        }
      } catch (err) {
        console.warn('Erreur réseau synchro attestation Supabase:', err);
      }
    }

    return record;
  }
};
