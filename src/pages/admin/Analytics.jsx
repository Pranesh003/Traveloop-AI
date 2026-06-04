import React from 'react';
import { BarChart2, TrendingUp, Users, Activity, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const data = [
    { name: 'Jan', users: 4000, revenue: 2400 },
    { name: 'Feb', users: 3000, revenue: 1398 },
    { name: 'Mar', users: 2000, revenue: 9800 },
    { name: 'Apr', users: 2780, revenue: 3908 },
    { name: 'May', users: 1890, revenue: 4800 },
    { name: 'Jun', users: 2390, revenue: 3800 },
    { name: 'Jul', users: 3490, revenue: 4300 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark/90 border border-white/10 p-3 rounded-lg backdrop-blur-md">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-primary text-sm">Users: {payload[0].value}</p>
          <p className="text-green-400 text-sm">Revenue: ${payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Analytics & Reports</h1>
          <p className="text-gray-400 mt-1">Platform growth, user engagement, and revenue metrics.</p>
        </div>
        <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors">
          Export Report
        </button>
      </div>

      <div className="grid-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">Total Revenue</span>
            <span className="text-green-400 text-xs flex items-center"><TrendingUp size={12} className="mr-1"/> +15%</span>
          </div>
          <div className="text-2xl font-bold text-white">$45,231.89</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-400">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">Active Users</span>
            <span className="text-green-400 text-xs flex items-center"><TrendingUp size={12} className="mr-1"/> +8%</span>
          </div>
          <div className="text-2xl font-bold text-white">+2350</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-400">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">Trips Created</span>
            <span className="text-red-400 text-xs flex items-center"><TrendingUp size={12} className="mr-1 transform rotate-180"/> -2%</span>
          </div>
          <div className="text-2xl font-bold text-white">12,234</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-orange-400">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">Conversion Rate</span>
            <span className="text-green-400 text-xs flex items-center"><TrendingUp size={12} className="mr-1"/> +4%</span>
          </div>
          <div className="text-2xl font-bold text-white">4.3%</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl mb-8">
        <h3 className="text-lg font-bold text-white mb-6">Growth Overview</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
