import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function CertificatIntemperies1Page({ 
  dossier = {}, 
  stationsData = [], 
  insuranceDecision = null,
  vigilanceStatus = null
}) {
  const { sinistre = {}, assure = {}, reference = 'MCP-2026-XXXX' } = dossier;
  const activeStations = stationsData.slice(0, 5);
  const primaryStation = stationsData[0] || {};

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const [qrUrl, setQrUrl] = useState('');
  useEffect(() => {
    QRCode.toDataURL(
      `https://meteo-sinistres-pro.vercel.app/verify/${reference}`,
      { width: 110, margin: 1 }
    ).then(url => setQrUrl(url)).catch(() => setQrUrl(''));
  }, [reference]);

  // Détermination de la valeur highlight
  const isWind = (sinistre.sinistreType || '').toLowerCase().match(/vent|temp|rafale/);
  const isRain = (sinistre.sinistreType || '').toLowerCase().match(/pluie|inondation|submersion/);
  
  let highlightTitle = "RAFALE MAX CONSTATÉE AU SOL";
  let highlightVal = primaryStation.obs?.fxi != null ? primaryStation.obs.fxi : '-';
  let highlightUnit = "km/h";
  let highlightSub = `Pic relevé le ${sinistre.dateSinistre || todayStr} à ${primaryStation.obs?.hxi || sinistre.heureSinistre || '12h00'} • Norme officielle OMM 3s`;

  if (isRain) {
    highlightTitle = "CUMUL PLUIE 24H CONSTATÉ";
    highlightVal = primaryStation.obs?.rr != null ? primaryStation.obs.rr : '-';
    highlightUnit = "mm";
    highlightSub = `Cumul précipitations du ${sinistre.dateSinistre || todayStr} • Mesure pluviomètre certifiée`;
  } else if (!isWind && (primaryStation.obs?.tx != null || primaryStation.obs?.tn != null)) {
    highlightTitle = "TEMPÉRATURE EXTRÊME RELEVÉE";
    highlightVal = `${primaryStation.obs?.tn ?? '-'} / ${primaryStation.obs?.tx ?? '-'}`;
    highlightUnit = "°C";
    highlightSub = `Relevé sous abri normalisé le ${sinistre.dateSinistre || todayStr}`;
  }

  const isFavorable = insuranceDecision?.isFavorable ?? (primaryStation.obs?.fxi >= 100);

  return (
    <div id="pdf-certificat-container" className="bg-slate-100 text-slate-900 font-sans hidden print:block">
      <div 
        id="pdf-certificat-page" 
        className="w-[210mm] h-[297mm] max-h-[297mm] p-[10mm_13mm_8mm_13mm] bg-white mx-auto flex flex-col justify-between relative overflow-hidden box-border shadow-md"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <div className="space-y-2">
          {/* 1. Header combiné façon Minisite Douai */}
          <div className="flex justify-between items-start pb-2 border-b border-slate-200">
            {/* Émetteur à gauche */}
            <div className="flex items-start gap-3">
              <img 
                src="/logo_meteo_climat_pro.png" 
                alt="MÉTÉO CLIMAT PRO" 
                className="h-11 w-auto object-contain" 
              />
              <div className="border-l-2 border-slate-300 pl-3 text-[7.8pt] text-slate-600 leading-snug">
                <div className="text-[9.5pt] font-black uppercase text-[#003366] tracking-wide">
                  MÉTÉO CLIMAT PRO
                </div>
                <div>400 rue Paul Lafargue</div>
                <div>59283 RAIMBEAUCOURT</div>
                <div>Tél : <span className="font-bold text-slate-800">06 83 90 91 60</span></div>
                <div className="text-[7pt] font-bold text-[#003366] uppercase tracking-wider pt-0.5">
                  Cabinet d'Expertise Météo-Climatologique
                </div>
              </div>
            </div>

            {/* Demandeur / Client à droite */}
            <div className="text-left min-w-[240px] border-l-2 border-[#003366] pl-3 py-0.5">
              <div className="text-[9.5pt] font-black text-slate-900 uppercase">
                {assure.prenom} {assure.nom}
              </div>
              {assure.societe && (
                <div className="text-[7.5pt] font-bold text-slate-700">{assure.societe}</div>
              )}
              <div className="text-[7.5pt] text-slate-700">{sinistre.adresseSinistre || sinistre.commune}</div>
              <div className="text-[7.5pt] text-slate-700">{sinistre.codePostal} {sinistre.commune}</div>
              {assure.compagnieAssurance && (
                <div className="text-[7pt] text-slate-500">Cie : {assure.compagnieAssurance}</div>
              )}
              <div className="mt-1">
                <span className="bg-[#003366] text-white px-2 py-0.5 rounded text-[7pt] font-bold inline-block shadow-2xs">
                  Réf. {reference}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Titre Principal Minisite Douai (Bleu Roi #003366) */}
          <div className="bg-[#003366] border-2 border-[#003366] rounded-md py-1.5 px-3 text-center text-white shadow-2xs">
            <h1 className="text-[14pt] font-black tracking-wider uppercase m-0 leading-tight">
              CERTIFICAT D'INTEMPÉRIE
            </h1>
            <div className="text-[8.5pt] font-extrabold uppercase tracking-wide pt-0.5 mt-0.5 border-t border-white/30 text-white/95">
              {sinistre.sinistreType || 'VENT VIOLENT / TEMPÊTE'}
            </div>
          </div>

          {/* 3. Highlight Card (Carte Phénomène Minisite Douai) */}
          <div className="bg-slate-50 border border-slate-300 rounded p-2 text-center shadow-2xs">
            <div className="text-[7pt] font-bold uppercase text-slate-500 tracking-wider">
              {highlightTitle}
            </div>
            <div className="text-[20pt] font-black text-[#003366] leading-none my-0.5">
              <span>{highlightVal}</span>
              <span className="text-[10pt] font-bold text-slate-500 ml-1">{highlightUnit}</span>
            </div>
            <div className="text-[6.8pt] text-slate-600 font-mono">
              {highlightSub}
            </div>
          </div>

          {/* 4. Description de la situation météorologique */}
          <div>
            <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1">
              DESCRIPTION DE LA SITUATION MÉTÉOROLOGIQUE
            </div>
            <div className="text-[7.2pt] leading-relaxed text-slate-800 text-justify bg-white p-1 rounded border border-slate-200">
              {sinistre.description || sinistre.observations || (
                `L'analyse des champs de pression et des observations synoptiques confirme le passage d'une dépression dynamique sur le secteur de ${sinistre.commune} (${sinistre.codePostal}) le ${sinistre.dateSinistre}. Le resserrement isobarique a engendré des vents tempétueux accompagnés de rafales soutenues sur les stations de référence du réseau officiel.`
              )}
            </div>
          </div>

          {/* 5. Mesures Observées - Station de Référence */}
          <div>
            <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1">
              MESURES OBSERVÉES - STATION OFFICIELLE DE RÉFÉRENCE
            </div>
            <div className="text-[6.8pt] text-slate-600 italic mb-1 flex justify-between items-center">
              <span>
                Station officielle : <strong className="text-[#003366] font-bold">{primaryStation.name || 'Station Météo-France'} ({primaryStation.id || 'Poste'})</strong> • Distance du sinistre : <strong className="text-slate-900">{primaryStation.distance || 0} km</strong> • Alt : {primaryStation.alt || 0} m
              </span>
              <span className="text-[6pt] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-bold">
                Source : Météo-France DPClim
              </span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[7.2pt]">
              <thead>
                <tr className="bg-[#1e293b] text-white font-bold">
                  <th className="border border-slate-400 p-1 text-left">PARAMÈTRE</th>
                  <th className="border border-slate-400 p-1 text-center">VALEUR RELEVÉE</th>
                  <th className="border border-slate-400 p-1 text-center">HEURE / PÉRIODE</th>
                  <th className="border border-slate-400 p-1 text-center">SEUIL CONTRAT</th>
                  <th className="border border-slate-400 p-1 text-center">STATUT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 bg-white">
                  <td className="p-1 font-bold text-slate-900">Rafale Max FXI3S (Norme OMM 3s)</td>
                  <td className="p-1 text-center font-black text-[#003366]">
                    {primaryStation.obs?.fxi != null ? `${primaryStation.obs.fxi} km/h` : 'Non mesuré'}
                  </td>
                  <td className="p-1 text-center font-mono text-slate-600">{primaryStation.obs?.hxi || sinistre.heureSinistre || '-'}</td>
                  <td className="p-1 text-center font-mono text-slate-500">100 km/h (Art. L. 122-7)</td>
                  <td className="p-1 text-center">
                    <span className={`px-1.5 py-0.2 rounded text-[6pt] font-black uppercase ${
                      (primaryStation.obs?.fxi || 0) >= 100 ? 'bg-rose-600 text-white' : ((primaryStation.obs?.fxi || 0) >= 80 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800')
                    }`}>
                      {(primaryStation.obs?.fxi || 0) >= 100 ? 'SEUIL FRANCHI' : ((primaryStation.obs?.fxi || 0) >= 80 ? 'COUP DE VENT' : 'INFÉRIEUR')}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <td className="p-1 font-bold text-slate-900">Précipitations 24h (Pluie)</td>
                  <td className="p-1 text-center font-black text-sky-900">
                    {primaryStation.obs?.rr != null ? `${primaryStation.obs.rr} mm` : '0 mm'}
                  </td>
                  <td className="p-1 text-center font-mono text-slate-600">Cumul 24h</td>
                  <td className="p-1 text-center font-mono text-slate-500">40 mm</td>
                  <td className="p-1 text-center">
                    <span className={`px-1.5 py-0.2 rounded text-[6pt] font-black uppercase ${
                      (primaryStation.obs?.rr || 0) >= 40 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {(primaryStation.obs?.rr || 0) >= 40 ? 'SEUIL FRANCHI' : 'NORMAL'}
                    </span>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="p-1 font-bold text-slate-900">Températures Min / Max</td>
                  <td className="p-1 text-center font-bold text-slate-800">
                    {primaryStation.obs?.tn != null ? `${primaryStation.obs.tn}°C` : '-'} / {primaryStation.obs?.tx != null ? `${primaryStation.obs.tx}°C` : '-'}
                  </td>
                  <td className="p-1 text-center font-mono text-slate-600">Journée</td>
                  <td className="p-1 text-center font-mono text-slate-500">Seuil Gel 0°C</td>
                  <td className="p-1 text-center">
                    <span className="px-1.5 py-0.2 rounded text-[6pt] font-bold bg-slate-100 text-slate-700">
                      {(primaryStation.obs?.tn || 10) <= 0 ? 'GEL CONSTATÉ' : 'SANS GEL'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 6. Stations Environnantes (Rayon 30 km) Minisite Douai */}
          {activeStations.length > 1 && (
            <div>
              <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1">
                COMPARAISON DES STATIONS DU SECTEUR (RAYON 30 KM)
              </div>
              <table className="w-full border-collapse border border-slate-300 text-[6.8pt]">
                <thead>
                  <tr className="bg-[#1e293b] text-white font-bold">
                    <th className="border border-slate-400 p-1 text-left">POSTE OFFICIEL</th>
                    <th className="border border-slate-400 p-1 text-center">DISTANCE</th>
                    <th className="border border-slate-400 p-1 text-center">RAFALE MAX (3s)</th>
                    <th className="border border-slate-400 p-1 text-center">HEURE</th>
                    <th className="border border-slate-400 p-1 text-center">PLUIE 24H</th>
                    <th className="border border-slate-400 p-1 text-center">T° MIN / MAX</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStations.map((st, i) => (
                    <tr key={st.id || i} className={i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="p-1 border border-slate-300 font-bold text-slate-900">
                        {st.name} <span className="text-[5.8pt] font-mono text-slate-500">({st.id})</span>
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-mono font-bold text-slate-700">
                        {st.distance} km
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-black text-[#003366]">
                        {st.obs?.fxi != null ? `${st.obs.fxi} km/h` : 'Non mesuré'}
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-mono text-slate-600">
                        {st.obs?.hxi || '-'}
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-bold text-sky-900">
                        {st.obs?.rr != null ? `${st.obs.rr} mm` : '0 mm'}
                      </td>
                      <td className="p-1 border border-slate-300 text-center font-mono text-slate-700">
                        {st.obs?.tn != null ? `${st.obs.tn}°` : '-'} / {st.obs?.tx != null ? `${st.obs.tx}°` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 7. Conclusion de l'Analyse d'Expertise */}
          <div>
            <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1">
              CONCLUSION DE L'ANALYSE D'EXPERTISE
            </div>
            <div className="bg-slate-50 border border-slate-300 border-l-4 border-l-[#003366] p-2 text-[7.2pt] leading-relaxed text-slate-900 text-justify">
              {insuranceDecision?.commentExpert || (
                `Au regard des relevés instrumentaux officiels certifiés Météo-France dans le rayon de 30 km, les conditions météorologiques observées le ${sinistre.dateSinistre} sur la commune de ${sinistre.commune} caractérisent pleinement l'événement réclamé. Les valeurs relevées corroborent la réalité matérielle des dommages déclarés. Avis d'expertise favorable à la prise en charge au titre des garanties contractuelles.`
              )}
            </div>
          </div>

          {/* 8. Classement Officiel Minisite Douai */}
          <div className="bg-[#003366] border-2 border-[#003366] rounded p-2 text-center text-white">
            <div className="text-[6.5pt] font-bold uppercase tracking-widest text-sky-200 mb-0.5">
              ── CLASSEMENT DE L'ÉVÉNEMENT ──
            </div>
            <div className="text-[10pt] font-black tracking-wide uppercase">
              {isFavorable ? 'ÉVÉNEMENT TEMPÊTE CARACTÉRISÉ • GARANTIE ACQUISE' : 'CONDITIONS INTEMPÉRIES CARACTÉRISÉES'}
            </div>
          </div>
        </div>

        {/* 9. Bloc Signature & Visa Patrick Marlière (Façon Minisite Douai) */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
          {/* QR Code et vérification */}
          <div className="flex items-center gap-2">
            {qrUrl && <img src={qrUrl} alt="QR Code" className="w-12 h-12 border border-slate-300 p-0.5 rounded" />}
            <div className="text-[6.2pt] text-slate-500 leading-tight">
              <div className="font-bold text-slate-700 uppercase">Document Certifié Opposable</div>
              <div>Authentification en ligne : <span className="font-mono text-slate-800">meteo-sinistres-pro.vercel.app</span></div>
              <div className="text-slate-400 font-mono">ID: {reference}</div>
            </div>
          </div>

          {/* Signature à droite */}
          <div className="text-right">
            <div className="text-[7.2pt] italic text-slate-600 mb-0.5">
              Fait à Raimbeaucourt, le {todayStr}
            </div>
            <div className="text-[7.2pt] font-bold text-[#003366] uppercase underline decoration-1 mb-1">
              Signature de l'expert
            </div>
            <div className="text-[9pt] font-black text-[#003366] uppercase">
              Patrick Marlière
            </div>
            <div className="text-[6.5pt] font-bold text-slate-600 uppercase">
              Directeur Météo-Climat Pro
            </div>
            <div className="text-[5.8pt] font-mono text-slate-400 italic">
              [ Visa officiel & cachet certifié ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
