import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { MapPin, Calendar, DollarSign, Users, Edit, Share2, Map, Package, BookOpen, ChevronRight } from 'lucide-react';

const TRIP = {
  id: 1, title: 'Japan Discovery', destination: 'Tokyo & Kyoto, Japan', emoji: '🗾',
  startDate: '2026-10-15', endDate: '2026-10-25', budget: 150000, spent: 48000,
  stops: 5, activities: 14, travelStyle: 'Cultural & Food', companions: 'Solo',
  description: 'An unforgettable 10-day journey through Japan, exploring ancient temples, futuristic cities, and authentic street food culture.',
  cover: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  stops_list: ['Tokyo', 'Nikko', 'Hakone', 'Kyoto', 'Osaka'],
};

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const remaining = TRIP.budget - TRIP.spent;
  const pct = Math.round((TRIP.spent / TRIP.budget) * 100);

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'itinerary', label: '🗺️ Itinerary' },
    { id: 'budget', label: '💰 Budget' },
    { id: 'packing', label: '🧳 Packing' },
    { id: 'journal', label: '📓 Journal' },
  ];

  return (
    <SidebarLayout>
      <div className="page-container">
        {/* Hero */}
        <div style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-6)', background: TRIP.cover, minHeight: 220, position: 'relative', display: 'flex', alignItems: 'flex-end' }} className="animate-fade-in">
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%)' }} />
          <span style={{ position: 'absolute', top: 'var(--space-6)', left: 'var(--space-6)', fontSize: '4rem' }}>{TRIP.emoji}</span>
          <div style={{ position: 'relative', padding: 'var(--space-6)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: 8 }}>{TRIP.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {TRIP.destination}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} /> Oct 15 – Oct 25, 2026</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> {TRIP.companions}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/builder/${tripId}`)}><Edit size={14} /> Edit</button>
              <button className="btn btn-primary btn-sm"><Share2 size={14} /> Share</button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-4 mb-6 stagger animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { label: 'Total Budget', value: `₹${(TRIP.budget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'var(--violet)', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Spent So Far', value: `₹${(TRIP.spent / 1000).toFixed(0)}K`, icon: DollarSign, color: 'var(--orange)', bg: 'rgba(249,115,22,0.1)' },
            { label: 'Stops', value: TRIP.stops, icon: MapPin, color: 'var(--cyan)', bg: 'rgba(6,182,212,0.1)' },
            { label: 'Activities', value: TRIP.activities, icon: Calendar, color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}><Icon size={20} /></div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-6)', overflow: 'auto' }} className="animate-fade-in">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--violet)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--violet-light)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
                marginBottom: -1,
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="grid-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="mb-4">About this Trip</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{TRIP.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[TRIP.travelStyle, TRIP.companions, '10 days'].map(tag => <span key={tag} className="tag active">{tag}</span>)}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="mb-4">Route</h3>
                {TRIP.stops_list.map((stop, i) => (
                  <div key={stop} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stop}</span>
                    {i < TRIP.stops_list.length - 1 && <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>→ Next</span>}
                  </div>
                ))}
              </div>
              <div className="glass-card p-5">
                <h3 className="mb-3">Budget Progress</h3>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>₹{TRIP.spent.toLocaleString('en-IN')} of ₹{TRIP.budget.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 700, color: pct > 80 ? 'var(--rose)' : 'var(--emerald)' }}>{pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Map, label: 'Edit Itinerary', path: `/builder/${tripId}`, color: 'var(--violet)' },
                  { icon: DollarSign, label: 'View Budget', path: `/budget/${tripId}`, color: 'var(--orange)' },
                  { icon: Package, label: 'Packing List', path: `/checklist/${tripId}`, color: 'var(--emerald)' },
                  { icon: BookOpen, label: 'Travel Journal', path: `/journal/${tripId}`, color: 'var(--cyan)' },
                ].map(({ icon: Icon, label, path, color }) => (
                  <button key={label} className="glass-card flex items-center gap-3 p-4" style={{ cursor: 'pointer', border: 'none', fontFamily: 'var(--font-sans)', width: '100%', textAlign: 'left', transition: 'all 0.2s' }}
                    onClick={() => navigate(path)}>
                    <div style={{ width: 36, height: 36, background: color + '22', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}><Icon size={18} /></div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{label}</span>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'itinerary' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-secondary">View and edit your full itinerary</p>
              <button className="btn btn-primary" onClick={() => navigate(`/builder/${tripId}`)}>Open Itinerary Builder <ChevronRight size={16} /></button>
            </div>
          )}
          {activeTab === 'budget' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-secondary">Track and manage your trip expenses</p>
              <button className="btn btn-primary" onClick={() => navigate(`/budget/${tripId}`)}>Open Budget Dashboard <ChevronRight size={16} /></button>
            </div>
          )}
          {activeTab === 'packing' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-secondary">Manage your packing checklist</p>
              <button className="btn btn-primary" onClick={() => navigate(`/checklist/${tripId}`)}>Open Packing Assistant <ChevronRight size={16} /></button>
            </div>
          )}
          {activeTab === 'journal' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-secondary">Write and view your travel memories</p>
              <button className="btn btn-primary" onClick={() => navigate(`/journal/${tripId}`)}>Open Travel Journal <ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
