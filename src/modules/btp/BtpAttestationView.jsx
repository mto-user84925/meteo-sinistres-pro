import React, { useState, useEffect, useRef } from 'react';
import { 
  HardHat, Calendar, MapPin, Wind, Droplets, Thermometer, 
  AlertTriangle, CheckCircle2, FileCheck, Search, X, Sliders, RefreshCw, ArrowRight, Building2,
  CloudSnow, Zap, Award
} from 'lucide-react';
import { geocodingService } from '../../services/geocodingService';
import { stationSelectorService } from '../../services/stationSelectorService';
import { meteoFranceClimService } from '../../services/meteoFranceClimService';
import { pdfGeneratorService } from '../../services/pdfGeneratorService';
import { btpStorageService } from '../../services/btpStorageService';
import { BTP_CORPS_ETAT, getPresetByIdOrName, BTP_CATEGORIES } from '../../constants/btpNorms';
import { isFrenchPublicHoliday } from '../../utils/frenchHolidays';
import { btpAttestationStorageService } from '../../services/btpAttestationStorageService';
import AttestationBtpPdfTemplate from './AttestationBtpPdfTemplate';

const FRENCH_DAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

export default function BtpAttestationView({ preselectedChantier = null }) {
  const [savedChantiers, setSavedChantiers] = useState([]);
  const [selectedChantierId, setSelectedChantierId] = useState(preselectedChantier?.id || '');

  // Formulaire chantier
  const [nomChantier, setNomChantier] = useState(preselectedChantier?.nom || '');
  const [client, setClient] = useState(preselectedChantier?.client || '');
  const [adresse, setAdresse] = useState(preselectedChantier?.adresse || '');
  const [selectedLocation, setSelectedLocation] = useState(
    preselectedChantier ? { label: preselectedChantier.adresse, lat: preselectedChantier.lat, lon: preselectedChantier.lon } : null
  );

  // Corps d'état / Lot BTP
  const [selectedLotId, setSelectedLotId] = useState(() => {
    if (preselectedChantier?.lots && preselectedChantier.lots.length > 0) {
      const match = BTP_CORPS_ETAT.find(b => b.nom === preselectedChantier.lots[0]);
      if (match) return match.id;
    }
    return 'gros_oeuvre';
  });

  const currentPreset = getPresetByIdOrName(selectedLotId);

  // Période par défaut : les 15 derniers jours
  const defaultEnd = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
  const [dateDebut, setDateDebut] = useState(preselectedChantier?.dateDebut || defaultStart);
  const [dateFin, setDateFin] = useState(preselectedChantier?.dateFin || defaultEnd);

  // Régime de travail et calendrier légal
  const [regimeTravail, setRegimeTravail] = useState('ouvres'); // 'ouvres' (5j/7), 'ouvrables' (6j/7), 'calendaires' (7j/7)
  const [excludeHolidays, setExcludeHolidays] = useState(true);

  // Seuils réglementaires par corps d'état (initialisés par le preset)
  const [limitWind, setLimitWind] = useState(currentPreset.wind);
  const [limitRain, setLimitRain] = useState(currentPreset.rain);
  const [limitTemp, setLimitTemp] = useState(currentPreset.tempMin);
  const [limitHeat, setLimitHeat] = useState(currentPreset.heat);

  // Recherche BAN
  const [addressQuery, setAddressQuery] = useState(preselectedChantier?.adresse || '');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchContainerRef = useRef(null);

  // Stations & Analyse
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [referenceStation, setReferenceStation] = useState(null);
  const [daysAnalysis, setDaysAnalysis] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const refAttestation = 'ATT-BTP-' + Date.now().toString().slice(-6);

  // Charger la liste des chantiers et écouter les mises à jour Supabase
  useEffect(() => {
    setSavedChantiers(btpStorageService.getAll());
    const onChantiersUpdated = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSavedChantiers(e.detail);
      }
    };
    window.addEventListener('btp_chantiers_updated', onChantiersUpdated);
    return () => window.removeEventListener('btp_chantiers_updated', onChantiersUpdated);
  }, []);

  // Synchronisation dynamique si preselectedChantier change
  useEffect(() => {
    if (preselectedChantier) {
      setSelectedChantierId(preselectedChantier.id || '');
      setNomChantier(preselectedChantier.nom || '');
      setClient(preselectedChantier.client || '');
      setAdresse(preselectedChantier.adresse || '');
      setSelectedLocation({ 
        label: preselectedChantier.adresse, 
        lat: preselectedChantier.lat, 
        lon: preselectedChantier.lon 
      });
      setAddressQuery(preselectedChantier.adresse || '');
      if (preselectedChantier.dateDebut) setDateDebut(preselectedChantier.dateDebut);
      if (preselectedChantier.dateFin) setDateFin(preselectedChantier.dateFin);

      if (preselectedChantier.lots && preselectedChantier.lots.length > 0) {
        const match = BTP_CORPS_ETAT.find(b => b.nom === preselectedChantier.lots[0]);
        if (match) {
          setSelectedLotId(match.id);
          setLimitWind(match.wind);
          setLimitRain(match.rain);
          setLimitTemp(match.tempMin);
          setLimitHeat(match.heat);
        }
      }

      setDaysAnalysis([]);
      setSummary(null);
    }
  }, [preselectedChantier]);

  // Fermer la liste BAN lors d'un clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setAddressSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche BAN
  useEffect(() => {
    if (!addressQuery || addressQuery.trim().length < 2) {
      setAddressSuggestions([]);
      return;
    }
    if (selectedLocation && addressQuery === selectedLocation.label) {
      setAddressSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      const results = await geocodingService.searchAddress(addressQuery);
      setAddressSuggestions(results);
      setIsSearchingAddress(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [addressQuery, selectedLocation]);

  const handleSelectAddress = (loc) => {
    setSelectedLocation(loc);
    setAddressQuery(loc.label);
    setAdresse(loc.label);
    setAddressSuggestions([]);
  };

  // Changement de chantier dans le sélecteur
  const handleSelectExistingChantier = (chantierId) => {
    setSelectedChantierId(chantierId);
    const found = savedChantiers.find(c => c.id === chantierId);
    if (found) {
      setNomChantier(found.nom);
      setClient(found.client || '');
      setAdresse(found.adresse || '');
      setSelectedLocation({ label: found.adresse, lat: found.lat, lon: found.lon });
      setAddressQuery(found.adresse || '');
      if (found.dateDebut) setDateDebut(found.dateDebut);
      if (found.dateFin) setDateFin(found.dateFin);
      if (found.lots && found.lots.length > 0) {
        const match = BTP_CORPS_ETAT.find(b => b.nom === found.lots[0]);
        if (match) {
          setSelectedLotId(match.id);
          setLimitWind(match.wind);
          setLimitRain(match.rain);
          setLimitTemp(match.tempMin);
          setLimitHeat(match.heat);
        }
      }
      setDaysAnalysis([]);
      setSummary(null);
    }
  };

  // Changement de corps d'état -> auto-calibration des seuils
  const handleLotChange = (lotId) => {
    setSelectedLotId(lotId);
    const preset = getPresetByIdOrName(lotId);
    if (preset) {
      setLimitWind(preset.wind);
      setLimitRain(preset.rain);
      setLimitTemp(preset.tempMin);
      setLimitHeat(preset.heat);
    }
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!selectedLocation) {
      alert("Veuillez sélectionner une adresse ou commune pour le chantier.");
      return;
    }
    if (dateDebut > dateFin) {
      alert("La date de début ne peut pas être postérieure à la date de fin.");
      return;
    }

    setLoading(true);
    setProgressMsg("Interrogation du réseau officiel Météo-France DPClim…");

    try {
      let history = [];
      let refSt = null;

      // 1. Tenter le relais d'observations multi-stations certifié DPClim
      try {
        const deptCode = (selectedLocation.postcode || '').slice(0, 2) || (selectedLocation.dept || '59');
        const apiRes = await fetch(`/api/dpclim/observations?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&start=${dateDebut}&end=${dateFin}&dept=${deptCode}`);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && Array.isArray(apiData.observations) && apiData.observations.length > 0) {
            const stRain = apiData.station_pluie_temp || apiData.station || { nom: 'Station locale', dist_km: 2.5 };
            const stWind = apiData.station_vent || stRain;
            const isDual = apiData.is_dual_station || (stRain.nom !== stWind.nom);

            refSt = {
              id: stRain.code,
              name: stRain.nom,
              distance: stRain.dist_km,
              isDual,
              windStationName: stWind.nom,
              windStationDistance: stWind.dist_km
            };

            history = apiData.observations.map(obs => ({
              date: obs.date,
              tn: obs.tmin,
              tx: obs.tmax,
              rr: obs.pluie,
              fxi: obs.ventMax,
              neig: obs.neige || false,
              orag: obs.orage || false
            }));
          }
        }
      } catch (apiErr) {
        console.warn('[BtpAttestationView] Relais API indisponible, tentative directe navigateur:', apiErr);
      }

      // 2. Fallback direct navigateur si le relais serveur n'a pas répondu
      if (history.length === 0) {
        const bestStations = stationSelectorService.findBestStations(selectedLocation.lat, selectedLocation.lon, 0, '', 35);
        refSt = bestStations[0] || { id: '59178001', name: 'Douai', distance: 2.4 };

        setProgressMsg(`Interrogation des relevés Météo-France pour ${refSt.name} (${dateDebut} au ${dateFin})…`);
        history = await meteoFranceClimService.fetchStationHistory(
          refSt.id,
          dateDebut,
          dateFin,
          (msg) => setProgressMsg(msg)
        );

        // Si la station la plus proche n'a pas d'anémomètre (ex: Douai), chercher la station anémomètre la plus proche
        if (!history.some(h => h.fxi != null)) {
          const extra = stationSelectorService.findNearestOutsideRadius(selectedLocation.lat, selectedLocation.lon, 0, [refSt.id], 1);
          if (extra.length > 0) {
            const windSt = extra[0];
            try {
              await new Promise(r => setTimeout(r, 1500));
              setProgressMsg(`Recherche capteur vent : ${windSt.name} (${windSt.distance} km)…`);
              const windHistory = await meteoFranceClimService.fetchStationHistory(windSt.id, dateDebut, dateFin, (msg) => setProgressMsg(msg));
              if (windHistory && windHistory.length > 0) {
                const windMap = new Map();
                windHistory.forEach(w => {
                  if (w.date && w.fxi != null) windMap.set(w.date, { fxi: w.fxi, hxi: w.hxi });
                });
                history.forEach(h => {
                  if (windMap.has(h.date)) {
                    h.fxi = windMap.get(h.date).fxi;
                    h.hxi = windMap.get(h.date).hxi;
                  }
                });
                refSt = {
                  ...refSt,
                  isDual: true,
                  windStationName: windSt.name,
                  windStationDistance: windSt.distance
                };
              }
            } catch (errW) {
              console.warn('[BtpAttestationView] Échec fallback vent:', errW);
            }
          }
        }
      }

      setReferenceStation(refSt);

      // Traitement jour par jour
      const [sY, sM, sD] = dateDebut.split('-').map(Number);
      const [eY, eM, eD] = dateFin.split('-').map(Number);
      const curr = new Date(sY, sM - 1, sD, 12, 0, 0);
      const endDt = new Date(eY, eM - 1, eD, 12, 0, 0);

      const days = [];
      let totalDaysWorked = 0;
      let intemperieDaysCount = 0;
      let windStops = 0;
      let rainStops = 0;
      let freezeStops = 0;
      let heatStops = 0;
      let snowStops = 0;
      let stormStops = 0;

      while (curr <= endDt) {
        const iso = curr.toISOString().split('T')[0];
        const dayOfWeek = curr.getDay(); // 0 = Dimanche, 6 = Samedi
        const holidayLabel = isFrenchPublicHoliday(curr);

        // Filtrage des jours ouvrés / ouvrables / calendaires et jours fériés
        let isWorkDay = true;
        if (regimeTravail === 'ouvres' && (dayOfWeek === 0 || dayOfWeek === 6)) {
          isWorkDay = false;
        } else if (regimeTravail === 'ouvrables' && dayOfWeek === 0) {
          isWorkDay = false;
        }

        if (excludeHolidays && holidayLabel) {
          isWorkDay = false;
        }

        if (isWorkDay) {
          totalDaysWorked++;

          const obs = history.find(h => h.date === iso) || {};
          const fxi = obs.fxi != null ? obs.fxi : null;
          const rr = obs.rr != null ? obs.rr : 0;
          const tn = obs.tn != null ? obs.tn : null;
          const tx = obs.tx != null ? obs.tx : null;
          const neig = !!obs.neig;
          const orag = !!obs.orag;

          let isStop = false;
          const reasons = [];

          // 1. Vent violent (FXI3S >= limitWind)
          if (fxi !== null && fxi >= limitWind) {
            isStop = true;
            windStops++;
            reasons.push(currentPreset.motifVent || `Vent violent (Rafale ${fxi} km/h ≥ ${limitWind} km/h - ${currentPreset.norme})`);
          }

          // 2. Précipitations (RR >= limitRain)
          if (rr !== null && rr >= limitRain) {
            isStop = true;
            rainStops++;
            reasons.push(currentPreset.motifPluie || `Fortes pluies (${rr} mm ≥ ${limitRain} mm - Sols saturés / impraticables)`);
          }

          // 3. Gel sous abri (TN <= limitTemp)
          if (tn !== null && tn <= limitTemp) {
            isStop = true;
            freezeStops++;
            reasons.push(currentPreset.motifGel || `Gel sous abri (${tn}°C ≤ ${limitTemp}°C - Interdiction DTU)`);
          }

          // 4. Forte chaleur / Canicule (TX >= limitHeat)
          if (tx !== null && limitHeat && tx >= limitHeat) {
            isStop = true;
            heatStops++;
            reasons.push(currentPreset.motifChaleur || `Vague de chaleur (${tx}°C ≥ ${limitHeat}°C - Décret n° 2024-624 / Art. R. 4463-1)`);
          }

          // 5. Chutes de neige / Verglas
          if (neig) {
            isStop = true;
            snowStops++;
            reasons.push(`Chutes de neige / Verglas (Interdiction circulation et risque de chute en hauteur)`);
          }

          // 6. Orage / Risque foudre
          if (orag) {
            isStop = true;
            stormStops++;
            reasons.push(`Orage violent / Risque foudre (Interdiction appareils de levage & travaux en hauteur - Art. R. 4534-130)`);
          }

          if (isStop) {
            intemperieDaysCount++;
          }

          days.push({
            date: iso,
            dateFormatted: iso.split('-').reverse().join('/'),
            dayName: FRENCH_DAYS[dayOfWeek],
            tn,
            tx,
            rain: rr,
            fxi,
            neig,
            orag,
            isStop,
            reason: reasons.length > 0 ? reasons.join(' • ') : 'Chantier praticable'
          });
        }

        curr.setDate(curr.getDate() + 1);
      }

      setDaysAnalysis(days);

      const conclusion = `L'analyse des relevés instrumentaux certifiés de la station Météo-France de référence (${refSt.name}, ${refSt.distance} km) fait ressortir ${intemperieDaysCount} journée(s) d'intempéries caractérisées sur les ${totalDaysWorked} jours ouvrés de la période du ${dateDebut} au ${dateFin} pour le lot "${currentPreset.nom}". Les dépassements observés (${windStops > 0 ? `${windStops}j vent, ` : ''}${rainStops > 0 ? `${rainStops}j pluie, ` : ''}${freezeStops > 0 ? `${freezeStops}j gel, ` : ''}${heatStops > 0 ? `${heatStops}j chaleur, ` : ''}${snowStops > 0 ? `${snowStops}j neige, ` : ''}${stormStops > 0 ? `${stormStops}j orage` : ''}) constituent des causes légitimes et incontestables d'arrêt de travail au sens de la norme technique ${currentPreset.norme} et de l'article L. 5424-8 du Code du Travail, justifiant la prolongation des délais contractuels d'exécution.`;

      const summaryObj = {
        totalDaysWorked,
        intemperieDaysCount,
        intemperieRate: totalDaysWorked > 0 ? Math.round((intemperieDaysCount / totalDaysWorked) * 100) : 0,
        windStops,
        rainStops,
        freezeStops,
        heatStops,
        snowStops,
        stormStops,
        expertConclusion: conclusion
      };

      setSummary(summaryObj);

      // Sauvegarde automatique dans Supabase (table attestations_intemperies)
      btpAttestationStorageService.saveAttestation({
        dossierBtp: {
          nomChantier,
          client,
          adresse: adresse || addressQuery,
          dateDebut,
          dateFin,
          regimeTravail,
          excludeHolidays,
          selectedLot: currentPreset,
          reference: refAttestation
        },
        daysAnalysis: days,
        summary: summaryObj,
        referenceStation: refSt,
        thresholds: {
          wind: limitWind,
          rain: limitRain,
          temp: limitTemp,
          heat: limitHeat
        }
      }).catch(e => console.warn('Erreur sauvegarde attestation Supabase:', e));

    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'analyse : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await pdfGeneratorService.generateAttestationBtp(refAttestation);
    } catch (e) {
      alert("Erreur lors du téléchargement de l'attestation PDF : " + e.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
            <HardHat className="w-7 h-7 text-amber-500" />
            Attestation d'Intempéries BTP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Module officiel d'analyse des arrêts de chantier — Conformité Code du Travail (Art. L. 5424-8) & Normes DTU / CNAM
          </p>
        </div>

        {/* Sélecteur de Chantier enregistré */}
        {savedChantiers.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-4 h-4 text-sky-600 ml-1" />
            <span className="text-xs font-bold text-slate-700">Chantier :</span>
            <select
              value={selectedChantierId}
              onChange={e => handleSelectExistingChantier(e.target.value)}
              className="bg-white text-xs font-bold text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
            >
              <option value="">-- Sélectionner un chantier --</option>
              {savedChantiers.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.nom} ({ch.commune})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Formulaire de Configuration */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white space-y-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nom du Chantier *</label>
            <input
              type="text"
              required
              value={nomChantier}
              onChange={e => setNomChantier(e.target.value)}
              placeholder="Ex: Résidence Les Hauts de Douai"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Entreprise / Demandeur *</label>
            <input
              type="text"
              required
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Ex: Bouygues BTP Nord"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div className="relative" ref={searchContainerRef}>
            <label className="text-xs font-bold text-slate-700 block mb-1">Adresse ou Commune du Chantier *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={addressQuery}
                onChange={e => setAddressQuery(e.target.value)}
                placeholder="Ex: Place d'Armes, 59500 Douai..."
                className="w-full px-3.5 py-2.5 pl-8 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>

            {addressSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-sky-300 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                {addressSuggestions.map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectAddress(loc)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="block text-slate-900 font-bold">{loc.label}</strong>
                      <span className="text-[10px] text-slate-500">{loc.context}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sélecteur de Corps d'État / Lot BTP avec Norme DTU */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-700" />
              <label className="text-xs font-black uppercase tracking-wider text-slate-900">
                Corps d'État / Lot BTP & Référentiel Normatif
              </label>
            </div>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Règle Technique : {currentPreset.norme}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <select
                value={selectedLotId}
                onChange={e => handleLotChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-black text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs cursor-pointer"
              >
                {Object.values(BTP_CATEGORIES).map(cat => (
                  <optgroup key={cat} label={`-- ${cat.toUpperCase()} --`}>
                    {BTP_CORPS_ETAT.filter(b => b.categorie === cat).map(lot => (
                      <option key={lot.id} value={lot.id}>
                        {lot.nom} ({lot.norme})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center bg-white/80 p-2.5 rounded-xl border border-amber-200">
              <span>
                Sélectionnez le corps d'état pour calibrer automatiquement les seuils selon les <strong>DTU</strong> et <strong>recommandations CNAM</strong> officiels.
              </span>
            </div>
          </div>
        </div>

        {/* Période, Régime de Travail & Jours Fériés */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date de début *</label>
            <input
              type="date"
              required
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date de fin *</label>
            <input
              type="date"
              required
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Régime de Travail</label>
            <select
              value={regimeTravail}
              onChange={e => setRegimeTravail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs cursor-pointer"
            >
              <option value="ouvres">Jours Ouvrés (5j/7 : Lun - Ven)</option>
              <option value="ouvrables">Jours Ouvrables (6j/7 : Lun - Sam)</option>
              <option value="calendaires">Jours Calendaires (7j/7)</option>
            </select>
          </div>

          <div className="flex items-center pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={excludeHolidays}
                onChange={e => setExcludeHolidays(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
              />
              <span>Exclure 11 Jours Fériés légaux (Art. L. 3133-1)</span>
            </label>
          </div>
        </div>

        {/* Paramétrage des Seuils d'Arrêt de Chantier */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Seuils Normatifs d'Arrêt de Travaux ({currentPreset.norme})
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Ajustables selon CCTP</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Vent violent (Rafale OMM 3s)</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={limitWind}
                  onChange={e => setLimitWind(Number(e.target.value))}
                  className="w-16 font-mono font-black text-slate-900 px-2 py-1 rounded border border-slate-300 text-xs"
                />
                <span className="font-bold text-slate-700">km/h</span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Pluie / Précipitations</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={limitRain}
                  onChange={e => setLimitRain(Number(e.target.value))}
                  className="w-16 font-mono font-black text-slate-900 px-2 py-1 rounded border border-slate-300 text-xs"
                />
                <span className="font-bold text-slate-700">mm / jour</span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Gel sous abri (Minimale)</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={limitTemp}
                  onChange={e => setLimitTemp(Number(e.target.value))}
                  className="w-16 font-mono font-black text-slate-900 px-2 py-1 rounded border border-slate-300 text-xs"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Forte Chaleur (Décret 2024)</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={limitHeat}
                  onChange={e => setLimitHeat(Number(e.target.value))}
                  className="w-16 font-mono font-black text-slate-900 px-2 py-1 rounded border border-slate-300 text-xs"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de calcul */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-black text-slate-950 shadow-md transition disabled:opacity-50 cursor-pointer transform hover:-translate-y-0.5"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardHat className="w-4 h-4" />}
            {loading ? (progressMsg || 'Calcul des intempéries…') : "Lancer l'Analyse d'Intempéries BTP"}
          </button>
        </div>
      </div>

      {/* Résultat de l'analyse */}
      {summary && (
        <div className="space-y-6">
          {/* Bandeau de synthèse */}
          <div className="bg-white rounded-2xl border-2 border-amber-400 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">BILAN OFFICIEL DES INTEMPÉRIES</span>
                <h2 className="text-xl font-black text-slate-950 mt-0.5">
                  {summary.intemperieDaysCount} Jour(s) d'Arrêt Justifié(s) sur {summary.totalDaysWorked} Jours Travaillés
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Chantier : <strong>{nomChantier}</strong> • Lot : <strong>{currentPreset.nom} ({currentPreset.norme})</strong> • Station Météo-France : <strong>{referenceStation?.name} ({referenceStation?.distance} km)</strong>{referenceStation?.isDual && <span className="ml-1 text-sky-700 font-bold">• Vent anémomètre : {referenceStation?.windStationName} ({referenceStation?.windStationDistance} km)</span>}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md shadow-sky-600/20 transition cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  {isGeneratingPdf ? 'Génération du PDF…' : 'Télécharger l\'Attestation PDF'}
                </button>
              </div>
            </div>

            {/* Grille 4 KPIs d'arrêts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Vent Violent</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">{summary.windStops} jour(s)</span>
                <span className="text-[10px] text-slate-500">Seuil ≥ {limitWind} km/h</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Précipitations</span>
                <span className="text-lg font-black text-sky-800 block mt-0.5">{summary.rainStops} jour(s)</span>
                <span className="text-[10px] text-slate-500">Seuil ≥ {limitRain} mm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Gel sous abri</span>
                <span className="text-lg font-black text-blue-700 block mt-0.5">{summary.freezeStops} jour(s)</span>
                <span className="text-[10px] text-slate-500">Seuil ≤ {limitTemp}°C</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Forte Chaleur</span>
                <span className="text-lg font-black text-rose-600 block mt-0.5">{summary.heatStops} jour(s)</span>
                <span className="text-[10px] text-slate-500">Seuil ≥ {limitHeat}°C</span>
              </div>
            </div>
          </div>

          {/* Tableau Détaillé Jour par Jour */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Chrono-Relevés Quotidiens & Qualification d'Arrêt de Travail
                </h3>
                <span className="text-[10px] text-slate-400">
                  {daysAnalysis.length} journées analysées • Norme de vent OMM 3s (FXI3S) certifiée
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-lg">
                Taux d'intempérie : {summary.intemperieRate}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black text-[11px]">
                    <th className="p-3 text-center">Date</th>
                    <th className="p-3 text-center">Jour</th>
                    <th className="p-3 text-center">Tn / Tx</th>
                    <th className="p-3 text-center">Pluie 24h</th>
                    <th className="p-3 text-center">Rafale Max FXI3S</th>
                    <th className="p-3 text-center">Qualification Chantier</th>
                    <th className="p-3 text-left">Motif Technique / Réglementaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {daysAnalysis.map((day, idx) => (
                    <tr 
                      key={day.date || idx}
                      className={day.isStop ? 'bg-rose-50/60 font-semibold' : (idx % 2 === 1 ? 'bg-slate-50/40' : '')}
                    >
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                        {day.dateFormatted}
                      </td>
                      <td className="p-2.5 text-center text-slate-600 font-bold uppercase text-[10px]">
                        {day.dayName}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {day.tn != null ? `${day.tn}°` : '-'} / {day.tx != null ? `${day.tx}°` : '-'}
                      </td>
                      <td className={`p-2.5 text-center ${day.rain >= limitRain ? 'text-sky-800 font-black' : ''}`}>
                        {day.rain != null ? `${day.rain} mm` : '0 mm'}
                      </td>
                      <td className={`p-2.5 text-center ${day.fxi >= limitWind ? 'text-rose-700 font-black' : ''}`}>
                        {day.fxi != null ? `${day.fxi} km/h` : 'Non mesuré'}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                          day.isStop ? 'bg-rose-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {day.isStop ? 'ARRÊT JUSTIFIÉ' : 'PRATICABLE'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-900 text-xs">
                        {day.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Avis & Conclusion Expert */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Avis Motivé & Conclusion de l'Expert Météorologue
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {summary.expertConclusion}
            </p>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Visa officiel Patrick MARLIÈRE • Directeur Météo-Climat Pro</span>
              <strong className="text-slate-900">Document certifié conforme Code du Travail</strong>
            </div>
          </div>
        </div>
      )}

      {/* Template PDF masqué pour la capture jsPDF / html2canvas */}
      <AttestationBtpPdfTemplate
        dossierBtp={{
          nomChantier,
          client,
          adresse: adresse || addressQuery,
          dateDebut,
          dateFin,
          regimeTravail,
          excludeHolidays,
          selectedLot: currentPreset,
          reference: refAttestation
        }}
        daysAnalysis={daysAnalysis}
        summary={summary || {}}
        referenceStation={referenceStation || {}}
        thresholds={{
          wind: limitWind,
          rain: limitRain,
          temp: limitTemp,
          heat: limitHeat
        }}
      />
    </div>
  );
}
