import stationDatabase from '../data/stationDatabase.json';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const stationSelectorService = {
  getAllStations() {
    return Array.isArray(stationDatabase) ? stationDatabase : [];
  },

  /**
   * Toutes les stations dans un rayon de 30 km, triees par distance croissante.
   * Fallback : les 5 plus proches si moins de 3 dans le rayon.
   */
  findBestStations(targetLat, targetLon, targetAlt = 0, claimType = '', maxRadius = 30) {
    if (!targetLat || !targetLon) return [];
    const all = this.getAllStations();
    const inRadius = [];

    for (const st of all) {
      if (!st.lat || !st.lon) continue;
      const dist = haversineDistance(targetLat, targetLon, st.lat, st.lon);
      if (dist <= maxRadius) {
        inRadius.push({
          ...st,
          distance: Math.round(dist * 10) / 10,
          altDiff: Math.abs((st.alt || 0) - targetAlt),
          isTop: true
        });
      }
    }

    inRadius.sort((a, b) => a.distance - b.distance);

    if (inRadius.length < 3) {
      return all
        .filter(st => st.lat && st.lon)
        .map(st => ({
          ...st,
          distance: Math.round(haversineDistance(targetLat, targetLon, st.lat, st.lon) * 10) / 10,
          altDiff: Math.abs((st.alt || 0) - targetAlt),
          isTop: true
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map((s, idx) => ({ ...s, rank: idx + 1 }));
    }

    return inRadius.map((s, idx) => ({ ...s, rank: idx + 1 }));
  },

  /**
   * Station la plus proche NON encore selectionnee dans le rayon.
   * Ajoutee automatiquement quand aucune station du rayon 30km n a mesure le vent (fxi = null).
   * Garantit toujours au moins une reference vent pour un sinistre Tempete/Orage.
   */
  findNearestOutsideRadius(targetLat, targetLon, targetAlt = 0, alreadySelectedIds = [], maxExtra = 1) {
    if (!targetLat || !targetLon) return [];
    return this.getAllStations()
      .filter(st => st.lat && st.lon && !alreadySelectedIds.includes(st.id))
      .map(st => ({
        ...st,
        distance: Math.round(haversineDistance(targetLat, targetLon, st.lat, st.lon) * 10) / 10,
        altDiff: Math.abs((st.alt || 0) - targetAlt),
        isTop: false,
        isFallbackWind: true,
        rank: 99
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxExtra);
  }
};
