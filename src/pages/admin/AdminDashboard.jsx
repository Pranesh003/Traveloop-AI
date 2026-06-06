import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Map, Activity, DollarSign, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [overviewData, revenueData] = await Promise.all([
          apiService.analytics.getOverview(),
          apiService.analytics.getRevenue()
        ]);
        setOverview(overviewData);
        setRevenue(revenueData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const totalUsersVal = overview?.users?.total ?? 0;
  const activeTripsVal = overview?.trips?.active ?? 0;
  const bookedPackagesVal = overview?.bookings?.total ?? 0;
  const revenueVal = revenue ? `$${revenue.total.toLocaleString()}` : '$0';

  const stats = [
    { label: 'Total Users', value: totalUsersVal.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/20', path: '/admin/users' },
    { label: 'Active Trips', value: activeTripsVal.toLocaleString(), icon: Map, color: 'text-green-400', bg: 'bg-green-400/20', path: '/admin/destinations' },
    { label: 'Booked Packages', value: bookedPackagesVal.toLocaleString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/20', path: '/admin/packages' },
    { label: 'Revenue (MTD)', value: revenueVal, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/20', path: '/admin/subscriptions' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="stat-card animate-fade-in cursor-pointer hover:scale-[1.02] hover:border-white/20 transition-all" 
            style={{ animationDelay: `${i * 100}ms` }}
            onClick={() => navigate(stat.path)}
          >
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
        <div className="glass-card p-6 rounded-2xl h-80 flex flex-col justify-center items-center text-center animate-fade-in">
          <Activity size={48} className="text-blue-400/50 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Recent Activity</h3>
          <p className="text-gray-400">Active users: {overview?.users?.active ?? 0}<br />Completed bookings: {overview?.bookings?.completed ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
