import React, { useState, useEffect, useRef } from 'react';
import { 
  HardHat, Calendar, MapPin, Wind, Droplets, Thermometer, 
  AlertTriangle, CheckCircle2, FileCheck, Search, X, Sliders, RefreshCw, ArrowRight, Building2
} from 'lucide-react';
import { geocodingService } from '../../services/geocodingService';
import { stationSelectorService } from '../../services/stationSelectorService';
import { meteoFranceClimService } from '../../services/meteoFranceClimService';
import { pdfGeneratorService } from '../../services/pdfGeneratorService';
import { btpStorageService } from '../../services/btpStorageService';
import AttestationBtpPdfTemplate from './AttestationBtpPdfTemplate';

const FRENCH_DAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

export default function BtpAttestationView({ preselectedChantier = null }) {
  const [nomChantier, setNomChantier] = useState(preselectedChantier?.nom || '');
  const [client, setClient] = useState(preselectedChantier?.client || '');
  const [adresse, setAdresse] = useState(preselectedChantier?.adresse || '');
  const [selectedLocation, setSelectedLocation] = useState(
    preselectedChantier ? { label: preselectedChantier.adresse, lat: preselectedChantier.lat, lon: preselectedChantier.lon } : null
  );

  // Période par défaut : les 15 derniers jours
  const defaultEnd = new Date().toISOString().split('T')[0];
  const defaultStart = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
  const [dateDebut, setDateDebut] = useState(preselectedChantier?.dateDebut || defaultStart);
  const [dateFin, setDateFin] = useState(preselectedChantier?.dateFin || defaultEnd);

  // Seuils CIBTP / Code du travail
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [limitWind, setLimitWind] = useState(60);
  const [limitRain, setLimitRain] = useState(10);
  const [limitTemp, setLimitTemp] = useState(0);
  const [limitHeat, setLimitHeat] = useState(34);

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

  // Fermer la liste BAN lors d'un clic en dehors
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
    setProgressMsg("Recherche de la station Météo-France la plus proche…");

    try {
      const bestStations = stationSelectorService.findBestStations(selectedLocation.lat, selectedLocation.lon, 0, 'vent', 35);
      const refSt = bestStations[0] || { id: '59343001', name: 'Lille-Lesquin', distance: 15 };
      setReferenceStation(refSt);

      setProgressMsg(`Interrogation des relevés Météo-France pour ${refSt.name} (${dateDebut} au ${dateFin})…`);
      const history = await meteoFranceClimService.fetchStationHistory(
        refSt.id,
        dateDebut,
        dateFin,
        (msg) => setProgressMsg(msg)
      );

      // Traitement jour par jour
      const startDt = new Date(dateDebut);
      const endDt = new Date(dateFin);
      const curr = new Date(startDt);

      const days = [];
      let totalDaysWorked = 0;
      let intemperieDaysCount = 0;
      let windStops = 0;
      let rainStops = 0;
      let freezeStops = 0;
      let heatStops = 0;

      while (curr <= endDt) {
        const iso = curr.toISOString().split('T')[0];
        const dayOfWeek = curr.getDay(); // 0 = Dimanche, 6 = Samedi
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (!excludeWeekends || !isWeekend) {
          totalDaysWorked++;

          const obs = history.find(h => h.date === iso) || {};
          const fxi = obs.fxi != null ? obs.fxi : null;
          const rr = obs.rr != null ? obs.rr : 0;
          const tn = obs.tn != null ? obs.tn : null;
          const tx = obs.tx != null ? obs.tx : null;

          let isStop = false;
          const reasons = [];

          if (fxi !== null && fxi >= limitWind) {
            isStop = true;
            windStops++;
            reasons.push(`Vent violent (Rafale ${fxi} km/h $\ge$ ${limitWind} km/h)`);
          }
          if (rr !== null && rr >= limitRain) {
            isStop = true;
            rainStops++;
            reasons.push(`Fortes pluies (${rr} mm $\ge$ ${limitRain} mm)`);
          }
          if (tn !== null && tn <= limitTemp) {
            isStop = true;
            freezeStops++;
            reasons.push(`Gel sous abri (${tn}°C $\le$ ${limitTemp}°C)`);
          }
          if (tx !== null && limitHeat && tx >= limitHeat) {
            isStop = true;
            heatStops++;
            reasons.push(`Canicule extrême (${tx}°C $\ge$ ${limitHeat}°C)`);
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
            isStop,
            reason: reasons.length > 0 ? reasons.join(' • ') : 'Chantier praticable'
          });
        }

        curr.setDate(curr.getDate() + 1);
      }

      setDaysAnalysis(days);

      const conclusion = `L'analyse des relevés instrumentaux certifiés de la station Météo-France de référence (${refSt.name}, ${refSt.distance} km) fait ressortir ${intemperieDaysCount} journée(s) d'intempéries caractérisées sur les ${totalDaysWorked} jours ouvrés de la période du ${dateDebut} au ${dateFin}. Les dépassements observés (${windStops > 0 ? `${windStops}j vent violent, ` : ''}${rainStops > 0 ? `${rainStops}j fortes pluies, ` : ''}${freezeStops > 0 ? `${freezeStops}j gel, ` : ''}${heatStops > 0 ? `${heatStops}j canicule` : ''}) constituent des causes légitimes d'arrêt de travail et justifient la prolongation des délais contractuels conformément aux règles de la CIBTP et de l'article L. 5424-6 du Code du Travail.`;

      setSummary({
        totalDaysWorked,
        intemperieDaysCount,
        intemperieRate: totalDaysWorked > 0 ? Math.round((intemperieDaysCount / totalDaysWorked) * 100) : 0,
        windStops,
        rainStops,
        freezeStops,
        heatStops,
        expertConclusion: conclusion
      });

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
            Module officiel d'analyse des arrêts de chantier — Conformité CIBTP & Code du Travail (Art. L. 5424-6)
          </p>
        </div>
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

        {/* Période & Option Week-ends */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date de début du chantier *</label>
            <input
              type="date"
              required
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date de fin du chantier *</label>
            <input
              type="date"
              required
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={excludeWeekends}
                onChange={e => setExcludeWeekends(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
              />
              <span>Exclure les Samedis & Dimanches (Jours ouvrés)</span>
            </label>
          </div>
        </div>

        {/* Paramétrage des Seuils d'Arrêt de Chantier */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Seuils Réglementaires & Contractuels d'Arrêt de Travaux
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Vent violent (Grue/Levage)</span>
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
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Pluie / Ruissellement</span>
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
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Gel sous abri (Maçonnerie)</span>
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
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">BILAN OFFICIEL CIBTP</span>
                <h2 className="text-xl font-black text-slate-950 mt-0.5">
                  {summary.intemperieDaysCount} Jour(s) d'Arrêt Justifié(s) sur {summary.totalDaysWorked} Jours Ouvrés
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Chantier : <strong>{nomChantier}</strong> ({adresse}) • Station de référence : <strong>{referenceStation?.name} ({referenceStation?.distance} km)</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-black text-white shadow-md transition disabled:opacity-50 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  {isGeneratingPdf ? 'Génération du PDF…' : "Télécharger l'Attestation Officielle BTP (PDF)"}
                </button>
              </div>
            </div>

            {/* 4 KPIs BTP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Vent Violent</span>
                <span className="text-xl font-black text-rose-700 block mt-0.5">{summary.windStops} j</span>
                <span className="text-[10px] text-slate-500">Seuil $\ge$ {limitWind} km/h</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Pluies</span>
                <span className="text-xl font-black text-sky-700 block mt-0.5">{summary.rainStops} j</span>
                <span className="text-[10px] text-slate-500">Seuil $\ge$ {limitRain} mm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Gel</span>
                <span className="text-xl font-black text-indigo-700 block mt-0.5">{summary.freezeStops} j</span>
                <span className="text-[10px] text-slate-500">Seuil $\le$ {limitTemp}°C</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Arrêts Canicule</span>
                <span className="text-xl font-black text-amber-700 block mt-0.5">{summary.heatStops} j</span>
                <span className="text-[10px] text-slate-500">Seuil $\ge$ {limitHeat}°C</span>
              </div>
            </div>
          </div>

          {/* Tableau Détaillé des Jours */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Chronologie Journalière des Conditions Météorologiques ({daysAnalysis.length} jours analysés)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs rounded-xl overflow-hidden shadow-2xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black">
                    <th className="border border-slate-300 p-2 text-center">Date</th>
                    <th className="border border-slate-300 p-2 text-center">Jour</th>
                    <th className="border border-slate-300 p-2 text-center">T° Min / Max</th>
                    <th className="border border-slate-300 p-2 text-center">Pluie 24h</th>
                    <th className="border border-slate-300 p-2 text-center">Rafale Max (FXI3S)</th>
                    <th className="border border-slate-300 p-2 text-center">Statut Chantier</th>
                    <th className="border border-slate-300 p-2 text-left">Motif de Stoppage / Dérogation</th>
                  </tr>
                </thead>
                <tbody>
                  {daysAnalysis.map((day, idx) => (
                    <tr
                      key={day.date}
                      className={day.isStop ? 'bg-rose-50 font-bold' : (idx % 2 === 1 ? 'bg-slate-50/60' : '')}
                    >
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-950">
                        {day.dateFormatted}
                      </td>
                      <td className="border border-slate-300 p-2 text-center uppercase text-[11px] font-bold text-slate-600">
                        {day.dayName}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-mono">
                        {day.tn != null ? `${day.tn}°` : '-'} / {day.tx != null ? `${day.tx}°` : '-'}
                      </td>
                      <td className={`border border-slate-300 p-2 text-center ${day.rain >= limitRain ? 'text-sky-800 font-black' : ''}`}>
                        {day.rain != null ? `${day.rain} mm` : '0 mm'}
                      </td>
                      <td className={`border border-slate-300 p-2 text-center ${day.fxi >= limitWind ? 'text-rose-700 font-black' : ''}`}>
                        {day.fxi != null ? `${day.fxi} km/h` : 'Non mesuré'}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                          day.isStop ? 'bg-rose-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {day.isStop ? 'ARRÊT JUSTIFIÉ' : 'PRATICABLE'}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-900 text-xs">
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
              <strong className="text-slate-900">Document certifié conforme CIBTP</strong>
            </div>
          </div>
        </div>
      )}

      {/* Template PDF invisible pour capture */}
      <AttestationBtpPdfTemplate
        dossierBtp={{
          nomChantier,
          client,
          adresse: adresse || addressQuery,
          dateDebut,
          dateFin,
          excludeWeekends,
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
