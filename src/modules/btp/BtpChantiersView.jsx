import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, PlusCircle, MapPin, Calendar, HardHat, Phone, 
  Mail, ArrowRight, Trash2, Wind, Droplets, Thermometer, ShieldCheck, Search, X
} from 'lucide-react';
import { btpStorageService } from '../../services/btpStorageService';
import { geocodingService } from '../../services/geocodingService';

const ALL_LOTS = [
  'Gros œuvre', 'Terrassement / VRD', 'Grues / Levage', 
  'Charpente', 'Couverture / Étanchéité', 'Bardage', 
  'Menuiseries extérieures', 'Peinture extérieure / Ravalement', 'Espaces verts'
];

export default function BtpChantiersView({ onSelectChantierForAttestation }) {
  const [chantiers, setChantiers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulaire d'ajout
  const [nom, setNom] = useState('');
  const [client, setClient] = useState('');
  const [contact, setContact] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
  const [selectedLots, setSelectedLots] = useState(['Gros œuvre', 'Terrassement / VRD']);

  // BAN
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    setChantiers(btpStorageService.getAll());
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
      const results = await geocodingService.searchAddress(addressQuery);
      setAddressSuggestions(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [addressQuery, selectedLocation]);

  const handleCreateChantier = (e) => {
    e.preventDefault();
    if (!nom.trim() || !selectedLocation) {
      alert("Veuillez renseigner le nom du chantier et une adresse valide.");
      return;
    }

    const newChantier = {
      id: 'chantier_' + Date.now(),
      nom: nom.trim(),
      client: client.trim(),
      contact: contact.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      adresse: selectedLocation.label,
      commune: selectedLocation.city || selectedLocation.label,
      codePostal: selectedLocation.postcode || '',
      lat: selectedLocation.lat,
      lon: selectedLocation.lon,
      dateDebut,
      dateFin,
      statut: 'En cours',
      lots: selectedLots
    };

    btpStorageService.save(newChantier);
    setChantiers(btpStorageService.getAll());
    setShowAddModal(false);

    // Reset
    setNom('');
    setClient('');
    setContact('');
    setAddressQuery('');
    setSelectedLocation(null);
  };

  const handleDeleteChantier = (id) => {
    if (confirm("Supprimer ce chantier de la liste ?")) {
      const updated = btpStorageService.delete(id);
      setChantiers(updated);
    }
  };

  const toggleLot = (lot) => {
    setSelectedLots(prev => 
      prev.includes(lot) ? prev.filter(l => l !== lot) : [...prev, lot]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-sky-600" />
            Suivi des Chantiers BTP & Vigilance
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gestion opérationnelle des chantiers — Analyse météo par corps d'état et émission d'attestations CIBTP
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-black text-white shadow-md shadow-sky-600/20 transition cursor-pointer transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          Nouveau Chantier
        </button>
      </div>

      {/* Grille des chantiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chantiers.map(ch => (
          <div key={ch.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-md inline-block">
                  {ch.statut || 'En cours'}
                </span>
                <h3 className="text-base font-black text-slate-950 mt-1.5">{ch.nom}</h3>
                <p className="text-xs font-bold text-slate-600">{ch.client}</p>
              </div>

              <button
                onClick={() => handleDeleteChantier(ch.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 transition"
                title="Supprimer le chantier"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">{ch.adresse}</span>
              </p>
              <p className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Du {ch.dateDebut} au {ch.dateFin}</span>
              </p>
            </div>

            {/* Corps d'état actifs */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Corps d'état / Lots :</span>
              <div className="flex flex-wrap gap-1.5">
                {(ch.lots || []).map((lot, idx) => (
                  <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {lot}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">ID: {ch.id}</span>
              <button
                onClick={() => onSelectChantierForAttestation(ch)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-black text-slate-950 transition shadow-2xs cursor-pointer"
              >
                <HardHat className="w-3.5 h-3.5" />
                Émettre Attestation d'Intempéries
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Ajout Chantier */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                Créer un Nouveau Chantier
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChantier} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Chantier *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    placeholder="Ex: Résidence Onnaing"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Entreprise / Client *</label>
                  <input
                    type="text"
                    required
                    value={client}
                    onChange={e => setClient(e.target.value)}
                    placeholder="Ex: Eiffage Nord"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Adresse BAN */}
              <div className="relative" ref={searchContainerRef}>
                <label className="font-bold text-slate-700 block mb-1">Adresse ou Commune du Chantier *</label>
                <input
                  type="text"
                  required
                  value={addressQuery}
                  onChange={e => setAddressQuery(e.target.value)}
                  placeholder="Rechercher une adresse (ex: Onnaing, Douai)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-sky-500"
                />
                {addressSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-sky-300 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                    {addressSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(loc);
                          setAddressQuery(loc.label);
                          setAddressSuggestions([]);
                        }}
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

              {/* Période */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date de début</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Sélection des Lots */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Lots & Corps d'état concernés :</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LOTS.map(lot => {
                    const isSelected = selectedLots.includes(lot);
                    return (
                      <button
                        key={lot}
                        type="button"
                        onClick={() => toggleLot(lot)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          isSelected 
                            ? 'bg-sky-600 text-white border-sky-600 shadow-2xs' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white shadow-md shadow-sky-600/20"
                >
                  Enregistrer le Chantier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
