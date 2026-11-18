'use client';

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  UserCheck,
  AlertCircle,
  Building2,
} from 'lucide-react';

export interface LoginPageSplitScreenImageProps {
  headingAs?: 'h1' | 'h2' | 'h3';
  brandName?: string;
  signUpHref?: string;
  forgotPasswordHref?: string;
  termsHref?: string;
  privacyHref?: string;
  image?: {
    src?: string;
    alt?: string;
    position?: string;
  };
  onSignIn?: (credentials: { email: string; password: string; remember: boolean }) => Promise<void> | void;
  onProviderSignIn?: (provider: string) => Promise<void> | void;
  availableUsers?: Array<{
    name: string;
    email: string;
    password?: string;
    role: string;
  }>;
}

export const LoginPageSplitScreenImage: React.FC<LoginPageSplitScreenImageProps> = ({
  headingAs: HeadingTag = 'h1',
  brandName = 'NetBounce Placement LLC',
  signUpHref = '#',
  forgotPasswordHref = '#',
  termsHref = '#',
  privacyHref = '#',
  image,
  onSignIn,
  onProviderSignIn,
  availableUsers = [
    { name: 'Admin', email: 'admin@netbounce.com', password: 'admin123', role: 'ADMIN' },
    { name: 'Compliance', email: 'compliance@netbounce.com', password: 'compliance123', role: 'COMPLIANCE_MANAGER' },
    { name: 'Accounts', email: 'accounts@netbounce.com', password: 'accounts123', role: 'ACCOUNT_MANAGER' },
  ],
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      if (onSignIn) {
        await onSignIn({ email: email.trim(), password: password.trim(), remember });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'That email and password do not match.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (userEmail: string, userPass?: string) => {
    setEmail(userEmail);
    if (userPass) setPassword(userPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F7FF] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 antialiased select-none">
      {/* Left Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen z-10">
        {/* Brand / Logo Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt={brandName}
              className="h-10 w-auto object-contain drop-shadow-sm"
              onError={(e) => {
                // fallback to text if image not loaded
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="hidden sm:block">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                {brandName}
              </span>
              <span className="block text-[10px] text-blue-600 dark:text-cyan-400 font-semibold tracking-wider uppercase">
                Compliance & Payment Engine
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Portal
          </span>
        </div>

        {/* Form Container */}
        <div className="my-auto max-w-md w-full mx-auto py-8">
          <div className="mb-6">
            <HeadingTag className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sign In to Your Workspace
            </HeadingTag>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Access candidate BGC verification, slot collections, and financial audit logs.
            </p>
          </div>

          {/* Quick-Fill Demo Accounts */}
          <div className="mb-6 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-blue-900 dark:text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                Quick Login (Demo Accounts):
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableUsers.map((u) => {
                const isSelected = email.toLowerCase() === u.email.toLowerCase();
                const roleBadge =
                  u.role === 'ADMIN'
                    ? 'Admin'
                    : u.role === 'COMPLIANCE_MANAGER'
                    ? 'Compliance'
                    : 'Accounts';
                const roleEmoji =
                  u.role === 'ADMIN'
                    ? '👑'
                    : u.role === 'COMPLIANCE_MANAGER'
                    ? '🛡️'
                    : '💳';

                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleQuickFill(u.email, u.password)}
                    className={`px-2 py-2 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="font-extrabold truncate flex items-center gap-1">
                      <span>{roleEmoji}</span>
                      <span>{roleBadge}</span>
                    </span>
                    <span
                      className={`text-[9px] truncate font-mono mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {u.password || '••••••'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@netbounce.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Remember me for 30 days</span>
              </label>
              <a
                href={forgotPasswordHref}
                onClick={(e) => {
                  e.preventDefault();
                  alert('For password resets, contact System Administrator (admin@netbounce.com).');
                }}
                className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social / SSO Auth */}
          {onProviderSignIn && (
            <div className="mt-6">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-[#F4F7FF] dark:bg-[#0B1120] px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                  Or corporate SSO
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onProviderSignIn('google')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  <span>Google Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => onProviderSignIn('microsoft')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Microsoft SSO</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-4">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href={termsHref} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              Terms of Use
            </a>
            <a href={privacyHref} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              Privacy Policy
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-blue-600 dark:text-cyan-400 font-semibold">Security Grade: A+</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Split Screen */}
      <div className="w-full lg:w-1/2 relative min-h-[420px] lg:min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] p-8 lg:p-16 flex flex-col justify-between overflow-hidden text-white">
        {/* Ambient Decorative Backing Orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-lg">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Bank-Grade RBAC Protected</span>
          </div>
          <span className="text-xs text-slate-300 font-mono">v2.4.0-Production</span>
        </div>

        {/* Center Content Card */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3 block">
            Candidate Lifecycle & Compliance Engine
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Unified BGC Verification, Payment Slots & Real-time Audit Trail.
          </h2>
          <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-8">
            Manage candidates from initial PO entry through background checks, installment schedules, referral bonuses, and on-offer clearance receipts.
          </p>

          {/* Feature Highlights Grid */}
          <div className="space-y-3">
            {[
              { title: 'Full BGC Verification Tracking', desc: '1st/2nd/3rd PO checks, offer payment receipts & proof uploads.' },
              { title: 'Intelligent Slot Payment Schedule', desc: '4-Slot standard, custom splits, and one-shot payment engines.' },
              { title: 'Referral Bonus & Deduction Ledger', desc: 'Multi-split referee allocations with automatic balance reconciliation.' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-white">{f.title}</h4>
                  <p className="text-[11px] text-slate-300 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Trust Status */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">System Status: All Engines Operational</span>
          </div>
          <span className="text-slate-400">NetBounce Placement LLC</span>
        </div>
      </div>
    </div>
  );
};
