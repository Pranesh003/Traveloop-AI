import React, { useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TRIP_EVENTS = [
  { id: 1, tripId: 1, title: 'Japan Discovery', start: new Date(2026, 9, 15), end: new Date(2026, 9, 25), color: '#7c3aed', emoji: '🗾' },
  { id: 2, tripId: 2, title: 'Bali Retreat', start: new Date(2026, 11, 20), end: new Date(2026, 11, 28), color: '#10b981', emoji: '🌴' },
  { id: 3, tripId: 4, title: 'Dubai Luxury', start: new Date(2027, 0, 10), end: new Date(2027, 0, 17), color: '#f97316', emoji: '🏙️' },
];

export default function Calendar() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDay = (day) => {
    const date = new Date(year, month, day);
    return TRIP_EVENTS.filter(e => date >= e.start && date <= e.end);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <SidebarLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3 animate-fade-in">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>📅 Travel Calendar</h1>
            <p className="text-secondary">View and manage your trip schedule</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-trip')}>
            <Plus size={14} /> Add Trip
          </button>
        </div>

        {/* Legend */}
        <div className="glass-card p-4 mb-4 flex gap-4 flex-wrap animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {TRIP_EVENTS.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: e.color }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{e.emoji} {e.title}</span>
            </div>
          ))}
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.15s', overflow: 'hidden' }}>
          {/* Calendar Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border)' }}>
            <button className="btn btn-icon btn-ghost" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{MONTHS[month]} {year}</h2>
            <button className="btn btn-icon btn-ghost" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          {/* Days header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} style={{ padding: 'var(--space-3)', minHeight: 80, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const events = getEventsForDay(day);
              const today = isToday(day);
              return (
                <div
                  key={day}
                  style={{
                    padding: 'var(--space-3)',
                    minHeight: 80,
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    cursor: events.length > 0 ? 'pointer' : 'default',
                    background: today ? 'rgba(124,58,237,0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!today) e.currentTarget.style.background = 'var(--bg-glass)'; }}
                  onMouseLeave={e => { if (!today) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: today ? 'var(--violet)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: today ? 700 : 400,
                    color: today ? 'white' : 'var(--text-secondary)',
                    marginBottom: 4,
                  }}>
                    {day}
                  </div>
                  {events.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => navigate(`/builder/${ev.tripId}`)}
                      style={{
                        padding: '2px 6px',
                        background: ev.color + '33',
                        borderLeft: `3px solid ${ev.color}`,
                        borderRadius: '0 4px 4px 0',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: ev.color,
                        marginBottom: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                    >
                      {ev.emoji} {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
