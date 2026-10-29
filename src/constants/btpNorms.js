/**
 * RÉFÉRENTIEL OFFICIEL DES CORPS D'ÉTAT DU BTP & NORMES TECHNIQUES (DTU / CNAM / CODE DU TRAVAIL)
 * 28 corps d'état avec seuils normatifs d'arrêt de travail certifiés Météo Climat Pro
 */

export const BTP_CATEGORIES = {
  GROS_OEUVRE: 'Gros Œuvre & Fondations',
  HAUTEUR: 'Levage & Travaux en Hauteur',
  STRUCTURE: 'Charpente & Structures',
  ENVELOPPE: 'Enveloppe, Toiture & Façades',
  FINITIONS: 'Finitions Extérieures',
  VRD: 'VRD, Voirie & Espaces Verts',
  CANICULE: 'Conditions Thermiques Extrêmes'
};

export const BTP_CORPS_ETAT = [
  // I. GROS ŒUVRE & FONDATIONS
  {
    id: 'gros_oeuvre',
    nom: 'Gros Œuvre & Béton Armé',
    categorie: BTP_CATEGORIES.GROS_OEUVRE,
    norme: 'DTU 21 / NF EN 13670',
    wind: 60,
    rain: 10,
    tempMin: 0,
    heat: 33,
    motifVent: 'Vent violent ≥ 60 km/h (Mise en danger banches et coffrages)',
    motifPluie: 'Pluie ≥ 10 mm (Altération rapport E/C et délavage béton frais)',
    motifGel: 'Gel ≤ 0°C (Interdiction coulage béton frais DTU 21)',
    motifChaleur: 'Forte chaleur ≥ 33°C (Dessiccation rapide et fissuration)'
  },
  {
    id: 'maconnerie',
    nom: 'Maçonnerie de petits éléments',
    categorie: BTP_CATEGORIES.GROS_OEUVRE,
    norme: 'DTU 20.1',
    wind: 55,
    rain: 8,
    tempMin: 0,
    heat: 33,
    motifGel: 'Gel ≤ 0°C (Détérioration mortier de montage DTU 20.1)'
  },
  {
    id: 'terrassement',
    nom: 'Terrassement & Fouilles',
    categorie: BTP_CATEGORIES.GROS_OEUVRE,
    norme: 'Guide GTR / NF P94-500',
    wind: 65,
    rain: 8,
    tempMin: -2,
    heat: 35,
    motifPluie: 'Pluie ≥ 8 mm (Perte de portance des sols, boue et orniérage)',
    motifGel: 'Gel ≤ -2°C (Sol gelé non compactable)'
  },
  {
    id: 'fondations',
    nom: 'Fondations Spéciales / Pieux',
    categorie: BTP_CATEGORIES.GROS_OEUVRE,
    norme: 'DTU 13.2 / NF EN 1536',
    wind: 60,
    rain: 12,
    tempMin: -1,
    heat: 35
  },
  {
    id: 'demolition',
    nom: 'Démolition & Désamiantage',
    categorie: BTP_CATEGORIES.GROS_OEUVRE,
    norme: 'Recommandation CNAM R473',
    wind: 50,
    rain: 15,
    tempMin: -3,
    heat: 35,
    motifVent: 'Vent ≥ 50 km/h (Risque envol poussières d\'amiante et gravats)'
  },
  {
    id: 'genie_civil',
    nom: 'Génie Civil & Ouvrages d\'Art',
    categorie: BTP_CATEGORIES.GROS_OEUVRE,
    norme: 'Fascicule 65 / Eurocode 2',
    wind: 60,
    rain: 10,
    tempMin: 0,
    heat: 34
  },

  // II. LEVAGE & TRAVAUX EN HAUTEUR
  {
    id: 'grue_tour',
    nom: 'Grues à Tour & Appareils de Levage',
    categorie: BTP_CATEGORIES.HAUTEUR,
    norme: 'Recommandation CNAM R406',
    wind: 50,
    rain: 10,
    tempMin: -2,
    heat: 35,
    motifVent: 'Vent violent ≥ 50 km/h (Seuil d\'alerte et arrêt de grue CNAM R406)'
  },
  {
    id: 'grue_mobile',
    nom: 'Grues Mobiles & Télescopiques',
    categorie: BTP_CATEGORIES.HAUTEUR,
    norme: 'CNAM R383 / Notice Constructeur',
    wind: 50,
    rain: 12,
    tempMin: -2,
    heat: 35
  },
  {
    id: 'echafaudage',
    nom: 'Échafaudages & Étaiements',
    categorie: BTP_CATEGORIES.HAUTEUR,
    norme: 'CNAM R408 / Art. R. 4323-68',
    wind: 50,
    rain: 8,
    tempMin: -1,
    heat: 35,
    motifVent: 'Vent ≥ 50 km/h (Interdiction d\'accès aux postes de travail R408)',
    motifGel: 'Gel ≤ -1°C (Verglas sur platelages et échelles d\'accès)'
  },
  {
    id: 'travaux_cordes',
    nom: 'Travaux sur Cordes & Accès Difficile',
    categorie: BTP_CATEGORIES.HAUTEUR,
    norme: 'Décret 2004-924 / OPPBTP',
    wind: 45,
    rain: 5,
    tempMin: 0,
    heat: 33,
    motifVent: 'Vent ≥ 45 km/h (Risque de balancement et décrochage cordiste)'
  },

  // III. CHARPENTE & STRUCTURES
  {
    id: 'charpente_bois',
    nom: 'Charpente Bois & Ossature Bois',
    categorie: BTP_CATEGORIES.STRUCTURE,
    norme: 'DTU 31.1 / DTU 31.2',
    wind: 50,
    rain: 5,
    tempMin: -1,
    heat: 35,
    motifVent: 'Vent ≥ 50 km/h (Prise au vent des fermes en cours de pose)',
    motifPluie: 'Pluie ≥ 5 mm (Surfaces glissantes en hauteur et gonflement bois)'
  },
  {
    id: 'charpente_metal',
    nom: 'Charpente Métallique & Ossature Acier',
    categorie: BTP_CATEGORIES.STRUCTURE,
    norme: 'DTU 32.1 / Eurocode 3',
    wind: 50,
    rain: 5,
    tempMin: 0,
    heat: 35,
    motifVent: 'Vent ≥ 50 km/h (Interdiction levage de poutres et pannes)',
    motifPluie: 'Pluie ≥ 5 mm (Glissance des profilés métalliques humides)'
  },
  {
    id: 'serrurerie',
    nom: 'Serrurerie, Métallerie & Garde-corps',
    categorie: BTP_CATEGORIES.STRUCTURE,
    norme: 'DTU 37.1',
    wind: 55,
    rain: 10,
    tempMin: -2,
    heat: 35
  },

  // IV. ENVELOPPE, TOITURE & ÉTANCHÉITÉ
  {
    id: 'couverture_tuiles',
    nom: 'Couverture Tuiles, Ardoises, Zinc',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'DTU 40.11 / 40.21 / 40.41',
    wind: 50,
    rain: 2,
    tempMin: 0,
    heat: 34,
    motifVent: 'Vent ≥ 50 km/h (Risque de chute de toiture et envol éléments)',
    motifPluie: 'Pluie ≥ 2 mm (Pente de toit mouillée, risque de glissade mortelle)',
    motifGel: 'Gel ≤ 0°C (Tuiles gelées glissantes et cassantes)'
  },
  {
    id: 'etancheite_bitume',
    nom: 'Étanchéité Toiture-Terrasse Bitumineuse',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'DTU 43.1 / DTU 43.3',
    wind: 50,
    rain: 1,
    tempMin: 5,
    heat: 35,
    motifPluie: 'Pluie ≥ 1 mm (Support humide interdisant soudure au chalumeau)',
    motifGel: 'Température < 5°C (Perte d\'adhérence et cloquage des bitumes)'
  },
  {
    id: 'etancheite_liquide',
    nom: 'Résines & SEL (Système d\'Étanchéité Liquide)',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'Cahier CSTB 3634',
    wind: 45,
    rain: 1,
    tempMin: 5,
    heat: 32,
    motifPluie: 'Humidité / Pluie ≥ 1 mm (Non-polymérisation des résines)'
  },
  {
    id: 'bardage',
    nom: 'Bardage Métallique & Panneaux Sandwiches',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'DTU 38.1',
    wind: 50,
    rain: 8,
    tempMin: 0,
    heat: 35,
    motifVent: 'Vent ≥ 50 km/h (Effet de voile des panneaux de grande dimension)'
  },
  {
    id: 'facades_enduits',
    nom: 'Façades, Enduits Monocouches & ITE',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'DTU 26.1 / DTU 45.4',
    wind: 45,
    rain: 2,
    tempMin: 5,
    heat: 30,
    motifPluie: 'Pluie ≥ 2 mm (Délavage et coulures sur enduit frais)',
    motifGel: 'Température < 5°C (Gel de l\'eau de gâchage et arrêt prise DTU 26.1)',
    motifChaleur: 'Température ≥ 30°C (Grillage de l\'enduit par dessiccation rapide)'
  },
  {
    id: 'menuiseries_ext',
    nom: 'Menuiseries Extérieures & Murs-Rideaux',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'DTU 36.5 / DTU 33.1',
    wind: 50,
    rain: 5,
    tempMin: 0,
    heat: 35,
    motifVent: 'Vent ≥ 50 km/h (Manutention vitrages et prise au vent ventouses)'
  },
  {
    id: 'miroiterie',
    nom: 'Miroiterie & Vitrage Extérieur Collé (VEC)',
    categorie: BTP_CATEGORIES.ENVELOPPE,
    norme: 'DTU 39 / Cahier CSTB 3488',
    wind: 45,
    rain: 1,
    tempMin: 5,
    heat: 32
  },

  // V. FINITIONS EXTÉRIEURES
  {
    id: 'peinture_ext',
    nom: 'Peinture Extérieure & Ravalement',
    categorie: BTP_CATEGORIES.FINITIONS,
    norme: 'DTU 59.1',
    wind: 40,
    rain: 1,
    tempMin: 5,
    heat: 35,
    motifVent: 'Vent ≥ 40 km/h (Dispersion des pulvérisations et poussières)',
    motifPluie: 'Pluie ≥ 1 mm (Lessivage immédiat du film de peinture fraîche)',
    motifGel: 'Température < 5°C (Mauvaise coalescence du film acrylique)'
  },
  {
    id: 'carrelage_ext',
    nom: 'Carrelage & Dallage Extérieur',
    categorie: BTP_CATEGORIES.FINITIONS,
    norme: 'DTU 52.1 / DTU 52.2',
    wind: 55,
    rain: 2,
    tempMin: 5,
    heat: 33,
    motifPluie: 'Pluie ≥ 2 mm (Délavage du mortier colle et barbotine)'
  },

  // VI. VOIRIE, RÉSEAUX & ESPACES VERTS
  {
    id: 'vrd_assainissement',
    nom: 'VRD & Canalisations Enterrées',
    categorie: BTP_CATEGORIES.VRD,
    norme: 'Fascicule 70 / Guide GTR',
    wind: 60,
    rain: 10,
    tempMin: -2,
    heat: 35,
    motifPluie: 'Pluie ≥ 10 mm (Inondation des tranchées et risque d\'éboulement)'
  },
  {
    id: 'enrobes_chaud',
    nom: 'Enrobés Bitumineux à Chaud & Voirie',
    categorie: BTP_CATEGORIES.VRD,
    norme: 'NF P98-150 / Fascicule 24',
    wind: 50,
    rain: 2,
    tempMin: 5,
    heat: 36,
    motifPluie: 'Pluie ≥ 2 mm (Refroidissement brutal et décollement émulsion)',
    motifGel: 'Température < 5°C (Refroidissement trop rapide, compactage impossible)'
  },
  {
    id: 'pavage_bordures',
    nom: 'Pavage, Bordures & Trottoirs',
    categorie: BTP_CATEGORIES.VRD,
    norme: 'NF P98-335',
    wind: 60,
    rain: 5,
    tempMin: 0,
    heat: 34
  },
  {
    id: 'espaces_verts',
    nom: 'Aménagements Paysagers & Espaces Verts',
    categorie: BTP_CATEGORIES.VRD,
    norme: 'DTU 103',
    wind: 55,
    rain: 10,
    tempMin: -1,
    heat: 34,
    motifPluie: 'Pluie ≥ 10 mm (Tassement et compactage destructeur des terres végétales)'
  },
  {
    id: 'clotures',
    nom: 'Clôtures, Portails & Mobilier Urbain',
    categorie: BTP_CATEGORIES.VRD,
    norme: 'CCTP Type / Norme NF EN 10223',
    wind: 55,
    rain: 10,
    tempMin: -2,
    heat: 35
  },

  // VII. CONDITIONS THERMIQUES EXTRÊMES
  {
    id: 'canicule_generale',
    nom: 'Travaux Extérieurs (Plan Forte Chaleur / Canicule)',
    categorie: BTP_CATEGORIES.CANICULE,
    norme: 'Décret n° 2024-624 / Code du Travail Art. R. 4463-1',
    wind: 65,
    rain: 10,
    tempMin: 0,
    heat: 33,
    motifChaleur: 'Vague de chaleur ≥ 33°C (Arrêt réglementaire pour danger thermique direct)'
  }
];

export const BTP_LOTS_NAMES = BTP_CORPS_ETAT.map(b => b.nom);

export function getPresetByIdOrName(val) {
  if (!val) return BTP_CORPS_ETAT[0];
  const found = BTP_CORPS_ETAT.find(b => b.id === val || b.nom === val);
  return found || BTP_CORPS_ETAT[0];
}
