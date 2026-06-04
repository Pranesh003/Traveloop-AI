import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Clock, CheckCircle, Ticket, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function Support() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const data = await apiService.tickets.getAll();
    setTickets(data);
  };

  const handleStatusChange = async (id, newStatus) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      const updatedTicket = { ...ticket, status: newStatus };
      const updated = await apiService.tickets.update(id, updatedTicket);
      if (updated) setTickets(tickets.map(t => t.id === id ? updated : t));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'badge-orange';
      case 'In Progress': return 'badge-violet';
      case 'Resolved': return 'badge-emerald';
      default: return 'badge-cyan';
    }
  };

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Support System</h1>
          <p className="text-gray-400">Manage user support tickets, chat requests, and resolutions.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.2)', color: 'var(--orange)' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'Open').length}</div>
              <div className="text-sm text-gray-400">Open Tickets</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--violet)' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'In Progress').length}</div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{tickets.filter(t => t.status === 'Resolved').length}</div>
              <div className="text-sm text-gray-400">Resolved</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.2)', color: 'var(--cyan)' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1.2h</div>
              <div className="text-sm text-gray-400">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in border border-white/10" style={{ animationDelay: '0.3s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">TICKET DETAILS</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">REQUESTER</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">PRIORITY</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">STATUS</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 flex items-center justify-center text-white border border-white/10 group-hover:border-violet-500/50 transition-colors shrink-0">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-[15px]">{ticket.subject}</div>
                        <div className="text-gray-400 text-sm mt-0.5 font-mono">{ticket.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="inline-flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-sm font-medium">
                      @{ticket.user}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${ticket.priority === 'High' ? 'text-rose-400' : ticket.priority === 'Medium' ? 'text-orange-400' : 'text-blue-400'}`}>
                      <AlertCircle size={14} /> {ticket.priority}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`badge ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <select 
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors shadow-lg"
                    >
                      <option value="Open" className="bg-gray-900 text-white">Mark Open</option>
                      <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                      <option value="Resolved" className="bg-gray-900 text-white">Mark Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">No support tickets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
