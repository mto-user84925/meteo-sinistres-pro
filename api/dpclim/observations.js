import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEPARTEMENTS_MAP, getDeptInfo } from './_departements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Jeton officiel certifié Réseau Homologué (3 682 caractères)
function getDpclimToken() {
  if (process.env.DPCLIM_TOKEN && process.env.DPCLIM_TOKEN.trim().length > 100) {
    return process.env.DPCLIM_TOKEN.trim();
  }
  const localTokenPath = 'C:\\Users\\grego\\.gemini\\config\\skills\\dpclim\\config\\dpclim_token.txt';
  try {
    if (fs.existsSync(localTokenPath)) {
      const t = fs.readFileSync(localTokenPath, 'utf-8').trim();
      if (t.length > 100) return t;
    }
  } catch (e) {
    // fallback
  }
  return 'eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJHcmVnNTk4ODBAY2FyYm9uLnN1cGVyIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJHcmVnNTk4ODAiLCJ0aWVyUXVvdGFUeXBlIjpudWxsLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjoyMzg0MCwidXVpZCI6IjA3YTRhZjk0LWE4MzktNDllZC05MjJlLTAyZDMyMTM1ZjVlZSJ9LCJpc3MiOiJodHRwczpcL1wvcG9ydGFpbC1hcGkubWV0ZW9mcmFuY2UuZnI6NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiNTBQZXJNaW4iOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6InNlYyJ9LCI2MFJlcVBhck1pbiI6eyJ0aWVyUXVvdGFUeXBlIjoicmVxdWVzdENvdW50IiwiZ3JhcGhRTE1heENvbXBsZXhpdHkiOjAsImdyYXBoUUxNYXhEZXB0aCI6MCwic3RvcE9uUXVvdGFSZWFjaCI6dHJ1ZSwic3Bpa2VBcnJlc3RMaW1pdCI6MCwic3Bpa2VBcnJlc3RVbml0Ijoic2VjIn19LCJrZXl0eXBlIjoiUFJPRFVDVElPTiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkFST01FIiwiY29udGV4dCI6IlwvcHVibGljXC9hcm9tZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW5fbWYiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNWaWdpbGFuY2UiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQVmlnaWxhbmNlXC92MSIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjYwUmVxUGFyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNPYnNlcnZhdGlvbiIsImNvbnRleHQiOiJcL3B1YmxpY1wvRFBPYnNcL3YyIiwicHVibGlzaGVyIjoiYmFzdGllbmciLCJ2ZXJzaW9uIjoidjIiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc1BhcXVldFJhZGFyIiwiY29udGV4dCI6IlwvcHVibGljXC9EUFBhcXVldFJhZGFyXC92MSIsInB1Ymxpc2hlciI6ImxvaWMubWFydGluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNQYXF1ZXRPYnNlcnZhdGlvbiIsImNvbnRleHQiOiJcL3B1YmxpY1wvRFBQYXF1ZXRPYnNcL3YxIiwicHVibGlzaGVyIjoiYmFzdGllbmciLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc09ic2VydmF0aW9uIiwiY29udGV4dCI6IlwvcHVibGljXC9EUE9ic1wvdjEiLCJwdWJsaXNoZXIiOiJiYXN0aWVuZyIsInZlcnNpb24iOiJ2MSIsInN1YnNjcmlwdGlvblRpZXIiOiI1MFBlck1pbiJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJEb25uZWVzUHVibGlxdWVzQ2xpbWF0b2xvZ2llIiwiY29udGV4dCI6IlwvcHVibGljXC9EUENsaW1cL3YxIiwicHVibGlzaGVyIjoiYWRtaW5fbWYiLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc1BhcXVldE9ic2VydmF0aW9uIiwiY29udGV4dCI6IlwvcHVibGljXC9EUFBhcXVldE9ic1wvdjIiLCJwdWJsaXNoZXIiOiJiYXN0aWVuZyIsInZlcnNpb24iOiJ2MiIsInN1YnNjcmlwdGlvblRpZXIiOiI1MFBlck1pbiJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJEb25uZWVzUHVibGlxdWVzTWV0ZW9Gb3JldHMiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQTWV0ZW9Gb3JldHNcL3YxIiwicHVibGlzaGVyIjoibXVyaWVsLmF1YmluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn1dLCJleHAiOjE4MTYwODg5ODAsInRva2VuX3R5cGUiOiJhcGlLZXkiLCJpYXQiOjE3ODc1NzY5ODAsImp0aSI6ImVlOGIyOWU2LTMwOGMtNDk3My05MmMwLWRiZDliZTZhMjdmNyJ9.Dks7MvNXViqUCkZe25rhLNi7wPMTYANHKegyTi1qgiT0PViDjQuJNhNyjkJxDnjHdTrm4Mk9sYZdpMfDYZuYbeV8JWkJj_sGixmZEPO0vyAGqLyq_DOibJvo1_wrMLqS4qFiiOiM6zTmrZiwZz-KBD2Lf_BoVzEV2ve0jHZX9T4F6A3frG9HtrCllVxIONB7nEKpXVsw1bbfbCxvkqPhy_4HUCwQgex4lN58e6TiRI8iRMMYGl_f7jWbCSfAJoE0pHOrQi07BA-mTPD0Lk29i0-YcgrASiehU1vpSQEimBMXCeLdtPNIjr9J_d0KyMcn8rNTu39IJ9pbJ6CTpaoP4Q==';
}
const DPCLIM_TOKEN = getDpclimToken();

let stationsCache = null;

function loadStations() {
  if (stationsCache) return stationsCache;
  const candidates = [
    path.join(process.cwd(), 'api', 'dpclim', 'stations_data.json'),
    typeof __dirname !== 'undefined' ? path.join(__dirname, 'stations_data.json') : null
  ].filter(Boolean);

  for (const fp of candidates) {
    if (fs.existsSync(fp)) {
      try {
        const raw = fs.readFileSync(fp, 'utf-8');
        stationsCache = JSON.parse(raw);
        return stationsCache;
      } catch (e) {}
    }
  }
  stationsCache = [];
  return stationsCache;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 2. Règle absolue sur les Rafales : FXI3S UNIQUEMENT (Exclusion de FXI)
function parseCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(';').map((h) => h.trim().toUpperCase().replace(/^\uFEFF/, ''));
  const idxDate = headers.indexOf('DATE');
  const idxRr = headers.indexOf('RR');
  const idxTn = headers.indexOf('TN');
  const idxTx = headers.indexOf('TX');
  const idxFxi3s = headers.indexOf('FXI3S');

  if (idxDate === -1) return [];

  const obs = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length <= idxDate) continue;

    const dRaw = parts[idxDate].trim();
    if (dRaw.length < 8) continue;
    const dateIso = `${dRaw.slice(0, 4)}-${dRaw.slice(4, 6)}-${dRaw.slice(6, 8)}`;

    const parseNum = (val) => {
      if (!val || !val.trim()) return null;
      const n = parseFloat(val.replace(',', '.').trim());
      return isNaN(n) ? null : n;
    };

    const rr = parseNum(parts[idxRr]) ?? 0.0;
    const tn = parseNum(parts[idxTn]);
    const tx = parseNum(parts[idxTx]);

    // Rafale normalisée 3 secondes UNIQUEMENT (FXI3S) - Exclusion totale du FXI
    const fxi3sMs = idxFxi3s !== -1 ? parseNum(parts[idxFxi3s]) : null;
    const ventMax = fxi3sMs !== null && fxi3sMs > 0 ? Math.round(fxi3sMs * 3.6) : null;

    obs.push({
      date: dateIso,
      tmin: tn !== null ? Math.round(tn * 10) / 10 : null,
      tmax: tx !== null ? Math.round(tx * 10) / 10 : null,
      ventMax,
      pluie: Math.round(rr * 10) / 10
    });
  }
  return obs;
}

// 3. Correction de la requête API Météo-France (queryDpclimApi)
async function queryDpclimApi(stationCode, startDate, endDate) {
  // Normalisation du code station : si le code fait 5 chiffres (ex: 59178), le convertir en 8 chiffres (59178001)
  const normalizedStation = String(stationCode).trim().length === 5 
    ? `${String(stationCode).trim()}001` 
    : String(stationCode).trim();

  // Plafonnement strict à J-1 (hier) : l'API DPClim rejette toute requête incluant aujourd'hui ou le futur avec code 401
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE');
  let safeStart = startDate > yesterday ? yesterday : startDate;
  let safeEnd = endDate > yesterday ? yesterday : endDate;
  if (safeStart > safeEnd) safeStart = safeEnd;

  // Fin de période complète à 23:59:59Z
  const orderUrl = `https://public-api.meteofrance.fr/public/DPClim/v1/commande-station/quotidienne?id-station=${normalizedStation}&date-deb-periode=${safeStart}T00:00:00Z&date-fin-periode=${safeEnd}T23:59:59Z`;

  try {
    let orderRes = await fetch(orderUrl, {
      headers: {
        'apikey': DPCLIM_TOKEN,
        'Authorization': 'Bearer ' + DPCLIM_TOKEN,
        'Accept': 'application/json'
      }
    });

    // En cas de 401 (spike arrest du gateway WSO2), temporiser 1,5s et retenter
    if (orderRes.status === 401) {
      await sleep(1500);
      orderRes = await fetch(orderUrl, {
        headers: {
          'apikey': DPCLIM_TOKEN,
          'Authorization': 'Bearer ' + DPCLIM_TOKEN,
          'Accept': 'application/json'
        }
      });
    }

    if (!orderRes.ok) {
      console.warn(`[DPClim] Échec commande station ${normalizedStation}: HTTP ${orderRes.status}`);
      return null;
    }

    const orderData = await orderRes.json();
    const cmdeId = orderData?.elaboreProduitAvecDemandeResponse?.return;
    if (!cmdeId) {
      console.warn(`[DPClim] Aucun ID de commande retourné pour station ${normalizedStation}`);
      return null;
    }

    const fileUrl = `https://public-api.meteofrance.fr/public/DPClim/v1/commande/fichier?id-cmde=${encodeURIComponent(cmdeId)}`;
    let csvText = null;

    // Polling résilient : Météo-France met entre 2 et 5s. Attendre 2,5s avant premier appel,
    // puis boucler jusqu'à 15 tentatives. Traiter 204, 404 ET 401 initiaux comme « génération en cours »
    for (let attempt = 1; attempt <= 15; attempt++) {
      await sleep(2500);

      const fileRes = await fetch(fileUrl, {
        headers: {
          'apikey': DPCLIM_TOKEN,
          'Authorization': 'Bearer ' + DPCLIM_TOKEN,
          'Accept': '*/*'
        }
      });

      if (fileRes.status === 201 || fileRes.status === 200) {
        const txt = await fileRes.text();
        if (txt && txt.trim().length > 50) {
          csvText = txt;
          break;
        }
      } else if (fileRes.status === 204 || fileRes.status === 404 || fileRes.status === 401) {
        // En cours de génération côté cluster Météo-France (401 initial = cluster backend en préparation)
        continue;
      } else {
        console.warn(`[DPClim] Tentative ${attempt}/15: statut HTTP ${fileRes.status}`);
      }
    }

    if (!csvText) {
      console.warn(`[DPClim] Délai dépassé (15 tentatives) pour commande ${cmdeId}`);
      return null;
    }
    return parseCsv(csvText);
  } catch (err) {
    console.error('DPClim API query error:', err);
    return null;
  }
}

// Fallback sur archive réelle Open-Meteo modèle Météo-France (zéro donnée fictive ou inventée)
async function fetchOpenMeteoArchive(lat, lon, startDate, endDate) {
  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max&timezone=Europe%2FParis`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const daily = data?.daily;
    if (!daily || !daily.time || daily.time.length === 0) return null;

    return daily.time.map((d, i) => ({
      date: d,
      tmin: daily.temperature_2m_min[i] != null ? Math.round(daily.temperature_2m_min[i] * 10) / 10 : null,
      tmax: daily.temperature_2m_max[i] != null ? Math.round(daily.temperature_2m_max[i] * 10) / 10 : null,
      ventMax: daily.wind_gusts_10m_max[i] != null ? Math.round(daily.wind_gusts_10m_max[i]) : null,
      pluie: daily.precipitation_sum[i] != null ? Math.round(daily.precipitation_sum[i] * 10) / 10 : 0.0
    }));
  } catch (e) {
    console.warn('Erreur fallback Open-Meteo archive:', e);
    return null;
  }
}

// 4. Suppression des données fictives / pseudo-aléatoires :
// ponytail: generateCalibratedObs DÉSACTIVÉE — Une attestation juridique BTP ne doit comporter AUCUNE donnée simulée ou fictive.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { lat, lon, start, end, station, dept, allowedDepts, allowedRegions } = req.query;
  const targetLat = parseFloat(lat || '48.8566');
  const targetLon = parseFloat(lon || '2.3522');
  
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE');
  const safeStart = start && start <= yesterday ? start : (start ? yesterday : '2026-09-01');
  const safeEnd = end && end <= yesterday ? end : yesterday;

  try {
    const all = loadStations();
    let candidates = all;

    // 1. Filtrage par autorisations du compte (si définies depuis l'admin)
    const allowedDeptsList = allowedDepts
      ? String(allowedDepts).split(',').map((d) => d.trim().padStart(2, '0')).filter(Boolean)
      : [];
    const allowedRegionsList = allowedRegions
      ? String(allowedRegions).split(',').map((r) => r.trim().toLowerCase()).filter(Boolean)
      : [];

    if (allowedDeptsList.length > 0) {
      candidates = candidates.filter((s) => allowedDeptsList.includes(s.d));
    } else if (allowedRegionsList.length > 0) {
      candidates = candidates.filter((s) => {
        const info = getDeptInfo(s.d);
        return info && allowedRegionsList.includes(info.region.toLowerCase());
      });
    }

    // 2. Filtre par département ciblé (ou région ciblée)
    if (dept && typeof dept === 'string' && dept.trim()) {
      const cleanDept = dept.trim().padStart(2, '0');
      const deptMatches = candidates.filter((s) => s.d === cleanDept);
      if (deptMatches.length > 0) {
        candidates = deptMatches;
      }
    }

    // 3. Classement de toutes les stations par distance géodésique
    const ranked = candidates.map((s) => {
      const info = getDeptInfo(s.d);
      return {
        code: s.c,
        nom: s.n,
        dept: s.d,
        dept_nom: info ? info.nom : s.d,
        zone: info ? info.region : 'France',
        dist_km: Math.round(haversineKm(targetLat, targetLon, s.la, s.lo) * 10) / 10,
        has_rain_temp: s.rt === 1,
        has_wind: s.w === 1
      };
    });
    ranked.sort((a, b) => a.dist_km - b.dist_km);
    const closest = ranked.slice(0, 15);

    // 4. Sélection de la station de référence (pluie/température et vent)
    let stRainTemp = ranked.find((s) => s.has_rain_temp) || ranked[0] || {
      code: '00000000',
      nom: 'Station locale',
      dept: dept || '75',
      dist_km: 2.5,
      has_rain_temp: true,
      has_wind: true
    };
    let stWind = stRainTemp.has_wind ? stRainTemp : (ranked.find((s) => s.has_wind) || stRainTemp);
    let isDual = stRainTemp.code !== stWind.code;

    // Si une station explicite est demandée, vérifier qu'elle correspond bien au département du chantier
    if (station) {
      const explicit = all.find((s) => s.c === station);
      const cleanDept = dept ? dept.trim().padStart(2, '0') : null;
      if (explicit && (!cleanDept || explicit.d === cleanDept)) {
        const info = getDeptInfo(explicit.d);
        stRainTemp = {
          code: explicit.c,
          nom: explicit.n,
          dept: explicit.d,
          dept_nom: info ? info.nom : explicit.d,
          zone: info ? info.region : 'France',
          dist_km: Math.round(haversineKm(targetLat, targetLon, explicit.la, explicit.lo) * 10) / 10,
          has_rain_temp: explicit.rt === 1,
          has_wind: explicit.w === 1
        };
        stWind = explicit.w === 1 ? stRainTemp : (ranked.find((s) => s.has_wind) || stRainTemp);
        isDual = stRainTemp.code !== stWind.code;
      }
    }

    // 5. Récupération des relevés réels Météo-France DPClim
    let obs = await queryDpclimApi(stRainTemp.code, safeStart, safeEnd);

    // Traitement Dual-Station : si la station pluie/température n'a pas de capteur vent (ex: Douai w: 0),
    // interroger la station anémomètre de référence (ex: Lille w: 1) et fusionner les rafales FXI3S certifiées
    if (isDual && stWind && stWind.code !== stRainTemp.code) {
      try {
        await sleep(1500); // Évite de saturer la limite spike arrest du gateway Météo-France
        const obsWind = await queryDpclimApi(stWind.code, safeStart, safeEnd);
        if (obsWind && obsWind.length > 0) {
          const windMap = new Map();
          obsWind.forEach((w) => {
            if (w.date && w.ventMax != null) {
              windMap.set(w.date, w.ventMax);
            }
          });
          if (obs && obs.length > 0) {
            obs = obs.map((o) => ({
              ...o,
              ventMax: o.ventMax != null ? o.ventMax : (windMap.get(o.date) ?? null)
            }));
          }
        }
      } catch (errWind) {
        console.warn('Erreur récupération vent station dual:', errWind);
      }
    }

    const isCertifiedDpclim = Array.isArray(obs) && obs.length > 0;

    // 6. Fallback robuste sur observations réelles d'archive Open-Meteo si DPClim est temporairement indisponible
    if (!obs || obs.length === 0) {
      obs = await fetchOpenMeteoArchive(targetLat, targetLon, safeStart, safeEnd);
    }

    // 7. Si aucune observation certifiée n'est disponible, alerte claire (aucune donnée simulée ou fictive)
    if (!obs || obs.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Aucune observation météorologique certifiée disponible pour la station ${stRainTemp.nom} (${stRainTemp.code}) sur la période du ${safeStart} au ${safeEnd}. Données simulées formellement interdites pour conformité juridique.`
      });
    }

    return res.status(200).json({
      success: true,
      source: isCertifiedDpclim ? 'Réseau Officiel d Observation Homologué (Météo-France DPClim)' : 'Estimation Modèle Réanalyse Open-Meteo (Non Homologué DPClim)',
      station: stRainTemp,
      station_pluie_temp: stRainTemp,
      station_vent: stWind,
      is_dual_station: isDual,
      stations_proches: closest,
      observations: obs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
