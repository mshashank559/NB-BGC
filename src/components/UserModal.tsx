'use client';

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  UserPlus,
  Edit3,
  Shield,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'ADD' | 'EDIT';
  user: User | null;
  users: User[];
  onSave: (userData: {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: 'ACTIVE' | 'INACTIVE';
  }) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  mode,
  user,
  users,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('COMPLIANCE_MANAGER');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'EDIT' && user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setPassword(user.password || '');
        setRole(user.role || 'COMPLIANCE_MANAGER');
        setStatus(user.status || 'ACTIVE');
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setRole('COMPLIANCE_MANAGER');
        setStatus('ACTIVE');
      }
      setShowPassword(false);
      setError(null);
    }
  }, [isOpen, mode, user]);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedName) {
      setError('Please enter the full name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid corporate email address.');
      return;
    }
    if (!trimmedPass || trimmedPass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // Duplicate email check
    const duplicate = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.id !== user?.id
    );
    if (duplicate) {
      setError(`A user account with email "${trimmedEmail}" already exists.`);
      return;
    }

    onSave({
      id: user?.id,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPass,
      role,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
              {mode === 'ADD' ? <UserPlus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {mode === 'ADD' ? 'Create New User Account' : 'Edit User Credentials & Role'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {mode === 'ADD'
                  ? 'Provision team member login credentials and role permissions.'
                  : 'Update login email, password, desk permission, and status.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Login Email ID *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@netbounce.com"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Generate Random
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              System Role & Desk Permission *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Admin */}
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-900 dark:text-purple-200 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                  Full System Control
                </span>
              </button>

              {/* Compliance */}
              <button
                type="button"
                onClick={() => setRole('COMPLIANCE_MANAGER')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'COMPLIANCE_MANAGER'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-cyan-200 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Compliance</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                  BGC & PO Form
                </span>
              </button>

              {/* Accounts */}
              <button
                type="button"
                onClick={() => setRole('ACCOUNT_MANAGER')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'ACCOUNT_MANAGER'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Accounts</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                  Collection Hub
                </span>
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Account Status
              </span>
              <span className="text-[10px] text-slate-400">
                Active users can log in to their assigned desk
              </span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  status === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('INACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  status === 'INACTIVE'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              {mode === 'ADD' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
