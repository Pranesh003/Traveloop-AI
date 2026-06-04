import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { ROLES } from '../../constants/permissions';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Trash2, ShieldAlert, Users, CheckCircle, Activity, Search } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await apiService.getUsers();
    setUsers(data);
  };

  const handleRoleChange = async (userId, newRole) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      const updated = await apiService.updateUser(userId, updatedUser);
      if (updated) {
        setUsers(users.map(u => u.id === userId ? updated : u));
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const success = await apiService.deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container p-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2" style={{ fontFamily: 'var(--font-display)' }}>User Management</h1>
          <p className="text-gray-400">Manage access levels, roles, and platform users.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger">
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--violet)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{users.length}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{users.filter(u => u.status === 'active').length}</div>
              <div className="text-sm text-gray-400">Active Accounts</div>
            </div>
          </div>
        </div>
        <div className="gradient-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.2)', color: 'var(--cyan)' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{users.filter(u => u.role === ROLES.ADMIN).length}</div>
              <div className="text-sm text-gray-400">Platform Admins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-in border border-white/10" style={{ animationDelay: '0.25s' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">USER INFO</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">ROLE</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide">STATUS</th>
                <th className="p-5 text-sm text-gray-400 font-semibold tracking-wide text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600/30 to-cyan-600/30 flex items-center justify-center text-white border border-white/10 group-hover:border-violet-500/50 transition-colors">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-[15px]">{u.name}</div>
                        <div className="text-gray-400 text-sm mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    {isSuperAdmin && u.id !== 1 ? (
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                      >
                        {Object.values(ROLES).map(role => (
                          <option key={role} value={role} className="bg-gray-900 text-white">
                            {role.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`badge ${u.role === ROLES.SUPER_ADMIN ? 'bg-red-500/20 text-red-400 border border-red-500/20' : u.role === ROLES.ADMIN ? 'badge-violet' : 'badge-cyan'}`}>
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-red-400'}`}></span>
                      <span className="text-sm text-gray-300 capitalize font-medium">{u.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    {isSuperAdmin && u.id !== 1 ? (
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : u.id === 1 ? (
                      <div className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 text-sm font-medium">
                        <ShieldAlert size={14} /> Owner
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    No users found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
