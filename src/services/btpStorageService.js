/**
 * Service de stockage local pour les Chantiers BTP
 */
const STORAGE_KEY = 'mcp_btp_chantiers';

const DEFAULT_CHANTIERS = [
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
    lots: ['Gros œuvre', 'Grues / Levage', 'Terrassement', 'Étanchéité']
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
    lots: ['Charpente', 'Couverture', 'Bardage', 'Menuiseries extérieures']
  }
];

export const btpStorageService = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHANTIERS));
        return DEFAULT_CHANTIERS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CHANTIERS;
    } catch {
      return DEFAULT_CHANTIERS;
    }
  },

  save(chantier) {
    const list = this.getAll();
    const existingIdx = list.findIndex(c => c.id === chantier.id);
    if (existingIdx >= 0) {
      list[existingIdx] = chantier;
    } else {
      list.unshift({ ...chantier, id: chantier.id || 'chantier_' + Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return chantier;
  },

  delete(id) {
    const list = this.getAll().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  }
};
