import React, { useState, useEffect } from 'react';
import { Activity, Plus, Edit2, Trash2, X, Compass, DollarSign, Clock, Search } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('Adventure');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const data = await apiService.activities.getAll();
    setActivities(data);
  };

  const openModal = (item = null) => {
    setEditItem(item);
    if (item) {
      setName(item.name || item.retro);
      setType(item.type);
      setPrice(item.price);
      setDuration(item.duration);
    } else {
      setName('');
      setType('Adventure');
      setPrice('₹0');
      setDuration('1 Hour');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (editItem) {
      const updated = await apiService.activities.update(editItem.id, { name, type, price, duration });
      if (updated) setActivities(activities.map(a => a.id === editItem.id ? updated : a));
    } else {
      const added = await apiService.activities.create({ name, type, price, duration });
      if (added) setActivities([added, ...activities]);
    }
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this activity?")) {
      const success = await apiService.activities.delete(id);
      if (success) setActivities(activities.filter(a => a.id !== id));
    }
  };

  const filteredActivities = activities.filter(a => 
    (a.name || a.retro || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Activities</h1>
          <p className="text-gray-400">Manage local attractions, excursions, and cultural tours.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search activities..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-violet-500 outline-none transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="btn btn-primary whitespace-nowrap">
            <Plus size={18} /> New Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.2)', color: 'var(--orange)' }}>
              <Compass size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{activities.length}</div>
              <div className="text-sm text-gray-400">Total Activities</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.2)', color: 'var(--cyan)' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{activities.filter(a => a.type === 'Adventure').length}</div>
              <div className="text-sm text-gray-400">Adventure Tours</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {filteredActivities.map((act, i) => (
          <div key={act.id} className="glass-card p-6 rounded-2xl flex flex-col relative group overflow-hidden border border-white/10 hover:border-white/20 transition-all" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => openModal(act)} className="p-2 bg-black/60 backdrop-blur hover:bg-white/20 rounded-xl text-white transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(act.id)} className="p-2 bg-black/60 backdrop-blur hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"><Trash2 size={16} /></button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center text-orange-400 mb-5 border border-orange-500/20">
              <Compass size={24} />
            </div>
            <h3 className="font-bold text-xl text-white mb-2 leading-tight">{act.name || act.retro}</h3>
            <span className="text-xs font-medium text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full self-start mb-6">
              {act.type}
            </span>
            <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Clock size={14} className="text-gray-500" /> {act.duration}
              </div>
              <div className="flex items-center gap-1 font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg">
                {act.price}
              </div>
            </div>
          </div>
        ))}
        {filteredActivities.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400 glass-card rounded-2xl">
            No activities found matching "{search}"
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="text-orange-400" size={20} />
                {editItem ? 'Edit Activity' : 'New Activity'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Name</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors" placeholder="e.g. Scuba Diving" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
                <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors">
                  <option value="Adventure" className="bg-gray-900 text-white">Adventure</option>
                  <option value="Cultural" className="bg-gray-900 text-white">Cultural</option>
                  <option value="Water Sports" className="bg-gray-900 text-white">Water Sports</option>
                  <option value="Culinary" className="bg-gray-900 text-white">Culinary</option>
                  <option value="Relaxation" className="bg-gray-900 text-white">Relaxation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input required type="text" value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-orange-500 outline-none transition-colors" placeholder="e.g. ₹5000" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input required type="text" value={duration} onChange={e=>setDuration(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-orange-500 outline-none transition-colors" placeholder="e.g. 2 Hours" />
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-white/10 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" className="btn btn-primary px-6" style={{ background: 'var(--gradient-orange)', borderColor: 'var(--orange)' }}>Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
