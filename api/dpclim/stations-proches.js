import fs from 'fs';
import path from 'path';
import { DEPARTEMENTS_MAP, getDeptInfo } from './_departements.js';

let stationsCache = null;

function loadStations() {
  if (stationsCache) return stationsCache;
  const filePath = path.join(process.cwd(), 'api', 'dpclim', 'stations_data.json');
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    stationsCache = JSON.parse(raw);
  } else {
    stationsCache = [];
  }
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { lat, lon, dept, region, allowedDepts, allowedRegions, limit } = req.query;
  const targetLat = parseFloat(lat || '48.8566');
  const targetLon = parseFloat(lon || '2.3522');
  const maxLimit = parseInt(limit || '20', 10);

  try {
    const all = loadStations();
    let candidates = all;

    // 1. Filtrage par autorisations spécifiques de l'utilisateur (si définies depuis l'admin)
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

    // 2. Filtre optionnel par département ciblé (ou région ciblée)
    if (dept && typeof dept === 'string' && dept.trim()) {
      const cleanDept = dept.trim().padStart(2, '0');
      const deptMatches = candidates.filter((s) => s.d === cleanDept);
      // Si des stations existent dans ce département, on les utilise en priorité
      if (deptMatches.length > 0) {
        candidates = deptMatches;
      }
    } else if (region && typeof region === 'string' && region.trim()) {
      const cleanRegion = region.trim().toLowerCase();
      const regionMatches = candidates.filter((s) => {
        const info = getDeptInfo(s.d);
        return info && info.region.toLowerCase() === cleanRegion;
      });
      if (regionMatches.length > 0) {
        candidates = regionMatches;
      }
    }

    // 3. Calcul de la distance géodésique réelle pour chaque station candidate
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
    const closest = ranked.slice(0, maxLimit);

    return res.status(200).json({
      success: true,
      perimetre: 'France entière (filtrage selon autorisations territoriales admin)',
      total_disponibles: candidates.length,
      stations: closest
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
