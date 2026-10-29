/**
 * Service de récupération des relevés horaires (24h)
 * Combine l'API Vercel /api/hourly-obs (Météo-France / Météociel)
 * avec fallback direct sur Open-Meteo Archive (100% garanti de 1940 à aujourd'hui)
 */
export const hourlyObsService = {
  async fetch24hData(stationId, dateStr, lat, lon) {
    if (!dateStr) return [];
    
    // 1. Tenter l'API Vercel (Météo-France / Météociel)
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
      console.warn('[hourlyObsService] API Vercel non disponible, bascule sur Open-Meteo Archive:', e);
    }

    // 2. Fallback direct client-side : Open-Meteo Historical Archive
    try {
      const safeLat = lat || 50.44;
      const safeLon = lon || 3.10;
      const omUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${safeLat}&longitude=${safeLon}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_gusts_10m&timezone=auto`;
      
      const omResp = await fetch(omUrl);
      if (omResp.ok) {
        const omData = await omResp.json();
        const omH = omData?.hourly;
        if (omH && omH.time && omH.time.length === 24) {
          const list = [];
          for (let i = 0; i < 24; i++) {
            list.push({
              h: i,
              temp: omH.temperature_2m ? omH.temperature_2m[i] : 12.0,
              humi: omH.relative_humidity_2m ? omH.relative_humidity_2m[i] : 85,
              w_avg: omH.wind_speed_10m ? Math.round(omH.wind_speed_10m[i]) : 30,
              w_gst: omH.wind_gusts_10m ? Math.round(omH.wind_gusts_10m[i]) : 50,
              rain: omH.precipitation ? Math.round(omH.precipitation[i] * 10) / 10 : 0.0,
              press: omH.surface_pressure ? Math.round(omH.surface_pressure[i] * 10) / 10 : 1005.0
            });
          }
          return list;
        }
      }
    } catch (e) {
      console.error('[hourlyObsService] Erreur Open-Meteo archive fallback:', e);
    }

    return [];
  }
};
