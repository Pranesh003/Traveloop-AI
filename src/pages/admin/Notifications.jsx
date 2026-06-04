import React, { useState, useEffect } from 'react';
import { Send, Bell, Mail, Smartphone, Radio, Users, CheckCircle } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function Notifications() {
  const [broadcasts, setBroadcasts] = useState([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('All Users');
  const [channels, setChannels] = useState({ inApp: true, email: true, push: false });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    const data = await apiService.broadcasts.getAll();
    setBroadcasts(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !body) return;

    const selectedChannels = [];
    if (channels.inApp) selectedChannels.push('In-App');
    if (channels.email) selectedChannels.push('Email');
    if (channels.push) selectedChannels.push('Push');

    const added = await apiService.broadcasts.create({
      title,
      body,
      target,
      channels: selectedChannels,
      date: 'Just now'
    });

    if (added) setBroadcasts([added, ...broadcasts]);
    setTitle('');
    setBody('');
  };

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Notification Center</h1>
          <p className="text-gray-400">Send global alerts, emails, and manage broadcast templates.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
              <Radio size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{broadcasts.length}</div>
              <div className="text-sm text-gray-400">Total Broadcasts</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.8%</div>
              <div className="text-sm text-gray-400">Delivery Rate</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--violet)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">12.5k</div>
              <div className="text-sm text-gray-400">Reach Last 30 Days</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger animate-fade-in" style={{ animationDelay: '0.25s' }}>
        <div className="lg:col-span-2 glass-card p-8 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Send size={18} />
            </div>
            <h3 className="text-2xl font-bold text-white">Compose Broadcast</h3>
          </div>
          
          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Target Audience</label>
                <select value={target} onChange={e=>setTarget(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-colors">
                  <option value="All Users" className="bg-gray-900 text-white">All Users</option>
                  <option value="Premium Users" className="bg-gray-900 text-white">Premium Users Only</option>
                  <option value="Free Users" className="bg-gray-900 text-white">Free Users Only</option>
                  <option value="Travel Experts" className="bg-gray-900 text-white">Travel Experts</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Channels</label>
                <div className="flex flex-wrap gap-3 pt-1.5">
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all ${channels.inApp ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'}`}>
                    <input type="checkbox" className="hidden" checked={channels.inApp} onChange={e=>setChannels({...channels, inApp: e.target.checked})} />
                    <Bell size={16}/> <span className="font-medium text-sm">In-App</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all ${channels.email ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'}`}>
                    <input type="checkbox" className="hidden" checked={channels.email} onChange={e=>setChannels({...channels, email: e.target.checked})} />
                    <Mail size={16}/> <span className="font-medium text-sm">Email</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all ${channels.push ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'}`}>
                    <input type="checkbox" className="hidden" checked={channels.push} onChange={e=>setChannels({...channels, push: e.target.checked})} />
                    <Smartphone size={16}/> <span className="font-medium text-sm">Push</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Message Title</label>
              <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Server Maintenance Notice" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Message Body</label>
              <textarea required rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message here..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none resize-none transition-colors"></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button type="submit" className="btn px-8 py-3 text-white font-medium flex items-center gap-2 rounded-xl hover:scale-105 transition-transform" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                <Send size={18} /> Send Broadcast
              </button>
            </div>
          </form>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Radio size={18} className="text-blue-400" /> Recent Activity</h3>
            <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-md">{broadcasts.length} Sent</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {broadcasts.map((b, i) => (
              <div key={b.id} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-white leading-tight">{b.title}</h4>
                  <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap ml-3">{b.date}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{b.body}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium uppercase tracking-wider">{b.target}</span>
                  {b.channels.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10 text-[10px] font-medium">{c}</span>
                  ))}
                </div>
              </div>
            ))}
            {broadcasts.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">No broadcasts sent yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
