import React, { useState, useEffect } from 'react';
import { Package, Plus, Star, Map, Calendar, Users, X, DollarSign, Image as ImageIcon, Search, TrendingUp } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const data = await apiService.packages.getAll();
    setPackages(data);
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setName(item.name);
      setDuration(item.duration);
      setPrice(item.price);
    } else {
      setName('');
      setDuration('7 Days');
      setPrice('₹0');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (editItem) {
      const updated = await apiService.packages.update(editItem.id, { name, duration, price, bookings: editItem.bookings, rating: editItem.rating });
      if (updated) setPackages(packages.map(p => p.id === editItem.id ? updated : p));
    } else {
      const added = await apiService.packages.create({ name, duration, price, bookings: 0, rating: 5.0 });
      if (added) setPackages([added, ...packages]);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this package?")) {
      const success = await apiService.packages.delete(id);
      if (success) setPackages(packages.filter(p => p.id !== id));
    }
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Travel Packages</h1>
          <p className="text-gray-400">Manage curated, seasonal, and premium travel packages.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-rose-500 outline-none transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="btn btn-primary whitespace-nowrap" style={{ background: 'var(--gradient-rose)', borderColor: 'var(--rose)' }}>
            <Plus size={18} /> Create Package
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.2)', color: 'var(--rose)' }}>
              <Package size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{packages.length}</div>
              <div className="text-sm text-gray-400">Active Packages</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {packages.reduce((sum, p) => sum + (p.bookings || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Bookings</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308' }}>
              <Star size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.8</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger animate-fade-in" style={{ animationDelay: '0.25s' }}>
        {filteredPackages.map((pkg, i) => (
          <div key={pkg.id} className="glass-card p-0 rounded-2xl overflow-hidden group flex flex-col border border-white/10 hover:border-rose-500/30 transition-all shadow-lg hover:shadow-rose-500/10" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center overflow-hidden">
              <ImageIcon size={32} className="text-gray-700 absolute opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-sm text-yellow-400 font-bold border border-white/10">
                <Star size={14} className="fill-yellow-400" /> {pkg.rating}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col relative z-20">
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">{pkg.name}</h3>
              
              <div className="flex flex-wrap gap-3 mb-5 text-sm text-gray-400">
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md"><Calendar size={14} className="text-gray-500" /> {pkg.duration}</div>
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md"><Users size={14} className="text-gray-500" /> {pkg.bookings} Bookings</div>
              </div>
              
              <div className="mt-auto flex justify-between items-center pt-5 border-t border-white/10">
                <span className="text-xl font-black text-white">{pkg.price}</span>
                <div className="flex gap-2">
                  <button onClick={() => openModal(pkg)} className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-xl transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredPackages.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400 glass-card rounded-2xl">
            No packages found matching "{search}"
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="text-rose-400" size={20} />
                {editItem ? 'Edit Package' : 'New Package'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Package Name</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none transition-colors" placeholder="e.g. Kyoto Cherry Blossom Tour" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input required type="text" value={duration} onChange={e=>setDuration(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-rose-500 outline-none transition-colors" placeholder="e.g. 7 Days" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input required type="text" value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-rose-500 outline-none transition-colors" placeholder="e.g. ₹80000" />
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-white/10 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" className="btn btn-primary px-6" style={{ background: 'var(--gradient-rose)', borderColor: 'var(--rose)' }}>Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
