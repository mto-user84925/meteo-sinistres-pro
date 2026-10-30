import { meteoAuth } from './meteoFranceAuth.js';

const BASE_CLIM_URL = 'https://public-api.meteofrance.fr/public/DPClim/v1';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseISODateUTC = (dateStr) => {
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
};

const formatISODateUTC = (utcMs) => {
  const d = new Date(utcMs);
  return d.toLocaleDateString('sv-SE');
};

const DAY_MS = 86400000;

export const meteoFranceClimService = {
  /**
   * Normalisation du code station (5 chiffres Insee vers 8 chiffres DPClim).
   */
  normalizeStationId(stationId) {
    const s = String(stationId || '').trim();
    if (s.length === 5) return `${s}001`;
    return s;
  },

  /**
   * Récupère l'historique officiel DPClim Quotidien d'une station pour une période.
   * Strict FXI3S (rafale 3 secondes OMM).
   */
  async fetchStationHistory(stationId, startDate, endDate, onProgress = () => {}) {
    if (!stationId || !startDate || !endDate) return [];

    const normId = this.normalizeStationId(stationId);
    const yesterday = new Date(Date.now() - DAY_MS).toLocaleDateString('sv-SE');

    let safeStart = startDate;
    let safeEnd = endDate;

    if (safeStart > yesterday) safeStart = yesterday;
    if (safeEnd > yesterday) safeEnd = yesterday;
    if (safeStart > safeEnd) safeStart = safeEnd;

    try {
      let token = await meteoAuth.getValidToken();
      const deb = safeStart + 'T00:00:00Z';
      const fin = safeEnd + 'T23:59:59Z';

      onProgress(`Commande station ${normId}…`);

      const cmdUrl = `${BASE_CLIM_URL}/commande-station/quotidienne?id-station=${encodeURIComponent(normId)}&date-deb-periode=${encodeURIComponent(deb)}&date-fin-periode=${encodeURIComponent(fin)}`;
      
      const buildHeaders = (t) => ({
        'Authorization': 'Bearer ' + t,
        'apikey': t,
        'Accept': 'application/json'
      });

      let cmdResp = await fetch(cmdUrl, {
        headers: buildHeaders(token)
      });

      if (cmdResp.status === 401) {
        console.warn('[meteoFranceClimService] 401 reçu -> Temporisation spike arrest et rafraîchissement token...');
        await sleep(1500);
        token = await meteoAuth.generateToken();
        cmdResp = await fetch(cmdUrl, {
          headers: buildHeaders(token)
        });
      }

      if (!cmdResp.ok) {
        const errText = await cmdResp.text();
        throw new Error(`Erreur commande Météo-France (${cmdResp.status}): ${errText}`);
      }

      const cmdData = await cmdResp.json();
      const idCmde = cmdData?.elaboreProduitAvecDemandeResponse?.return;
      if (!idCmde) throw new Error('Identifiant de commande non retourné par Météo-France');

      onProgress(`Génération archive Météo-France…`);

      const fileUrl = `${BASE_CLIM_URL}/commande/fichier?id-cmde=${encodeURIComponent(idCmde)}`;
      let csvText = null;

      for (let attempt = 1; attempt <= 15; attempt++) {
        await sleep(2000);
        let fileResp = await fetch(fileUrl, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'apikey': token,
            'Accept': '*/*'
          }
        });

        if (fileResp.status === 200 || fileResp.status === 201) {
          csvText = await fileResp.text();
          break;
        } else if (fileResp.status === 204 || fileResp.status === 404 || fileResp.status === 401) {
          // En cours de génération côté Météo-France (401 initial = cluster backend en préparation)
          onProgress(`Calcul en cours… (${attempt}/15)`);
          await sleep(2500);
        } else if (fileResp.status === 410) {
          break;
        }
      }

      if (!csvText) {
        throw new Error('Délai dépassé lors de la génération du fichier par Météo-France');
      }

      const parsed = this.parseDPClimCSV(csvText);
      return parsed;
    } catch (dpClimErr) {
      console.error(`[meteoFranceClimService] Erreur DPClim pour ${normId}:`, dpClimErr);
      throw dpClimErr;
    }
  },

  /**
   * Récupère l'historique officiel DPClim Horaire d'une station (0h à 23h Heure Légale française).
   * Strict FXI3S (rafale 3 secondes OMM).
   */
  async fetchStationHourlyHistory(stationId, startDate, endDate, onProgress = () => {}) {
    if (!stationId || !startDate || !endDate) return [];

    const normId = this.normalizeStationId(stationId);
    const yesterday = new Date(Date.now() - DAY_MS).toLocaleDateString('sv-SE');

    let safeStart = startDate;
    let safeEnd = endDate;

    if (safeStart > yesterday) safeStart = yesterday;
    if (safeEnd > yesterday) safeEnd = yesterday;
    if (safeStart > safeEnd) safeStart = safeEnd;

    const prevDayMs = parseISODateUTC(safeStart) - DAY_MS;
    const prevDayStr = formatISODateUTC(prevDayMs);
    const deb = `${prevDayStr}T20:00:00Z`;
    const fin = `${safeEnd}T23:59:59Z`;

    onProgress(`Commande horaire DPClim (${safeStart} → ${safeEnd})…`);

    const cmdUrl = `${BASE_CLIM_URL}/commande-station/horaire?id-station=${encodeURIComponent(normId)}&date-deb-periode=${encodeURIComponent(deb)}&date-fin-periode=${encodeURIComponent(fin)}`;

    let token = await meteoAuth.getValidToken();
    let cmdResp = await fetch(cmdUrl, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'apikey': token,
        'Accept': 'application/json'
      }
    });

    if (cmdResp.status === 401) {
      console.warn('[meteoFranceClimService] 401 horaire reçu -> Temporisation spike arrest et renouvellement...');
      await sleep(1500);
      token = await meteoAuth.generateToken();
      cmdResp = await fetch(cmdUrl, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'apikey': token,
          'Accept': 'application/json'
        }
      });
    }

    if (!cmdResp.ok) {
      const errText = await cmdResp.text();
      throw new Error(`Erreur commande horaire DPClim (${cmdResp.status}): ${errText}`);
    }

    const cmdData = await cmdResp.json();
    const idCmde = cmdData?.elaboreProduitAvecDemandeResponse?.return;
    if (!idCmde) throw new Error('Aucun numéro de commande horaire retourné par Météo-France');

    onProgress(`Génération horaire en cours…`);
    await sleep(2500);

    const fileUrl = `${BASE_CLIM_URL}/commande/fichier?id-cmde=${encodeURIComponent(idCmde)}`;
    let csvText = null;

    for (let attempt = 1; attempt <= 15; attempt++) {
      const fileResp = await fetch(fileUrl, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'apikey': token,
          'Accept': '*/*'
        }
      });

      if (fileResp.status === 200 || fileResp.status === 201) {
        csvText = await fileResp.text();
        break;
      } else if (fileResp.status === 401 || fileResp.status === 204 || fileResp.status === 404) {
        onProgress(`Génération horaire en cours… (${attempt}/15)`);
        await sleep(2500);
      } else if (fileResp.status === 410) {
        break;
      }
    }

    if (!csvText) return [];
    return this.parseDPClimHourlyCSV(csvText);
  },

  /**
   * Parser le CSV DPClim Quotidien avec STRICT FXI3S (Norme OMM 3 secondes, exclusion de FXI).
   */
  parseDPClimCSV(csvText) {
    if (!csvText) return [];

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim().toUpperCase());
    const rows = [];

    const idxDate = headers.indexOf('DATE');
    const idxRR = headers.indexOf('RR');
    const idxTN = headers.indexOf('TN');
    const idxHTN = headers.indexOf('HTN');
    const idxTX = headers.indexOf('TX');
    const idxHTX = headers.indexOf('HTX');
    const idxTM = headers.indexOf('TM');
    const idxTAMPLI = headers.indexOf('TAMPLI');
    const idxFXI3S = headers.indexOf('FXI3S');
    const idxHXI3S = headers.indexOf('HXI3S');
    const idxDXI3S = headers.indexOf('DXI3S');
    const idxFF = headers.indexOf('FF');
    const idxOrag = headers.indexOf('ORAG');
    const idxGrele = headers.indexOf('GRELE');
    const idxNeig = headers.indexOf('NEIG');
    const idxGelee = headers.indexOf('GELEE');
    const idxBrou = headers.indexOf('BROU');

    const parseFloatFR = (val) => {
      if (!val || val === '' || val === 'null' || val === 'NaN') return null;
      const clean = val.replace(',', '.').trim();
      const num = parseFloat(clean);
      return isNaN(num) ? null : num;
    };

    const formatHour = (val) => {
      if (!val || val === '' || val === 'null') return '';
      const s = String(val).trim();
      if (s.length === 4) return `${s.substring(0, 2)}h${s.substring(2, 4)}`;
      if (s.length === 3) return `0${s.substring(0, 1)}h${s.substring(1, 3)}`;
      return s;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(';');
      const rawDate = cols[idxDate]?.trim();
      if (!rawDate || rawDate.length !== 8) continue;

      const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

      // STRICT FXI3S (Rafale 3 secondes OMM uniquement, pas de fallback FXI)
      let gustKmh = null;
      let gustHour = '';
      let gustDir = null;

      if (idxFXI3S !== -1 && cols[idxFXI3S]) {
        const ms = parseFloatFR(cols[idxFXI3S]);
        if (ms !== null) {
          gustKmh = Math.round(ms * 3.6);
          gustHour = formatHour(cols[idxHXI3S]);
          gustDir = parseFloatFR(cols[idxDXI3S]);
        }
      }

      const row = {
        date: formattedDate,
        rr: idxRR !== -1 ? (parseFloatFR(cols[idxRR]) ?? 0.0) : 0.0,
        tn: idxTN !== -1 ? parseFloatFR(cols[idxTN]) : null,
        htn: idxHTN !== -1 ? formatHour(cols[idxHTN]) : '',
        tx: idxTX !== -1 ? parseFloatFR(cols[idxTX]) : null,
        htx: idxHTX !== -1 ? formatHour(cols[idxHTX]) : '',
        tm: idxTM !== -1 ? parseFloatFR(cols[idxTM]) : null,
        tampli: idxTAMPLI !== -1 ? parseFloatFR(cols[idxTAMPLI]) : null,
        fxi: gustKmh,
        gust: gustKmh,
        hxi: gustHour,
        dxi: gustDir,
        ff: idxFF !== -1 ? (parseFloatFR(cols[idxFF]) !== null ? Math.round(parseFloatFR(cols[idxFF]) * 3.6) : null) : null,
        orag: idxOrag !== -1 && parseInt(cols[idxOrag], 10) === 1,
        grele: idxGrele !== -1 && parseInt(cols[idxGrele], 10) === 1,
        neig: idxNeig !== -1 && parseInt(cols[idxNeig], 10) === 1,
        gelee: idxGelee !== -1 && parseInt(cols[idxGelee], 10) === 1,
        brou: idxBrou !== -1 && parseInt(cols[idxBrou], 10) === 1
      };

      rows.push(row);
    }

    rows.sort((a, b) => a.date.localeCompare(b.date));
    return rows;
  },

  /**
   * Parser le CSV horaire DPClim avec conversion Heure Légale française (0h à 23h).
   */
  parseDPClimHourlyCSV(csvText) {
    if (!csvText) return [];

    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map(h => h.trim());
    const idxPoste = headers.indexOf('POSTE') !== -1 ? headers.indexOf('POSTE') : headers.indexOf('NUM_POSTE');
    const idxDate = headers.indexOf('DATE');
    const idxT = headers.indexOf('T');
    const idxTN = headers.indexOf('TN');
    const idxTX = headers.indexOf('TX');
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

    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map(c => c.trim());
      if (cols.length < headers.length) continue;

      const rawDate = idxDate !== -1 ? cols[idxDate] : '';
      if (!rawDate || rawDate.length < 10) continue;

      const year = parseInt(rawDate.substring(0, 4), 10);
      const month = parseInt(rawDate.substring(4, 6), 10);
      const day = parseInt(rawDate.substring(6, 8), 10);
      const hour = parseInt(rawDate.substring(8, 10), 10);

      // Météo-France DPClim est en UTC -> Conversion Europe/Paris
      const utcMs = Date.UTC(year, month - 1, day, hour, 0, 0);
      const dtUtc = new Date(utcMs);

      const frParts = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(dtUtc);
      const pVal = (t) => frParts.find(p => p.type === t)?.value || '';
      const localYear = pVal('year');
      const localMonth = pVal('month');
      const localDay = pVal('day');
      const localHour = parseInt(pVal('hour'), 10);
      const localDate = `${localYear}-${localMonth}-${localDay}`;
      const localDt = new Date(parseInt(localYear, 10), parseInt(localMonth, 10) - 1, parseInt(localDay, 10), localHour, 0, 0);

      const temp = parseVal(cols, idxT);
      const tn = parseVal(cols, idxTN);
      const tx = parseVal(cols, idxTX);
      const rr1 = parseVal(cols, idxRR1) ?? 0;
      const ffMS = parseVal(cols, idxFF);
      const ffKmh = ffMS !== null ? Math.round(ffMS * 3.6) : null;
      
      // STRICT FXI3S (3 secondes OMM)
      const fxi3sMS = parseVal(cols, idxFXI3S);
      const fxiKmh = fxi3sMS !== null ? Math.round(fxi3sMS * 3.6) : null;

      const u = parseVal(cols, idxU);
      const pmer = parseVal(cols, idxPMER);

      results.push({
        time: localDt,
        time_utc: dtUtc,
        stationId: idxPoste !== -1 ? cols[idxPoste] : '',
        date: localDate,
        date_local: localDate,
        date_utc: `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`,
        h: localHour,
        h_local: localHour,
        h_utc: hour,
        temp: temp !== null ? temp : (tx !== null && tn !== null ? parseFloat(((tx + tn) / 2).toFixed(1)) : null),
        tn: tn,
        tx: tx,
        rain: rr1,
        wind: ffKmh,
        w_avg: ffKmh || 0,
        gust: fxiKmh,
        w_gst: fxiKmh || 0,
        hum: u,
        humi: u || 0,
        pres: pmer,
        press: pmer || 1013
      });
    }

    return results.sort((a, b) => a.time - b.time);
  }
};
