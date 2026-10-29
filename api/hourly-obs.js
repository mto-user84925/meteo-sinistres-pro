export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { station = '59343001', date = '2026-10-23', lat = '50.44', lon = '3.10' } = req.query;

  try {
    const parts = date.split('-');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Format de date invalide (YYYY-MM-DD requis)' });
    }

    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    let hourly = [];

    // 1. Tenter la collecte Météociel / Météo-France
    try {
      const mcUrl = `https://www.meteociel.fr/temps-reel/obs_villes.php?code2=${station}&jour2=${day}&mois2=${monthIdx}&annee2=${year}`;
      const mcResp = await fetch(mcUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (mcResp.ok) {
        const buffer = await mcResp.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1');
        const html = decoder.decode(buffer);

        const rowMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        for (const row of rowMatches) {
          const tdMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          if (!tdMatches) continue;

          const cleanTds = tdMatches.map(td => td.replace(/<[^>]+>/g, '').trim());
          if (cleanTds.length > 0 && /^\d{1,2}\s*h/i.test(cleanTds[0])) {
            const hour = parseInt(cleanTds[0].match(/\d+/)[0], 10);
            const tempMatch = cleanTds.join(' ').match(/(-?\d+(?:\.\d+)?)\s*°C/);
            const temp = tempMatch ? parseFloat(tempMatch[1]) : null;

            const humiMatch = cleanTds.join(' ').match(/(\d+)%/);
            const humi = humiMatch ? parseInt(humiMatch[1], 10) : null;

            const wAvgMatch = row.match(/Vent moyen\s*:\s*(\d+)\s*km\/h/i);
            const wAvg = wAvgMatch ? parseInt(wAvgMatch[1], 10) : 0;

            const wGstMatch = row.match(/Rafales max\s*:\s*(\d+)\s*km\/h/i);
            const wGst = wGstMatch ? parseInt(wGstMatch[1], 10) : wAvg;

            const rainMatch = cleanTds[cleanTds.length - 1].match(/(\d+(?:\.\d+)?)\s*mm/i);
            const rain = rainMatch ? parseFloat(rainMatch[1]) : 0.0;

            const pressMatch = cleanTds.join(' ').match(/(\d+(?:\.\d+)?)\s*hPa/i);
            const press = pressMatch ? parseFloat(pressMatch[1]) : null;

            hourly.push({ h: hour, temp, humi, w_avg: wAvg, w_gst: wGst, rain, press });
          }
        }
      }
    } catch (e) {
      console.warn('[hourly-obs] Météociel fetch warn:', e);
    }

    // 2. Si moins de 18 heures trouvées, compléter ou basculer sur Open-Meteo Archive (100% garanti)
    if (hourly.length < 18) {
      try {
        const omUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_gusts_10m`;
        const omResp = await fetch(omUrl);
        if (omResp.ok) {
          const omData = await omResp.json();
          const omH = omData?.hourly;
          if (omH && omH.time && omH.time.length === 24) {
            const fallback24 = [];
            for (let i = 0; i < 24; i++) {
              fallback24.push({
                h: i,
                temp: omH.temperature_2m ? omH.temperature_2m[i] : 12.0,
                humi: omH.relative_humidity_2m ? omH.relative_humidity_2m[i] : 85,
                w_avg: omH.wind_speed_10m ? Math.round(omH.wind_speed_10m[i]) : 30,
                w_gst: omH.wind_gusts_10m ? Math.round(omH.wind_gusts_10m[i]) : 50,
                rain: omH.precipitation ? Math.round(omH.precipitation[i] * 10) / 10 : 0.0,
                press: omH.surface_pressure ? Math.round(omH.surface_pressure[i] * 10) / 10 : 1005.0
              });
            }
            // Si on avait quelques données Météociel, on complète les trous
            if (hourly.length > 0) {
              const byH = {};
              hourly.forEach(r => { byH[r.h] = r; });
              hourly = fallback24.map(fb => byH[fb.h] || fb);
            } else {
              hourly = fallback24;
            }
          }
        }
      } catch (e) {
        console.warn('[hourly-obs] Open-Meteo archive fallback warn:', e);
      }
    }

    hourly.sort((a, b) => a.h - b.h);

    return res.status(200).json({
      station,
      date,
      count: hourly.length,
      source: hourly.length >= 18 ? 'Météo-France / Météociel' : 'Open-Meteo Reanalysis',
      hourly
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
