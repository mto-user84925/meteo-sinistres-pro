import React from 'react';
import { 
  LayoutDashboard, FolderSearch, Calendar, PlusCircle, 
  HardHat, Building2, Shield 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabsSinistres = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'dossiers', label: 'Dossiers Sinistres', icon: FolderSearch },
    { id: 'new', label: 'Nouveau Sinistre', icon: PlusCircle }
  ];

  const tabsBtp = [
    { id: 'btp-attestation', label: 'Attestation Intempéries', icon: HardHat },
    { id: 'btp-chantiers', label: 'Chantiers BTP & Vigilance', icon: Building2 }
  ];

  const tabsClim = [
    { id: 'climatology', label: 'Climatologie 1950-2026', icon: Calendar }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-4">
        {/* Section Sinistres */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3.5 block mb-1.5">
            Expertise Sinistres
          </span>
          <div className="space-y-1">
            {tabsSinistres.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section BTP Chantiers */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 px-3.5 block mb-1.5">
            BTP & Chantiers
          </span>
          <div className="space-y-1">
            {tabsBtp.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-amber-50/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Climatologie */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3.5 block mb-1.5">
            Données & Archives
          </span>
          <div className="space-y-1">
            {tabsClim.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
        <p className="font-bold text-slate-900">Météo Climat PRO</p>
        <p className="mt-0.5">Assurances • Chantiers BTP • Code du Travail</p>
        <p className="mt-1 font-mono text-[10px] text-sky-700 font-bold">Version 2.0 BTP & Sinistres</p>
      </div>
    </aside>
  );
}
