import React from 'react';
import { Plus, User, LogOut, HardHat, Building2, Shield, Calendar } from 'lucide-react';

export default function Navbar({ onNewDossier, currentUser, onLogout, activeTab, setActiveTab }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-4">
        <div 
          onClick={() => setActiveTab && setActiveTab('dashboard')} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/logo_meteo_climat_pro.png" alt="Météo Climat PRO" className="h-9 w-auto object-contain" />
          <span className="text-[11px] font-mono font-bold text-sky-800 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 hidden lg:inline">
            EXPERTISES & BTP
          </span>
        </div>

        {/* Navigation rapide dans la Navbar pour accès immédiat */}
        {setActiveTab && (
          <nav className="flex items-center gap-1.5 ml-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'dashboard' || activeTab === 'dossiers' || activeTab === 'new' || activeTab === 'analysis'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Sinistres</span>
            </button>

            <button
              onClick={() => setActiveTab('btp-attestation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'btp-attestation'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 font-black'
                  : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Attestations BTP</span>
            </button>

            <button
              onClick={() => setActiveTab('btp-chantiers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'btp-chantiers'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 font-black'
                  : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Chantiers</span>
            </button>

            <button
              onClick={() => setActiveTab('climatology')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 hidden md:flex ${
                activeTab === 'climatology'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Climatologie</span>
            </button>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {currentUser && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-bold hidden sm:flex">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>{currentUser}</span>
          </div>
        )}

        <button
          onClick={onNewDossier}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouveau Sinistre</span>
          <span className="sm:hidden">+ Sinistre</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 transition cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
