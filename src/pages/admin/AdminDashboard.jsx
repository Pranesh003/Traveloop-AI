import React from 'react';
import { Users, Map, Activity, DollarSign, TrendingUp, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const stats = [
    { label: 'Total Users', value: '4,289', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { label: 'Active Trips', value: '1,842', icon: Map, color: 'text-green-400', bg: 'bg-green-400/20' },
    { label: 'Booked Packages', value: '384', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/20' },
    { label: 'Revenue (MTD)', value: '₹14.2M', icon: DollarSign, color: 'text-primary', bg: 'bg-primary/20' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <span className="text-xs font-semibold text-green-400 flex items-center">
                <TrendingUp size={12} className="mr-1" /> +12%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid-2 gap-6 mt-8">
        <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-center items-center text-center">
          <ShieldAlert size={48} className="text-primary/50 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">System Status</h3>
          <p className="text-gray-400">All systems operational.<br/>AI Knowledge Base is up to date.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-center items-center text-center">
          <Activity size={48} className="text-blue-400/50 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Recent Activity</h3>
          <p className="text-gray-400">Placeholder for recent moderation logs and user activity feed.</p>
        </div>
      </div>
    </div>
  );
}
