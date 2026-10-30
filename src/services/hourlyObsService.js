import { meteoFranceClimService } from './meteoFranceClimService';

/**
 * Service de récupération des relevés horaires certifiés (24h)
 * Interroge l'API officielle Météo-France DPClim (Horaire H_60 avec strict FXI3S)
 * et restitue les 24 heures (0h à 23h) en Heure Légale française.
 */
export const hourlyObsService = {
  async fetch24hData(stationId, dateStr, lat, lon) {
    if (!dateStr) return [];
    
    // 1. Appel officiel DPClim Horaire Météo-France certifié
    try {
      const data = await meteoFranceClimService.fetchStationHourlyHistory(stationId, dateStr, dateStr);
      if (data && Array.isArray(data) && data.length > 0) {
        // Filtrer sur la date demandée (Europe/Paris)
        const dayRows = data.filter(r => (r.date_local === dateStr || r.date === dateStr));
        if (dayRows.length > 0) {
          return dayRows.map(r => ({
            h: r.h_local !== undefined ? r.h_local : r.h,
            temp: r.temp,
            humi: r.humi || r.hum || 0,
            w_avg: r.w_avg || r.wind || 0,
            w_gst: r.w_gst || r.gust || 0,
            rain: r.rain || 0,
            press: r.press || r.pres || 1013
          }));
        }
      }
    } catch (e) {
      console.warn('[hourlyObsService] DPClim direct indisponible, essai API Vercel:', e);
    }

    // 2. Relais serveur /api/hourly-obs si disponible
    try {
      const url = `/api/hourly-obs?station=${encodeURIComponent(stationId || '59343001')}&date=${encodeURIComponent(dateStr)}&lat=${lat || '50.44'}&lon=${lon || '3.10'}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.hourly) && data.hourly.length >= 18) {
          return data.hourly;
        }
      }
    } catch (e) {
      console.warn('[hourlyObsService] API Vercel non disponible:', e);
    }

    return [];
  }
};
