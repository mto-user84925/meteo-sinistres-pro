const MASTER_DPCLIM_TOKEN = "eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJHcmVnNTk4ODBAY2FyYm9uLnN1cGVyIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJHcmVnNTk4ODAiLCJ0aWVyUXVvdGFUeXBlIjpudWxsLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjoyMzg0MCwidXVpZCI6IjA3YTRhZjk0LWE4MzktNDllZC05MjJlLTAyZDMyMTM1ZjVlZSJ9LCJpc3MiOiJodHRwczpcL1wvcG9ydGFpbC1hcGkubWV0ZW9mcmFuY2UuZnI6NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiNTBQZXJNaW4iOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6InNlYyJ9LCI2MFJlcVBhck1pbiI6eyJ0aWVyUXVvdGFUeXBlIjoicmVxdWVzdENvdW50IiwiZ3JhcGhRTE1heENvbXBsZXhpdHkiOjAsImdyYXBoUUxNYXhEZXB0aCI6MCwic3RvcE9uUXVvdGFSZWFjaCI6dHJ1ZSwic3Bpa2VBcnJlc3RMaW1pdCI6MCwic3Bpa2VBcnJlc3RVbml0Ijoic2VjIn19LCJrZXl0eXBlIjoiUFJPRFVDVElPTiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkFST01FIiwiY29udGV4dCI6IlwvcHVibGljXC9hcm9tZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW5fbWYiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNWaWdpbGFuY2UiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQVmlnaWxhbmNlXC92MSIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjYwUmVxUGFyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNPYnNlcnZhdGlvbiIsImNvbnRleHQiOiJcL3B1YmxpY1wvRFBPYnNcL3YyIiwicHVibGlzaGVyIjoiYmFzdGllbmciLCJ2ZXJzaW9uIjoidjIiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc1BhcXVldFJhZGFyIiwiY29udGV4dCI6IlwvcHVibGljXC9EUFBhcXVldFJhZGFyXC92MSIsInB1Ymxpc2hlciI6ImxvaWMubWFydGluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNQYXF1ZXRPYnNlcnZhdGlvbiIsImNvbnRleHQiOiJcL3B1YmxpY1wvRFBQYXF1ZXRPYnNcL3YxIiwicHVibGlzaGVyIjoiYmFzdGllbmciLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc09ic2VydmF0aW9uIiwiY29udGV4dCI6IlwvcHVibGljXC9EUE9ic1wvdjEiLCJwdWJsaXNoZXIiOiJiYXN0aWVuZyIsInZlcnNpb24iOiJ2MSIsInN1YnNjcmlwdGlvblRpZXIiOiI1MFBlck1pbiJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJEb25uZWVzUHVibGlxdWVzQ2xpbWF0b2xvZ2llIiwiY29udGV4dCI6IlwvcHVibGljXC9EUENsaW1cL3YxIiwicHVibGlzaGVyIjoiYWRtaW5fbWYiLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc1BhcXVldE9ic2VydmF0aW9uIiwiY29udGV4dCI6IlwvcHVibGljXC9EUFBhcXVldE9ic1wvdjIiLCJwdWJsaXNoZXIiOiJiYXN0aWVuZyIsInZlcnNpb24iOiJ2MiIsInN1YnNjcmlwdGlvblRpZXIiOiI1MFBlck1pbiJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJEb25uZWVzUHVibGlxdWVzTWV0ZW9Gb3JldHMiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQTWV0ZW9Gb3JldHNcL3YxIiwicHVibGlzaGVyIjoibXVyaWVsLmF1YmluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn1dLCJleHAiOjE4MTYwODg5ODAsInRva2VuX3R5cGUiOiJhcGlLZXkiLCJpYXQiOjE3ODc1NzY5ODAsImp0aSI6ImVlOGIyOWU2LTMwOGMtNDk3My05MmMwLWRiZDliZTZhMjdmNyJ9.Dks7MvNXViqUCkZe25rhLNi7wPMTYANHKegyTi1qgiT0PViDjQuJNhNyjkJxDnjHdTrm4Mk9sYZdpMfDYZuYbeV8JWkJj_sGixmZEPO0vyAGqLyq_DOibJvo1_wrMLqS4qFiiOiM6zTmrZiwZz-KBD2Lf_BoVzEV2ve0jHZX9T4F6A3frG9HtrCllVxIONB7nEKpXVsw1bbfbCxvkqPhy_4HUCwQgex4lN58e6TiRI8iRMMYGl_f7jWbCSfAJoE0pHOrQi07BA-mTPD0Lk29i0-YcgrASiehU1vpSQEimBMXCeLdtPNIjr9J_d0KyMcn8rNTu39IJ9pbJ6CTpaoP4Q==";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getDpclimToken() {
  if (process.env.DPCLIM_TOKEN && process.env.DPCLIM_TOKEN.trim().length > 100) {
    return process.env.DPCLIM_TOKEN.trim();
  }
  return MASTER_DPCLIM_TOKEN;
}

function parseDPClimHourlyCsv(csvText, targetDateStr) {
  if (!csvText) return [];
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(';').map(h => h.trim());
  const idxDate = headers.indexOf('DATE');
  const idxT = headers.indexOf('T');
  const idxRR1 = headers.indexOf('RR1');
  const idxFF = headers.indexOf('FF');
  const idxFXI3S = headers.indexOf('FXI3S');
  const idxU = headers.indexOf('U');
  const idxPMER = headers.indexOf('PMER') !== -1 ? headers.indexOf('PMER') : headers.indexOf('PSTAT');

  const parseVal = (cols, idx) => {
    if (idx === -1) return null;
    const v = cols[idx];
    if (!v || v === '' || v === 'null') return null;
    const num = parseFloat(v.replace(',', '.'));
    return isNaN(num) ? null : num;
  };

  const mapByHour = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';').map(c => c.trim());
    if (cols.length < headers.length) continue;

    const rawDate = idxDate !== -1 ? cols[idxDate] : '';
    if (!rawDate || rawDate.length < 10) continue;

    const year = parseInt(rawDate.substring(0, 4), 10);
    const month = parseInt(rawDate.substring(4, 6), 10);
    const day = parseInt(rawDate.substring(6, 8), 10);
    const hour = parseInt(rawDate.substring(8, 10), 10);

    const utcMs = Date.UTC(year, month - 1, day, hour, 0, 0);
    const dtUtc = new Date(utcMs);

    const frParts = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(dtUtc);
    const pVal = (t) => frParts.find(p => p.type === t)?.value || '';
    const localDate = `${pVal('year')}-${pVal('month')}-${pVal('day')}`;
    const localHour = parseInt(pVal('hour'), 10);

    if (localDate !== targetDateStr) continue;

    const temp = parseVal(cols, idxT);
    const humi = parseVal(cols, idxU);
    const rr1 = parseVal(cols, idxRR1) ?? 0;
    const ffMS = parseVal(cols, idxFF);
    const ffKmh = ffMS !== null ? Math.round(ffMS * 3.6) : 0;
    const fxi3sMS = parseVal(cols, idxFXI3S);
    const fxiKmh = fxi3sMS !== null ? Math.round(fxi3sMS * 3.6) : ffKmh;
    const pres = parseVal(cols, idxPMER) ?? 1013;

    mapByHour[localHour] = {
      h: localHour,
      temp: temp !== null ? temp : 15.0,
      humi: humi !== null ? Math.round(humi) : 80,
      w_avg: ffKmh,
      w_gst: fxiKmh,
      rain: rr1,
      press: Math.round(pres * 10) / 10
    };
  }

  const result = [];
  for (let h = 0; h < 24; h++) {
    if (mapByHour[h]) {
      result.push(mapByHour[h]);
    }
  }
  return result;
}

async function fetchStationHourlyCsv(stationId, dateStr, token) {
  const normId = String(stationId).trim().length === 5 ? `${String(stationId).trim()}001` : String(stationId).trim();
  const deb = `${dateStr}T00:00:00Z`;
  const fin = `${dateStr}T23:59:59Z`;

  const cmdUrl = `https://public-api.meteofrance.fr/public/DPClim/v1/commande-station/horaire?id-station=${encodeURIComponent(normId)}&date-deb-periode=${encodeURIComponent(deb)}&date-fin-periode=${encodeURIComponent(fin)}`;

  const headers = {
    'Authorization': 'Bearer ' + token,
    'apikey': token,
    'Accept': 'application/json'
  };

  let cmdResp = await fetch(cmdUrl, { headers });
  if (cmdResp.status === 401) {
    await sleep(1500);
    cmdResp = await fetch(cmdUrl, { headers });
  }

  if (!cmdResp.ok) return null;
  const cmdData = await cmdResp.json();
  const idCmde = cmdData?.elaboreProduitAvecDemandeResponse?.return;
  if (!idCmde) return null;

  const fileUrl = `https://public-api.meteofrance.fr/public/DPClim/v1/commande/fichier?id-cmde=${encodeURIComponent(idCmde)}`;
  for (let attempt = 1; attempt <= 15; attempt++) {
    await sleep(2500);
    const fileResp = await fetch(fileUrl, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'apikey': token,
        'Accept': '*/*'
      }
    });

    if (fileResp.status === 200 || fileResp.status === 201) {
      return await fileResp.text();
    } else if (fileResp.status === 410) {
      break;
    }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { station = '59178001', date = '2026-10-25' } = req.query;

  try {
    const token = getDpclimToken();
    const csv = await fetchStationHourlyCsv(station, date, token);
    let hourly = parseDPClimHourlyCsv(csv, date);

    // Dual-station : si pas de rafales (ex: Douai), fusionner depuis Lille (59343001)
    const hasWind = hourly.some(r => r.w_gst > 0);
    if (!hasWind && station !== '59343001') {
      try {
        await sleep(1500);
        const windCsv = await fetchStationHourlyCsv('59343001', date, token);
        const windHourly = parseDPClimHourlyCsv(windCsv, date);
        if (windHourly.length > 0) {
          const windByH = {};
          windHourly.forEach(w => { windByH[w.h] = w; });
          hourly.forEach(r => {
            if (windByH[r.h]) {
              r.w_avg = windByH[r.h].w_avg;
              r.w_gst = windByH[r.h].w_gst;
            }
          });
        }
      } catch (e) {
        console.warn('[hourly-obs] Dual station fallback error:', e);
      }
    }

    res.status(200).json({
      success: true,
      source: "Réseau Officiel d'Observation Homologué (Météo-France DPClim Horaire)",
      station,
      date,
      count: hourly.length,
      hourly
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des données horaires DPClim',
      details: error.message
    });
  }
}
