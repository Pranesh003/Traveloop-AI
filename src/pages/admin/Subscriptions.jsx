import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Edit2, X, Zap, Crown, Shield } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Form state
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const data = await apiService.plans.getAll();
    setPlans(data);
  };

  const openModal = (item) => {
    setEditItem(item);
    setPrice(item.price);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (editItem) {
      const updatedPlan = { ...editItem, price };
      const updated = await apiService.plans.update(editItem.id, updatedPlan);
      if (updated) setPlans(plans.map(p => p.id === editItem.id ? updated : p));
    }
    closeModal();
  };

  const getPlanIcon = (name) => {
    if (name.toLowerCase().includes('pro')) return <Zap size={24} />;
    if (name.toLowerCase().includes('enterprise')) return <Crown size={24} />;
    return <Shield size={24} />;
  };

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Subscriptions</h1>
          <p className="text-gray-400">Manage pricing tiers, billing cycles, and feature access.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--violet)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {plans.reduce((sum, p) => sum + (p.users || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Subscribers</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)' }}>
              <Zap size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">₹1.2M</div>
              <div className="text-sm text-gray-400">Monthly Recurring Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {plans.map((plan, i) => (
          <div key={plan.id} className={`glass-card p-8 rounded-3xl relative flex flex-col transition-all border ${plan.popular ? 'border-violet-500/50 shadow-[0_0_30px_rgba(124,58,237,0.15)] scale-[1.02]' : 'border-white/10 hover:border-white/20'}`} style={{ animationDelay: `${i * 0.1}s` }}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-white/20 uppercase tracking-wider">
                Most Popular
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              </div>
              <button onClick={() => openModal(plan)} className="p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <Edit2 size={16} />
              </button>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-gray-400 font-medium">/mo</span>}
              </div>
            </div>
            
            <div className="mb-8 p-4 bg-black/20 rounded-2xl border border-white/5">
              <div className="text-sm font-medium text-gray-400 mb-1">Active Subscribers</div>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className={plan.popular ? 'text-violet-400' : 'text-gray-400'} /> {plan.users}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Included Features</div>
              {plan.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 className="text-violet-400" size={20} />
                Edit {editItem?.name}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Price</label>
                <input required type="text" value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors text-lg font-medium" />
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-gray-300 hover:bg-white/10 font-medium transition-colors">Cancel</button>
                <button type="submit" className="btn btn-primary px-6">Save Price</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
