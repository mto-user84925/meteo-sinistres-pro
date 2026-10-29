import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function AttestationBtpPdfTemplate({
  dossierBtp = {},
  daysAnalysis = [],
  summary = {},
  referenceStation = {},
  thresholds = {}
}) {
  const {
    nomChantier = 'Chantier BTP',
    client = 'Entreprise BTP',
    adresse = 'Adresse du chantier',
    dateDebut = '',
    dateFin = '',
    regimeTravail = 'ouvres',
    selectedLot = {},
    reference = 'ATT-BTP-2026-001'
  } = dossierBtp;

  const [qrUrl, setQrUrl] = useState('');

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  useEffect(() => {
    QRCode.toDataURL(
      `https://meteo-sinistres-pro.vercel.app/verify-btp/${reference}`,
      { width: 110, margin: 1 }
    ).then(url => setQrUrl(url)).catch(() => setQrUrl(''));
  }, [reference]);

  const regimeLabel = regimeTravail === 'ouvres' 
    ? 'Jours ouvrés uniquement (Lundi à Vendredi - 5j/7)'
    : (regimeTravail === 'ouvrables' ? 'Jours ouvrables (Lundi à Samedi - 6j/7)' : 'Jours calendaires (7j/7)');

  const lotName = selectedLot?.nom || 'Tous corps d\'état';
  const lotNorme = selectedLot?.norme || 'Normes DTU / CNAM';

  // Découpage dynamique : si <= 18 jours -> 1 page ; si > 18 jours -> 2 pages
  const needsTwoPages = daysAnalysis.length > 18;
  const page1Days = needsTwoPages ? daysAnalysis.slice(0, 18) : daysAnalysis;
  const page2Days = needsTwoPages ? daysAnalysis.slice(18) : [];
  const totalPages = needsTwoPages ? 2 : 1;

  const renderTableRows = (days) => (
    days.map((day, idx) => {
      const isKo = day.isStop;
      return (
        <tr
          key={day.date || idx}
          className={isKo ? 'bg-rose-50 font-bold' : (idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white')}
        >
          <td className="border border-slate-300 py-0.5 px-1 text-center font-mono font-bold text-slate-950">
            {day.dateFormatted || day.date}
          </td>
          <td className="border border-slate-300 py-0.5 px-1 text-center text-slate-600 uppercase font-bold text-[5.8pt]">
            {day.dayName}
          </td>
          <td className="border border-slate-300 py-0.5 px-1 text-center font-mono text-[6.2pt]">
            {day.tn != null ? `${day.tn}°` : '-'} / {day.tx != null ? `${day.tx}°` : '-'}
          </td>
          <td className={`border border-slate-300 py-0.5 px-1 text-center text-[6.2pt] ${day.rain >= (thresholds.rain || 10) ? 'text-sky-800 font-black' : ''}`}>
            {day.rain != null ? `${day.rain} mm` : '0 mm'}
          </td>
          <td className={`border border-slate-300 py-0.5 px-1 text-center text-[6.2pt] ${day.fxi >= (thresholds.wind || 60) ? 'text-rose-700 font-black' : ''}`}>
            {day.fxi != null ? `${day.fxi} km/h` : 'Non mesuré'}
          </td>
          <td className="border border-slate-300 py-0.5 px-1 text-center">
            <span className={`px-1.5 py-0.2 rounded text-[5.2pt] font-black uppercase ${
              isKo ? 'bg-rose-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isKo ? 'ARRÊT JUSTIFIÉ' : 'PRATICABLE'}
            </span>
          </td>
          <td className="border border-slate-300 py-0.5 px-1 text-slate-800 text-[5.8pt] leading-tight">
            {day.reason || 'Conditions météo praticables'}
          </td>
        </tr>
      );
    })
  );

  return (
    <div id="pdf-attestation-btp-container" className="bg-slate-100 text-slate-900 font-sans hidden print:block">
      {/* ==================== PAGE 1 ==================== */}
      <div
        className="pdf-attestation-btp-page w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_13mm_8mm_13mm] bg-white mx-auto flex flex-col justify-between relative overflow-hidden box-border shadow-md mb-8"
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
                  Cabinet d'Expertise Météorologique BTP • Code du Travail
                </div>
              </div>
            </div>

            {/* Demandeur / Chantier à droite */}
            <div className="text-left min-w-[240px] border-l-2 border-[#003366] pl-3 py-0.5">
              <div className="text-[9.5pt] font-black text-slate-900 uppercase">
                {nomChantier}
              </div>
              <div className="text-[7.5pt] font-bold text-slate-700">{client}</div>
              <div className="text-[7.5pt] text-slate-700">{adresse}</div>
              <div className="text-[7pt] text-slate-500 font-mono">Lot : {lotName} ({lotNorme})</div>
              <div className="mt-1">
                <span className="bg-[#003366] text-white px-2 py-0.5 rounded text-[7pt] font-bold inline-block shadow-2xs">
                  Réf. {reference}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Titre Principal Minisite Douai (Bleu Roi #003366) */}
          <div className="bg-[#003366] border-2 border-[#003366] rounded-md py-1.5 px-3 text-center text-white shadow-2xs">
            <h1 className="text-[13pt] font-black tracking-wider uppercase m-0 leading-tight">
              ATTESTATION D'INTEMPÉRIES BTP OFFICIELLE
            </h1>
            <div className="text-[8pt] font-extrabold uppercase tracking-wide pt-0.5 mt-0.5 border-t border-white/30 text-white/95">
              Arrêt de Chantier • Conformité Code du Travail (Art. L. 5424-8) & Normes DTU / CNAM
            </div>
          </div>

          {/* 3. Highlight Cards (Bilan d'Arrêt & Paramètres Clés) */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center shadow-2xs">
              <div className="text-[6.5pt] font-bold uppercase text-slate-500">JOURS D'ARRÊT JUSTIFIÉS</div>
              <div className="text-[16pt] font-black text-rose-700 leading-none my-0.5 font-mono">
                {summary.intemperieDaysCount || 0} / {summary.totalDaysWorked || 0}
              </div>
              <div className="text-[6pt] text-slate-500 uppercase font-bold">Jours impactés</div>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center shadow-2xs">
              <div className="text-[6.5pt] font-bold uppercase text-slate-500">RAFALE MAX RELEVÉE</div>
              <div className="text-[16pt] font-black text-[#003366] leading-none my-0.5 font-mono">
                {Math.max(...page1Days.map(d => d.fxi || 0), 0)} <span className="text-[8pt] font-bold text-slate-500">km/h</span>
              </div>
              <div className="text-[6pt] text-slate-500 font-mono">Seuil : {thresholds.wind || 60} km/h</div>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center shadow-2xs">
              <div className="text-[6.5pt] font-bold uppercase text-slate-500">PLUIE MAX 24H</div>
              <div className="text-[16pt] font-black text-sky-900 leading-none my-0.5 font-mono">
                {Math.max(...page1Days.map(d => d.rain || 0), 0)} <span className="text-[8pt] font-bold text-slate-500">mm</span>
              </div>
              <div className="text-[6pt] text-slate-500 font-mono">Seuil : {thresholds.rain || 10} mm</div>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded p-1.5 text-center shadow-2xs">
              <div className="text-[6.5pt] font-bold uppercase text-slate-500">STATUT LOT TECHNIQUE</div>
              <div className="text-[12pt] font-black text-slate-900 leading-tight mt-1 truncate">
                {lotName}
              </div>
              <div className="text-[6pt] text-slate-500 font-mono">{lotNorme}</div>
            </div>
          </div>

          {/* 4. Cadre du Chantier et Paramètres d'Arrêt */}
          <div className="grid grid-cols-2 gap-2 text-[7.2pt]">
            <div className="border border-slate-300 rounded p-1.5 bg-white space-y-0.5">
              <div className="text-[6.8pt] font-black uppercase text-[#003366] border-b border-slate-200 pb-0.5 flex justify-between">
                <span>1. IDENTIFICATION DU CHANTIER & LOT</span>
                <span className="text-slate-400 font-mono text-[6pt]">BTP-ID</span>
              </div>
              <p><span className="text-slate-500">Chantier :</span> <strong className="text-slate-950 font-bold">{nomChantier}</strong></p>
              <p><span className="text-slate-500">Entreprise :</span> <strong className="text-slate-900 font-bold">{client}</strong></p>
              <p><span className="text-slate-500">Adresse :</span> <strong>{adresse}</strong></p>
              <p><span className="text-slate-500">Corps d'état :</span> <strong className="text-[#003366] font-bold">{lotName}</strong> ({lotNorme})</p>
            </div>

            <div className="border border-slate-300 rounded p-1.5 bg-white space-y-0.5">
              <div className="text-[6.8pt] font-black uppercase text-[#003366] border-b border-slate-200 pb-0.5 flex justify-between">
                <span>2. CADRE NORMATIF & STATION MÉTÉO-FRANCE</span>
                <span className="text-slate-400 font-mono text-[6pt]">DPCLIM</span>
              </div>
              <p><span className="text-slate-500">Période analysée :</span> <strong className="text-slate-950 font-bold">{dateDebut} au {dateFin}</strong></p>
              <p><span className="text-slate-500">Régime horaire :</span> <strong>{regimeLabel}</strong></p>
              <p><span className="text-slate-500">Station officielle :</span> <strong className="text-[#003366]">{referenceStation.name || 'Lille-Lesquin'} ({referenceStation.distance || '12'} km)</strong></p>
              <p><span className="text-slate-500">Seuils retenus :</span> <span className="font-semibold text-slate-800">Vent ≥ {thresholds.wind || 60} km/h • Pluie ≥ {thresholds.rain || 10} mm • Gel ≤ {thresholds.temp || 0}°C</span></p>
            </div>
          </div>

          {/* 5. Tableau Détaillé des Jours */}
          <div>
            <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1 flex justify-between items-center">
              <span>3. RELEVÉS QUOTIDIENS ET QUALIFICATION DES ARRÊTS DE CHANTIER (NORME OMM 3S) {needsTwoPages && '(PARTIE 1)'}</span>
              <span className="text-[6pt] text-slate-500 font-bold lowercase">source : météo-france dpclim</span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[6.5pt]">
              <thead>
                <tr className="bg-[#1e293b] text-white font-bold">
                  <th className="border border-slate-400 p-0.5 text-center">Date</th>
                  <th className="border border-slate-400 p-0.5 text-center">Jour</th>
                  <th className="border border-slate-400 p-0.5 text-center">T° Min / Max</th>
                  <th className="border border-slate-400 p-0.5 text-center">Pluie 24h</th>
                  <th className="border border-slate-400 p-0.5 text-center">Rafale FXI3S</th>
                  <th className="border border-slate-400 p-0.5 text-center">Statut Chantier</th>
                  <th className="border border-slate-400 p-0.5 text-left">Motif / Dérogation de sécurité</th>
                </tr>
              </thead>
              <tbody>
                {renderTableRows(page1Days)}
              </tbody>
            </table>
          </div>

          {/* Si 1 seule page, intégrer l'Avis Expert, le Classement et la Signature en Page 1 */}
          {!needsTwoPages && (
            <>
              {/* Avis Expert */}
              <div>
                <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1">
                  4. AVIS MOTIVÉ DE L'EXPERT MÉTÉOROLOGUE
                </div>
                <div className="bg-slate-50 border border-slate-300 border-l-4 border-l-[#003366] p-2 text-[6.8pt] leading-relaxed text-slate-900 text-justify">
                  {summary.expertConclusion || (
                    `L'analyse des relevés instrumentaux officiels de la station Météo-France de référence (${referenceStation.name || 'Lille-Lesquin'}) établit sans ambiguïté l'existence de conditions physiques d'intempéries sur le chantier "${nomChantier}" pour le lot "${lotName}". Les dépassements constatés justifient pleinement l'interruption des opérations conformément aux prescriptions de l'article L. 5424-8 du Code du Travail et ouvrent droit à la suspension des délais contractuels d'exécution.`
                  )}
                </div>
              </div>

              {/* Classement Officiel Minisite Douai */}
              <div className="bg-[#003366] border-2 border-[#003366] rounded p-1.5 text-center text-white">
                <div className="text-[6pt] font-bold uppercase tracking-widest text-sky-200 mb-0.5">
                  ── CLASSEMENT OFFICIEL DES INTEMPÉRIES ──
                </div>
                <div className="text-[9.5pt] font-black tracking-wide uppercase">
                  {summary.intemperieDaysCount > 0 
                    ? `${summary.intemperieDaysCount} JOURNÉE(S) D'ARRÊT DE TRAVAIL CARACTÉRISÉE(S) • CAUSE DE FORCE MAJEURE CLIMATIQUE`
                    : 'CONDITIONS MÉTÉOROLOGIQUES PRATICABLES SUR L\'ENSEMBLE DE LA PÉRIODE'}
                </div>
              </div>

              {/* Validation & Visa Patrick Marlière avec QR Code */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
                <div className="flex items-center gap-2">
                  {qrUrl && <img src={qrUrl} alt="QR Code" className="w-12 h-12 border border-slate-300 p-0.5 rounded bg-white" />}
                  <div className="text-[6.2pt] text-slate-500 leading-tight">
                    <div className="font-bold text-slate-700 uppercase">Attestation BTP Certifiée Opposable</div>
                    <div>Vérification en ligne : <span className="font-mono text-slate-800">meteo-sinistres-pro.vercel.app</span></div>
                    <div className="text-slate-400 font-mono">ID: {reference}</div>
                  </div>
                </div>

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
                    [ Visa d'arrêt de chantier conforme ]
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Page 1 */}
        <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[6.5pt] text-slate-500">
          <span>Météo Climat PRO — Attestation d'Intempéries BTP Officielle • Conformité Code du Travail & Normes DTU</span>
          <strong className="text-slate-950">Page 1 / {totalPages}</strong>
        </div>
      </div>

      {/* ==================== PAGE 2 (SI > 18 JOURS) ==================== */}
      {needsTwoPages && (
        <div
          className="pdf-attestation-btp-page w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_13mm_8mm_13mm] bg-white mx-auto flex flex-col justify-between relative overflow-hidden box-border shadow-md"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div className="space-y-2.5">
            {/* Header compact de rappel */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <img src="/logo_meteo_climat_pro.png" alt="Météo Climat PRO" className="h-8 w-auto object-contain" />
                <span className="text-[9pt] font-black text-[#003366] uppercase">
                  Météo Climat PRO — Suite des Relevés & Certification BTP
                </span>
              </div>
              <div className="text-right">
                <span className="text-[6pt] text-slate-500 block">CHANTIER : {nomChantier}</span>
                <span className="text-[7.5pt] font-mono font-black text-[#003366]">RÉF. {reference}</span>
              </div>
            </div>

            {/* Suite du Tableau */}
            <div>
              <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1 flex justify-between items-center">
                <span>3. SUITE DES RELEVÉS QUOTIDIENS (JOURS 19 À {daysAnalysis.length})</span>
                <span className="text-[6pt] text-slate-500 font-bold lowercase">norme omm 3s (fxi3s)</span>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-[6.5pt]">
                <thead>
                  <tr className="bg-[#1e293b] text-white font-bold">
                    <th className="border border-slate-400 p-0.5 text-center">Date</th>
                    <th className="border border-slate-400 p-0.5 text-center">Jour</th>
                    <th className="border border-slate-400 p-0.5 text-center">T° Min / Max</th>
                    <th className="border border-slate-400 p-0.5 text-center">Pluie 24h</th>
                    <th className="border border-slate-400 p-0.5 text-center">Rafale FXI3S</th>
                    <th className="border border-slate-400 p-0.5 text-center">Statut Chantier</th>
                    <th className="border border-slate-400 p-0.5 text-left">Motif / Dérogation de sécurité</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows(page2Days)}
                </tbody>
              </table>
            </div>

            {/* Avis Expert */}
            <div>
              <div className="bg-slate-100 text-slate-900 px-2 py-0.5 text-[7.5pt] font-black uppercase border-l-4 border-[#003366] mb-1">
                4. AVIS MOTIVÉ DE L'EXPERT MÉTÉOROLOGUE
              </div>
              <div className="bg-slate-50 border border-slate-300 border-l-4 border-l-[#003366] p-2 text-[6.8pt] leading-relaxed text-slate-900 text-justify">
                {summary.expertConclusion || (
                  `L'analyse des relevés instrumentaux officiels de la station Météo-France de référence (${referenceStation.name || 'Lille-Lesquin'}) établit sans ambiguïté l'existence de conditions physiques d'intempéries sur le chantier "${nomChantier}" pour le lot "${lotName}". Les dépassements constatés justifient pleinement l'interruption des opérations conformément aux prescriptions de l'article L. 5424-8 du Code du Travail et ouvrent droit à la suspension des délais contractuels d'exécution.`
                )}
              </div>
            </div>

            {/* Classement Officiel Minisite Douai */}
            <div className="bg-[#003366] border-2 border-[#003366] rounded p-1.5 text-center text-white">
              <div className="text-[6pt] font-bold uppercase tracking-widest text-sky-200 mb-0.5">
                ── CLASSEMENT OFFICIEL DES INTEMPÉRIES ──
              </div>
              <div className="text-[9.5pt] font-black tracking-wide uppercase">
                {summary.intemperieDaysCount > 0 
                  ? `${summary.intemperieDaysCount} JOURNÉE(S) D'ARRÊT DE TRAVAIL CARACTÉRISÉE(S) • CAUSE DE FORCE MAJEURE CLIMATIQUE`
                  : 'CONDITIONS MÉTÉOROLOGIQUES PRATICABLES SUR L\'ENSEMBLE DE LA PÉRIODE'}
              </div>
            </div>

            {/* Validation & Visa Patrick Marlière avec QR Code */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
              <div className="flex items-center gap-2">
                {qrUrl && <img src={qrUrl} alt="QR Code" className="w-12 h-12 border border-slate-300 p-0.5 rounded bg-white" />}
                <div className="text-[6.2pt] text-slate-500 leading-tight">
                  <div className="font-bold text-slate-700 uppercase">Attestation BTP Certifiée Opposable</div>
                  <div>Vérification en ligne : <span className="font-mono text-slate-800">meteo-sinistres-pro.vercel.app</span></div>
                  <div className="text-slate-400 font-mono">ID: {reference}</div>
                </div>
              </div>

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
                  [ Visa d'arrêt de chantier conforme ]
                </div>
              </div>
            </div>
          </div>

          {/* Footer Page 2 */}
          <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[6.5pt] text-slate-500">
            <span>Météo Climat PRO — Attestation d'Intempéries BTP Officielle • Conformité Code du Travail & Normes DTU</span>
            <strong className="text-slate-950">Page 2 / {totalPages}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
