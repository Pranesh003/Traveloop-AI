import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, X, Globe, Shield } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Form state
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [safety, setSafety] = useState('High');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    const data = await apiService.destinations.getAll();
    setDestinations(data);
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setCity(item.city);
      setCountry(item.country);
      setSafety(item.safety);
      setStatus(item.status);
    } else {
      setCity('');
      setCountry('');
      setSafety('High');
      setStatus('Active');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (editItem) {
      const updated = await apiService.destinations.update(editItem.id, { city, country, safety, status });
      if (updated) setDestinations(destinations.map(d => d.id === editItem.id ? updated : d));
    } else {
      const added = await apiService.destinations.create({ city, country, safety, status });
      if (added) setDestinations([added, ...destinations]);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this destination?")) {
      const success = await apiService.destinations.delete(id);
      if (success) setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const filteredDestinations = destinations.filter(d => 
    d.city.toLowerCase().includes(search.toLowerCase()) || 
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Destinations</h1>
          <p className="text-gray-400">Manage supported countries, cities, and travel safety scores.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search locations..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-violet-500 outline-none transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="btn btn-primary whitespace-nowrap">
            <Plus size={18} /> Add Location
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger">
        {[
          { label: 'Total Destinations', value: destinations.length, icon: Globe, color: 'var(--violet)', bg: 'rgba(124,58,237,0.2)' },
          { label: 'High Safety Zones', value: destinations.filter(d => d.safety === 'High').length, icon: Shield, color: 'var(--emerald)', bg: 'rgba(16,185,129,0.2)' },
          { label: 'Active Locations', value: destinations.filter(d => d.status === 'Active').length, icon: MapPin, color: 'var(--cyan)', bg: 'rgba(6,182,212,0.2)' }
        ].map((stat, i) => (
          <div key={i} className="gradient-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in border border-white/10" style={{ animationDelay: '0.25s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">LOCATION</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">COUNTRY</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">SAFETY SCORE</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">STATUS</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDestinations.map((dest, i) => (
                <tr key={dest.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 flex items-center justify-center text-white border border-white/10 group-hover:border-violet-500/50 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <span className="font-semibold text-white text-[15px]">{dest.city}</span>
                    </div>
                  </td>
                  <td className="p-5 text-gray-300">{dest.country}</td>
                  <td className="p-5">
                    <span className={`badge ${dest.safety === 'High' ? 'badge-emerald' : dest.safety === 'Medium' ? 'badge-orange' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                      {dest.safety}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dest.status === 'Active' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-gray-500'}`}></span>
                      <span className="text-sm text-gray-300 font-medium">{dest.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(dest)} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(dest.id)} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDestinations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No destinations found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Action Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="text-violet-400" size={20} />
                {editItem ? 'Edit Destination' : 'Add Destination'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">City Name</label>
                <input required type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors" placeholder="e.g. Tokyo" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</label>
                <input required type="text" value={country} onChange={e=>setCountry(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors" placeholder="e.g. Japan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Safety Score</label>
                  <select value={safety} onChange={e=>setSafety(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors">
                    <option value="High" className="bg-gray-900 text-white">High</option>
                    <option value="Medium" className="bg-gray-900 text-white">Medium</option>
                    <option value="Low" className="bg-gray-900 text-white">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                  <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors">
                    <option value="Active" className="bg-gray-900 text-white">Active</option>
                    <option value="Inactive" className="bg-gray-900 text-white">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-white/10 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" className="btn btn-primary px-6">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
