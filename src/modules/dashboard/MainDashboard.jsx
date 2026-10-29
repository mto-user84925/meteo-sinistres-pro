import React from 'react';
import { 
  ShieldCheck, FilePlus, FolderClock, FileText, CheckCircle2, 
  TrendingUp, ArrowRight, Wind, Droplets, Calendar, HardHat, Building2
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';

export default function MainDashboard({ 
  dossiers = [], 
  onNewDossier, 
  onOpenDossier, 
  onGoToClim,
  onGoToBtpAttestation,
  onGoToBtpChantiers 
}) {
  const totalCount = dossiers.length;
  const reportsCount = dossiers.filter(d => d.status === 'Rapport généré').length;
  const inProgressCount = totalCount - reportsCount;

  return (
    <div className="space-y-6">
      {/* Banner Accueil Élégante Claire */}
      <div className="glass-card rounded-2xl p-8 border border-sky-200 shadow-sm relative overflow-hidden bg-gradient-to-r from-sky-50 via-white to-sky-50/50">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-700 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 inline-block mb-3">
            Météo Climat PRO — Plateforme Expertises Sinistres & BTP
          </span>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Générateur d'Attestations Sinistres & Intempéries BTP
          </h1>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
            Rapports d'expertise assurance certifiés (norme OMM 3s FXI3S), calcul des arrêts de chantier selon les seuils réglementaires du Code du Travail, suivi météo des chantiers et climatologie de 1940 à aujourd'hui.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onNewDossier}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              + Nouveau Dossier Sinistre
            </button>

            {onGoToBtpAttestation && (
              <button
                onClick={onGoToBtpAttestation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <HardHat className="w-4 h-4" />
                Attestation Intempéries BTP
              </button>
            )}

            {onGoToBtpChantiers && (
              <button
                onClick={onGoToBtpChantiers}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-amber-500 text-xs font-bold text-slate-800 hover:text-amber-800 transition shadow-xs cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-600" />
                Chantiers BTP & Vigilance
              </button>
            )}

            <button
              onClick={onGoToClim}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-sky-500 text-xs font-bold text-slate-700 hover:text-sky-700 transition shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-600" />
              Archives & Climatologie
            </button>
          </div>
        </div>
      </div>

      {/* 2 Grandes Cartes Métiers : Sinistres vs BTP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carte Sinistres */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 hover:border-sky-300 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">Expertise Sinistres Particuliers & Pros</h3>
              <p className="text-[11px] text-slate-500">Tempêtes, grêle, inondations, foudre & gel</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Générez votre certificat d'intempéries officiel 1 Page ou votre dossier complet 3 Pages (avec tableau 24h et graphismes vectoriels HD) conforme aux exigences des compagnies d'assurance.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              onClick={onNewDossier}
              className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Créer une expertise sinistre <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carte BTP */}
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-3 hover:border-amber-400 transition">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">Intempéries BTP & Arrêts de Chantier</h3>
              <p className="text-[11px] text-slate-500">Conformité Code du Travail (Art. L. 5424-8) & Normes DTU</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Analysez les conditions météo sur la durée de vos travaux, paramétrez les seuils par corps d'état (vent grue 60 km/h, gel 0°C, pluie 10 mm) et éditez votre attestation officielle d'arrêt de chantier.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              onClick={onGoToBtpAttestation}
              className="flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 hover:underline"
            >
              Émettre une attestation BTP <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 StatCards Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dossiers Traités"
          value={totalCount}
          subtitle="Sinistres expertisés"
          icon={FolderClock}
          color="sky"
        />
        <StatCard
          title="Rapports Générés"
          value={reportsCount}
          subtitle="Attestations certifiées"
          icon={FileText}
          color="emerald"
        />
        <StatCard
          title="En Cours d'Analyse"
          value={inProgressCount}
          subtitle="En attente de finalisation"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Réseau Météo-France"
          value="2 418"
          subtitle="Stations connectées"
          icon={ShieldCheck}
          color="indigo"
        />
      </div>

      {/* Liste des Derniers Dossiers */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Dossiers de Sinistres Récents
          </h2>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} au total
          </span>
        </div>

        {dossiers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-medium">
            Aucun dossier de sinistre en cours. Cliquez sur "+ Nouveau Dossier Sinistre" pour commencer.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dossiers.slice(0, 8).map((d) => (
              <div 
                key={d.id} 
                onClick={() => onOpenDossier(d)}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-sky-800">{d.reference}</span>
                  <strong className="block text-xs text-slate-900 mt-0.5">
                    {d.assure?.prenom} {d.assure?.nom} — {d.sinistre?.commune}
                  </strong>
                  <span className="text-[11px] text-slate-500">{d.sinistre?.sinistreType} • {d.sinistre?.dateSinistre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {d.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
