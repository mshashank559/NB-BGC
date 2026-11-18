'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  CreditCard,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  currentUserId: string;
  onOpenAddUser: () => void;
  onOpenEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchUser?: (user: User) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUserId,
  onOpenAddUser,
  onOpenEditUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      return matchName || matchEmail || matchRole;
    }
    return true;
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const complianceCount = users.filter((u) => u.role === 'COMPLIANCE_MANAGER').length;
  const accountsCount = users.filter((u) => u.role === 'ACCOUNT_MANAGER').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Accounts
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {users.length}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Provisioned in Engine</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Admin Users */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Administrators
            </p>
            <h3 className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">
              {adminCount}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Full RBAC & Audit</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Compliance Desk */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div>
            <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              Compliance Desk
            </p>
            <h3 className="text-2xl font-black text-cyan-900 dark:text-cyan-200 mt-1">
              {complianceCount}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">PO & BGC Verification</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-900">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Accounts Desk */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Accounts Desk
            </p>
            <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {accountsCount}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Collections & Slots</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-[26px] p-6 ambient-blue border border-slate-200/80 dark:border-white/10 shadow-spatial-card">
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  User Management & Credentials Center
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Admin-exclusive control panel to create, update, and manage login credentials and role permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, role..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
              {(['ALL', 'ADMIN', 'COMPLIANCE_MANAGER', 'ACCOUNT_MANAGER'] as const).map((r) => {
                const label =
                  r === 'ALL'
                    ? 'All'
                    : r === 'ADMIN'
                    ? 'Admin'
                    : r === 'COMPLIANCE_MANAGER'
                    ? 'Compliance'
                    : 'Accounts';
                return (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      roleFilter === r
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Add User Button */}
            <button
              onClick={onOpenAddUser}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer ml-auto md:ml-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Work Email</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Role Permission</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your search or role filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentUser = u.id === currentUserId;
                  const isRevealed = !!revealedPasswords[u.id];

                  const roleConfig =
                    u.role === 'ADMIN'
                      ? {
                          badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
                          label: '👑 Administrator',
                        }
                      : u.role === 'COMPLIANCE_MANAGER'
                      ? {
                          badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-cyan-300 dark:border-blue-800',
                          label: '🛡️ Compliance Mgr',
                        }
                      : {
                          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
                          label: '💳 Account Mgr',
                        };

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs">
                            {isRevealed ? u.password || '••••••' : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(u.id)}
                            title={isRevealed ? 'Hide Password' : 'Show Password'}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleConfig.badge}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.status === 'INACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.createdAt || '2026-01-15'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Switch Test */}
                          {onSwitchUser && !isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => onSwitchUser(u)}
                              title={`Switch to ${u.name}'s view`}
                              className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-cyan-400 text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
                            >
                              Login As
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => onOpenEditUser(u)}
                            title="Edit User Credentials"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              title="Delete User"
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setUserToDelete(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/60 rounded-3xl shadow-2xl p-6 sm:p-7 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Remove User Account?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to remove user{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{userToDelete.name}</strong> ({userToDelete.email})?
              They will no longer be able to log in to the system.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
