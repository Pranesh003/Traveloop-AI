import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { chatWithAI } from '../services/aiService';
import { BookOpen, Plus, Sparkles, Loader, Image, Smile } from 'lucide-react';

const MOODS = ['😊 Happy', '🤩 Excited', '😌 Peaceful', '🥹 Nostalgic', '🥳 Celebratory', '😴 Tired'];

const DEMO_ENTRIES = [
  { id: 1, date: '2026-10-15', title: 'Arriving in Tokyo', content: 'Landed in Narita after a long flight. The moment I stepped out of the airport, the energy was electric. Took the Narita Express and saw my first glimpse of Tokyo\'s skyline at dusk. Checked in to our hotel in Shinjuku.', mood: '🤩 Excited', photos: [] },
  { id: 2, date: '2026-10-16', title: 'Senso-ji and Harajuku', content: 'Started the day at the magnificent Senso-ji Temple in Asakusa. The giant lantern at the Kaminarimon Gate was stunning. Afternoon in Harajuku — the fashion subcultures here are incredible.', mood: '😊 Happy', photos: [] },
];

export default function Journal() {
  const { tripId } = useParams();
  const [entries, setEntries] = useState(DEMO_ENTRIES);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', mood: '😊 Happy', date: new Date().toISOString().slice(0, 10) });
  const [aiLoading, setAiLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleAdd = () => {
    if (!form.title || !form.content) return;
    const entry = { id: Date.now(), ...form, photos: [] };
    setEntries(p => [entry, ...p]);
    setForm({ title: '', content: '', mood: '😊 Happy', date: new Date().toISOString().slice(0, 10) });
    setShowAdd(false);
    setSelected(entry.id);
  };

  const generateStory = async (entry) => {
    setAiLoading(entry.id);
    const story = await chatWithAI([{ role: 'user', content: `Turn this travel journal entry into a beautifully written travel story: "${entry.content}". Make it vivid and emotional, 2-3 paragraphs.` }]);
    setEntries(p => p.map(e => e.id === entry.id ? { ...e, aiStory: story } : e));
    setAiLoading(false);
  };

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3 animate-fade-in">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📓 Travel Journal</h1>
            <p className="text-secondary">Trip #{tripId} · {entries.length} entries</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> New Entry
          </button>
        </div>

        {showAdd && (
          <div className="glass-card p-6 mb-6 animate-scale-in">
            <h3 className="mb-4">New Journal Entry</h3>
            <div className="flex flex-col gap-4">
              <div className="grid-2">
                <div className="input-group"><label>Title</label><input placeholder="Today in Tokyo..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div className="input-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div className="input-group">
                <label>Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button key={m} type="button" className={`tag ${form.mood === m ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, mood: m }))}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Write about your day...</label>
                <textarea rows={6} placeholder="What did you see, feel, eat? What made today special?" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary" onClick={handleAdd}>Save Entry</button>
                <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid-2 animate-fade-in" style={{ animationDelay: '0.1s', alignItems: 'start' }}>
          {/* Entry list */}
          <div className="flex flex-col gap-4">
            {entries.map(entry => (
              <div
                key={entry.id}
                className={`glass-card`}
                style={{ padding: 'var(--space-5)', cursor: 'pointer', borderColor: selected === entry.id ? 'rgba(124,58,237,0.4)' : 'var(--border)', background: selected === entry.id ? 'rgba(124,58,237,0.06)' : 'var(--bg-glass)' }}
                onClick={() => setSelected(selected === entry.id ? null : entry.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{entry.date} · {entry.mood}</div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{entry.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', display: '-webkit-box' }}>{entry.content}</p>

                {selected === entry.id && (
                  <div className="mt-4 animate-fade-in">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{entry.content}</p>
                    {entry.aiStory && (
                      <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--violet-light)', fontWeight: 700, marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✨ AI Travel Story</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{entry.aiStory}</p>
                      </div>
                    )}
                    <button
                      className="btn btn-secondary btn-sm mt-3"
                      onClick={(e) => { e.stopPropagation(); generateStory(entry); }}
                      disabled={aiLoading === entry.id}
                    >
                      {aiLoading === entry.id ? <><Loader size={12} className="spin" /> Generating Story...</> : <><Sparkles size={12} /> Generate AI Story</>}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline sidebar */}
          <div className="glass-card p-5" style={{ position: 'sticky', top: 80 }}>
            <h3 className="mb-4"><BookOpen size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--violet-light)' }} />Journal Timeline</h3>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
              {entries.map((entry, i) => (
                <div key={entry.id} style={{ position: 'relative', marginBottom: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setSelected(entry.id)}>
                  <div style={{ position: 'absolute', left: -20, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--violet)', boxShadow: '0 0 8px var(--violet-glow)' }} />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{entry.date}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: selected === entry.id ? 'var(--violet-light)' : 'var(--text-secondary)' }}>{entry.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.mood}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
