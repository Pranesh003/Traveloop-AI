import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

const CATEGORIES = ['Flights', 'Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Emergency', 'Other'];
const CAT_COLORS = ['#7c3aed', '#06b6d4', '#f97316', '#10b981', '#f43f5e', '#a78bfa', '#fbbf24', '#64748b'];

const DEMO_EXPENSES = [
  { id: 1, category: 'Flights', amount: 35000, description: 'Round trip to Tokyo', date: '2026-10-01' },
  { id: 2, category: 'Accommodation', amount: 18000, description: 'Hotel Shinjuku (3 nights)', date: '2026-10-15' },
  { id: 3, category: 'Food', amount: 4500, description: 'Street food & restaurants', date: '2026-10-16' },
  { id: 4, category: 'Transport', amount: 3200, description: 'JR Pass + subway', date: '2026-10-15' },
  { id: 5, category: 'Activities', amount: 6000, description: 'TeamLab Planets, Senso-ji', date: '2026-10-17' },
];

const BUDGET_TOTAL = 150000;

export default function Budget() {
  const { tripId } = useParams();
  const [expenses, setExpenses] = useState(DEMO_EXPENSES);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'Food', amount: '', description: '', date: '' });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = BUDGET_TOTAL - totalSpent;
  const pct = Math.round((totalSpent / BUDGET_TOTAL) * 100);

  const byCategory = CATEGORIES.map((cat, i) => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: CAT_COLORS[i],
  })).filter(c => c.value > 0);

  const addExpense = () => {
    if (!form.amount || !form.description) return;
    setExpenses(p => [...p, { id: Date.now(), ...form, amount: parseFloat(form.amount) }]);
    setForm({ category: 'Food', amount: '', description: '', date: '' });
    setShowAdd(false);
  };

  const fmtINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3 animate-fade-in">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>💰 Budget Dashboard</h1>
            <p className="text-secondary">Trip #{tripId} · Budget tracking & analysis</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> Add Expense
          </button>
        </div>

        {/* Add Expense Panel */}
        {showAdd && (
          <div className="glass-card p-6 mb-6 animate-scale-in">
            <h3 className="mb-4">Add New Expense</h3>
            <div className="grid-2">
              <div className="input-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Amount (₹)</label>
                <div className="input-wrapper">
                  <DollarSign size={14} className="input-icon" />
                  <input type="number" placeholder="5000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label>Description</label>
                <input type="text" placeholder="What did you spend on?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addExpense}>Add Expense</button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid-4 mb-6 stagger animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { label: 'Total Budget', value: fmtINR(BUDGET_TOTAL), icon: DollarSign, color: 'var(--violet)', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Amount Spent', value: fmtINR(totalSpent), icon: TrendingDown, color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)' },
            { label: 'Remaining', value: fmtINR(remaining), icon: TrendingUp, color: remaining > 0 ? 'var(--emerald)' : 'var(--rose)', bg: remaining > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)' },
            { label: 'Spent So Far', value: `${pct}%`, icon: TrendingDown, color: pct > 80 ? 'var(--rose)' : 'var(--cyan)', bg: 'rgba(6,182,212,0.1)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}><Icon size={20} /></div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-5 mb-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Budget Usage</span>
            <span style={{ color: pct > 80 ? 'var(--rose)' : 'var(--emerald)', fontWeight: 700 }}>{pct}% used</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? 'var(--gradient-rose)' : 'var(--gradient-brand)' }} />
          </div>
          {pct > 80 && <p className="text-sm mt-2" style={{ color: 'var(--rose)' }}>⚠️ You've used {pct}% of your budget. Consider reducing expenses.</p>}
        </div>

        {/* Charts + Expenses */}
        <div className="grid-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Pie Chart */}
          <div className="glass-card p-5">
            <h3 className="mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtINR(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend formatter={(v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses List */}
          <div className="glass-card p-5">
            <h3 className="mb-4">Recent Expenses</h3>
            <div className="flex flex-col gap-3" style={{ maxHeight: 300, overflowY: 'auto' }}>
              {expenses.map(exp => (
                <div key={exp.id} className="flex items-center gap-3 p-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: CAT_COLORS[CATEGORIES.indexOf(exp.category)] || 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {exp.category.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.description}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{exp.category} · {exp.date || 'N/A'}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--orange-light)', fontSize: '0.9rem', flexShrink: 0 }}>{fmtINR(exp.amount)}</div>
                  <button onClick={() => setExpenses(p => p.filter(e => e.id !== exp.id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
