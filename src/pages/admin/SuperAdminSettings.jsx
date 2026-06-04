import React, { useState } from 'react';
import { Shield, Key, Database, Globe, ToggleRight, AlertOctagon, RefreshCcw, Save, DownloadCloud } from 'lucide-react';

export default function SuperAdminSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [openRegistrations, setOpenRegistrations] = useState(true);

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
            Super Admin Settings <Shield className="text-rose-500" size={32} />
          </h1>
          <p className="text-gray-400">DANGER ZONE: Master platform configurations, API keys, and system flags.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger">
        <div className="space-y-8">
          <div className="glass-card p-8 rounded-3xl border border-rose-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-rose-500/10 transition-colors pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Key size={20} />
              </div>
              API Key Configuration
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Google Gemini API Key</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="password" value="••••••••••••••••••••••••••••••" readOnly className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white outline-none transition-colors" />
                    <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 rounded-xl text-white font-medium transition-all">Edit</button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">OpenWeather API Key</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="password" value="••••••••••••••••••••••••••••••" readOnly className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white outline-none transition-colors" />
                    <Globe size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 rounded-xl text-white font-medium transition-all">Edit</button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Stripe Secret Key</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="password" placeholder="sk_test_..." className="w-full bg-black/40 border border-rose-500/30 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none transition-colors" />
                  </div>
                  <button className="bg-rose-500 text-white hover:bg-rose-600 px-6 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <ToggleRight size={20} />
              </div>
              Feature Flags
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-5 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <div className="font-semibold text-white mb-1">Maintenance Mode</div>
                  <div className="text-sm text-gray-400">Lock the platform for all non-admin users.</div>
                </div>
                <div 
                  className={`w-14 h-7 rounded-full relative cursor-pointer border transition-colors ${maintenanceMode ? 'bg-rose-500/40 border-rose-500/50' : 'bg-white/10 border-white/20'}`}
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-5 bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <div className="font-semibold text-white mb-1">Enable Open Registrations</div>
                  <div className="text-sm text-gray-400">Allow new users to create accounts.</div>
                </div>
                <div 
                  className={`w-14 h-7 rounded-full relative cursor-pointer border transition-colors ${openRegistrations ? 'bg-emerald-500/40 border-emerald-500/50' : 'bg-white/10 border-white/20'}`}
                  onClick={() => setOpenRegistrations(!openRegistrations)}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${openRegistrations ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                <Database size={20} />
              </div>
              Database Management
            </h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Export full database backups or trigger a factory reset. <strong className="text-red-400 font-semibold">These actions are irreversible and should only be performed during maintenance windows.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-white/5 border border-white/10 text-white px-6 py-3.5 rounded-xl hover:bg-white/10 font-medium transition-all flex items-center justify-center gap-2">
                <DownloadCloud size={18} /> Backup Database
              </button>
              <button className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3.5 rounded-xl hover:bg-red-500 hover:text-white font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertOctagon size={18} /> Factory Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
