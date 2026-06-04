import React, { useState, useEffect } from 'react';
import { MessageCircle, AlertTriangle, CheckCircle, Trash2, ExternalLink, ShieldAlert, Flag, UserX } from 'lucide-react';
import { apiService } from '../../services/apiService';

export default function CommunityModeration() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const data = await apiService.reports.getAll();
    setReports(data);
  };

  const handleResolve = async (id) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      const updatedReport = { ...report, status: 'Resolved' };
      const updated = await apiService.reports.update(id, updatedReport);
      if (updated) setReports(reports.map(r => r.id === id ? updated : r));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this content and close the report?")) {
      const success = await apiService.reports.delete(id);
      if (success) setReports(reports.filter(r => r.id !== id));
    }
  };

  return (
    <div className="page-container p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>Community Moderation</h1>
          <p className="text-gray-400">Review reported content, manage bans, and moderate user posts.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.2)', color: 'var(--orange)' }}>
              <Flag size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{reports.filter(r => r.status === 'Pending').length}</div>
              <div className="text-sm text-gray-400">Pending Reports</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--rose)' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24</div>
              <div className="text-sm text-gray-400">Critical Alerts</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(100,116,139,0.2)', color: '#94a3b8' }}>
              <UserX size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">12</div>
              <div className="text-sm text-gray-400">Banned Users</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in border border-white/10" style={{ animationDelay: '0.25s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">CONTENT INFO</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">REPORT REASON</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">DATE</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">STATUS</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 flex items-center justify-center text-white border border-white/10 group-hover:border-violet-500/50 transition-colors">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-[15px]">{report.type}</div>
                        <div className="text-gray-400 text-sm mt-0.5">@{report.user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 text-sm font-medium">
                      <AlertTriangle size={14} /> {report.reason}
                    </div>
                  </td>
                  <td className="p-5 text-gray-400 text-sm font-medium">{report.date}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${report.status === 'Resolved' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]'}`}></span>
                      <span className="text-sm text-gray-300 font-medium">{report.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all" title="View Content">
                        <ExternalLink size={16} />
                      </button>
                      {report.status === 'Pending' && (
                        <button onClick={() => handleResolve(report.id)} className="p-2.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all" title="Approve/Keep">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(report.id)} className="p-2.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Content">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
