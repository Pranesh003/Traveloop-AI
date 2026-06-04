import React, { useState, useEffect } from 'react';
import { Sparkles, Settings2, Database, BrainCircuit, RefreshCw, Save, Activity, Zap, Cpu } from 'lucide-react';

export default function AiManagement() {
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [tripPrompt, setTripPrompt] = useState('"You are an expert travel planner. Create a daily itinerary for a trip to {{destination}}..."');
  const [budgetPrompt, setBudgetPrompt] = useState('"Estimate the daily expenses for {{travelers}} traveling to {{destination}} in {{currency}}..."');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('tl_ai_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setModel(config.model || 'gemini-2.5-flash');
      setApiKey(config.apiKey || '');
      setTripPrompt(config.tripPrompt || tripPrompt);
      setBudgetPrompt(config.budgetPrompt || budgetPrompt);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('tl_ai_config', JSON.stringify({
      model,
      apiKey,
      tripPrompt,
      budgetPrompt
    }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
            AI Knowledge Management <Sparkles className="text-violet-400" size={32} />
          </h1>
          <p className="text-gray-400">Configure Gemini models, update prompts, and monitor AI infrastructure.</p>
        </div>
        <div className="flex items-center gap-4">
          {isSaved && <span className="text-emerald-400 flex items-center bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 text-sm font-medium animate-pulse">Saved successfully!</span>}
          <button onClick={handleSave} className="btn flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform" style={{ background: 'linear-gradient(to right, var(--violet), #d946ef)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Save size={18} /> Save Configuration
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--violet)' }}>
              <Zap size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">14.2k</div>
              <div className="text-sm text-gray-400">Generations Today</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-gray-400">API Uptime</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
              <Cpu size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1.4s</div>
              <div className="text-sm text-gray-400">Avg Latency</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger animate-fade-in" style={{ animationDelay: '0.25s' }}>
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-violet-500/10 transition-colors pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                <Settings2 size={20} />
              </div>
              Prompt Engineering
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-colors group/input">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    Trip Generation Prompt
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                  </h4>
                </div>
                <textarea 
                  value={tripPrompt} 
                  onChange={e => setTripPrompt(e.target.value)} 
                  rows="4" 
                  className="w-full bg-transparent p-0 text-[15px] text-gray-300 font-mono focus:outline-none resize-none leading-relaxed"
                />
              </div>
              
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-colors group/input">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    Budget Prediction Prompt
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                  </h4>
                </div>
                <textarea 
                  value={budgetPrompt} 
                  onChange={e => setBudgetPrompt(e.target.value)} 
                  rows="4" 
                  className="w-full bg-transparent p-0 text-[15px] text-gray-300 font-mono focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <BrainCircuit size={20} />
              </div>
              Model Configuration
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active AI Model</label>
                <select 
                  value={model} 
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-violet-500 outline-none transition-colors font-medium"
                >
                  <option value="gemini-2.5-flash" className="bg-gray-900 text-white">Gemini 2.5 Flash (Fast)</option>
                  <option value="gemini-2.5-pro" className="bg-gray-900 text-white">Gemini 2.5 Pro (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gemini API Key</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                  placeholder="AIzaSy..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-violet-500 outline-none transition-colors"
                />
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Token Usage (MTD)</span>
                  <span className="text-white font-bold">1.4M / 5.0M</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ width: '28%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
             
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Database size={20} />
              </div>
              Vector Database
            </h3>
            
            <div className="relative z-10">
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Vector embeddings for <span className="text-white font-medium">45,000+</span> destinations, activities, and user preferences.
              </p>
              
              <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span>Storage</span>
                <span className="text-emerald-400">85% Full</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2.5 p-0.5 border border-white/5">
                <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '85%' }}></div>
              </div>
              
              <button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Sync Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
