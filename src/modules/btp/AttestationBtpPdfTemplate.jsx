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
    excludeWeekends = true,
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

  return (
    <div id="pdf-attestation-btp-container" className="bg-slate-200 text-slate-900 font-sans hidden print:block">
      <div
        id="pdf-attestation-btp-page"
        className="w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_14mm] bg-white mx-auto flex flex-col justify-between relative overflow-hidden box-border shadow-md"
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex justify-between items-center pb-1.5 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <img src="/logo_meteo_climat_pro.png" alt="Météo Climat PRO" className="h-10 w-auto object-contain" />
              <div className="border-l-2 border-slate-300 pl-3">
                <span className="text-[10pt] font-black tracking-wider text-sky-950 uppercase block leading-tight">
                  MÉTÉO CLIMAT PRO
                </span>
                <span className="text-[7pt] text-slate-600 font-bold uppercase tracking-wide">
                  Cabinet d'Expertise & d'Analyse Météorologique BTP • Certification CIBTP
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[6.5pt] uppercase font-extrabold text-slate-500 block tracking-wider">ATTESTATION N°</span>
              <span className="text-[9.5pt] font-mono font-black text-slate-950 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300 inline-block shadow-2xs">
                {reference}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-1 bg-slate-50 border border-slate-200 rounded-lg">
            <h1 className="text-[12.5pt] font-black tracking-tight text-slate-950 uppercase">
              ATTESTATION D'INTEMPÉRIES BTP OFFICIELLE
            </h1>
            <p className="text-[7.5pt] font-bold text-sky-900">
              Certificat Météorologique d'Arrêt de Chantier — Conformité CIBTP & Code du Travail (Art. L. 5424-6)
            </p>
          </div>

          {/* Chantier & Entreprise */}
          <div className="grid grid-cols-2 gap-2 text-[7.5pt]">
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/80 space-y-0.5">
              <div className="text-[7pt] font-black uppercase tracking-wider text-sky-950 border-b border-slate-200 pb-0.5 flex justify-between">
                <span>1. IDENTIFICATION DU CHANTIER & ENTREPRISE</span>
                <span className="text-slate-400 font-mono text-[6.5pt]">BTP</span>
              </div>
              <p><span className="text-slate-500">Chantier :</span> <strong className="text-slate-950 font-bold">{nomChantier}</strong></p>
              <p><span className="text-slate-500">Entreprise :</span> <strong className="text-slate-900">{client}</strong></p>
              <p><span className="text-slate-500">Localisation :</span> <strong>{adresse}</strong></p>
              <p><span className="text-slate-500">Réf. Contrat :</span> <strong className="font-mono text-slate-800">{reference}</strong></p>
            </div>

            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/80 space-y-0.5">
              <div className="text-[7pt] font-black uppercase tracking-wider text-sky-950 border-b border-slate-200 pb-0.5 flex justify-between">
                <span>2. CADRE D'ANALYSE & SEUILS CONTRACTUELS</span>
                <span className="text-slate-400 font-mono text-[6.5pt]">NORMES</span>
              </div>
              <p><span className="text-slate-500">Période analysée :</span> <strong className="text-slate-950 font-bold">{dateDebut} au {dateFin}</strong></p>
              <p><span className="text-slate-500">Jours analysés :</span> <strong>{excludeWeekends ? 'Jours ouvrés uniquement (Lundi à Vendredi)' : 'Jours calendaires (7j/7)'}</strong></p>
              <p><span className="text-slate-500">Poste Météo-France :</span> <strong className="text-sky-900">{referenceStation.name || 'Station synoptique'} ({referenceStation.distance || '12'} km)</strong></p>
              <p><span className="text-slate-500">Seuils retenus :</span> <span className="font-semibold text-slate-800">Vent $\ge$ {thresholds.wind || 60} km/h • Pluie $\ge$ {thresholds.rain || 10} mm • Gel $\le$ {thresholds.temp || 0}°C</span></p>
            </div>
          </div>

          {/* Synthèse des Jours d'Intempéries */}
          <div className="border-2 border-amber-400 rounded-lg p-2 bg-amber-50 text-[7.5pt] flex items-center justify-between shadow-2xs">
            <div>
              <strong className="text-[8.5pt] font-black uppercase tracking-wider text-amber-950 block">
                ⚠️ BILAN OFFICIEL DES JOURS D'INTEMPÉRIES CARACTÉRISÉES
              </strong>
              <span className="text-[7pt] font-bold text-amber-900 block mt-0.5">
                Sur les {summary.totalDaysWorked || 0} jours ouvrés de la période, <strong>{summary.intemperieDaysCount || 0} journée(s) d'arrêt de travail</strong> sont formellement justifiées par dépassement des seuils de sécurité.
              </span>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="text-[12pt] font-black text-rose-700 block leading-tight font-mono">
                {summary.intemperieDaysCount || 0} / {summary.totalDaysWorked || 0} J
              </span>
              <span className="text-[6pt] uppercase font-bold text-slate-600 block">Jours d'arrêt justifiés</span>
            </div>
          </div>

          {/* Tableau Détaillé des Jours Ouvrés */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-[7.8pt] font-black uppercase tracking-wider text-slate-900 border-l-4 border-sky-600 pl-1.5">
                3. RELEVÉS QUOTIDIENS & QUALIFICATION DES ARRÊTS DE CHANTIER (NORME OMM 3S)
              </h2>
              <span className="text-[6pt] text-slate-500 font-bold">Rafales FXI3S certifiées Météo-France</span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[6.8pt] rounded-lg overflow-hidden shadow-2xs">
              <thead>
                <tr className="bg-slate-900 text-white font-black">
                  <th className="border border-slate-300 p-0.5 text-center">Date</th>
                  <th className="border border-slate-300 p-0.5 text-center">Jour</th>
                  <th className="border border-slate-300 p-0.5 text-center">T° Min / Max</th>
                  <th className="border border-slate-300 p-0.5 text-center">Pluie 24h</th>
                  <th className="border border-slate-300 p-0.5 text-center">Rafale Max FXI3S</th>
                  <th className="border border-slate-300 p-0.5 text-center">Statut Chantier</th>
                  <th className="border border-slate-300 p-0.5 text-left">Motif / Dérogation de sécurité</th>
                </tr>
              </thead>
              <tbody>
                {(daysAnalysis || []).slice(0, 16).map((day, idx) => {
                  const isKo = day.isStop;
                  return (
                    <tr
                      key={day.date || idx}
                      className={isKo ? 'bg-rose-50 font-bold' : (idx % 2 === 1 ? 'bg-slate-50/50' : '')}
                    >
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-slate-950">
                        {day.dateFormatted || day.date}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center text-slate-600 uppercase font-bold text-[6pt]">
                        {day.dayName}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono">
                        {day.tn != null ? `${day.tn}°` : '-'} / {day.tx != null ? `${day.tx}°` : '-'}
                      </td>
                      <td className={`border border-slate-300 p-0.5 text-center ${day.rain >= (thresholds.rain || 10) ? 'text-sky-800 font-black' : ''}`}>
                        {day.rain != null ? `${day.rain} mm` : '0 mm'}
                      </td>
                      <td className={`border border-slate-300 p-0.5 text-center ${day.fxi >= (thresholds.wind || 60) ? 'text-rose-700 font-black' : ''}`}>
                        {day.fxi != null ? `${day.fxi} km/h` : 'Non mesuré'}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center">
                        <span className={`px-1.5 py-0.2 rounded text-[5.8pt] font-black uppercase ${
                          isKo ? 'bg-rose-600 text-white shadow-2xs' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isKo ? 'ARRÊT JUSTIFIÉ' : 'PRATICABLE'}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-0.5 text-slate-800 text-[6.2pt]">
                        {day.reason || 'Conditions météo conformes'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Avis & Conclusion Expert */}
          <div>
            <h2 className="text-[7.8pt] font-black uppercase tracking-wider text-slate-900 mb-1 border-l-4 border-sky-600 pl-1.5">
              4. AVIS MOTIVÉ DE L'EXPERT MÉTÉOROLOGUE
            </h2>
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-[7pt] text-slate-900 leading-relaxed shadow-2xs">
              <p className="font-semibold text-slate-950">
                {summary.expertConclusion || `L'analyse des relevés instrumentaux officiels de la station Météo-France de référence (${referenceStation.name || 'Lille-Lesquin'}) établit sans ambiguïté l'existence de conditions physiques d'intempéries sur le chantier "${nomChantier}". Les dépassements relevés justifient pleinement l'interruption des opérations conformément aux prescriptions de l'article L. 5424-6 du Code du Travail et ouvrent droit à la suspension des délais contractuels d'exécution.`}
              </p>
            </div>
          </div>

          {/* Certification & Visa Patrick Marlière */}
          <div>
            <h2 className="text-[7.8pt] font-black uppercase tracking-wider text-slate-900 mb-1 border-l-4 border-sky-600 pl-1.5">
              5. VALIDATION & VISA OFFICIEL MÉTÉO CLIMAT PRO
            </h2>
            <div className="border border-slate-300 rounded-lg p-2 bg-white text-[6.8pt] text-slate-800 flex justify-between items-center shadow-2xs">
              <div className="max-w-[65%] space-y-0.5">
                <p>Certificat délivré à la demande de l'entreprise pour faire valoir ce que de droit auprès de la caisse CIBTP, du maître d'œuvre et des assureurs.</p>
                <p className="text-slate-500 font-medium">Cabinet Patrick Marlière — 400 rue Paul Lafargue, 59283 RAIMBEAUCOURT • Tél : 06 83 90 91 60</p>
              </div>
              <div className="text-right border-l border-slate-200 pl-3">
                <span className="text-[6.5pt] font-bold text-slate-500 block">Certifié conforme par :</span>
                <strong className="text-[8.5pt] font-black text-slate-950 block">Monsieur Patrick MARLIÈRE</strong>
                <span className="text-[6.5pt] text-sky-900 font-bold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 inline-block my-0.5">
                  Directeur Météo-Climat Pro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[6.5pt] text-slate-500">
          <span>Météo Climat PRO — Attestation d'Intempéries BTP Officielle • Normes CIBTP & Code du Travail</span>
          <strong className="text-slate-950">Page 1 / 1</strong>
        </div>
      </div>
    </div>
  );
}
