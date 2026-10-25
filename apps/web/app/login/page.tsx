'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/app-store';
import { AttendanceClock } from '@/components/attendance-clock';
import {
  ShieldCheck,
  Clock,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HeartHandshake,
  Building2,
  Check,
  LogIn,
  UserPlus,
} from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { login, signup, session, hydrated, accounts, logout } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign-in state
  const [email, setEmail] = useState('admin@hrv-homes.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  // Sign-up state
  const [su, setSu] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
  });
  const [showSuPassword, setShowSuPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>('admin@hrv-homes.com');

  // Employees stay on this page to use the real-time Time & Attendance clock
  const isEmployee = session?.role === 'employee';

  useEffect(() => {
    if (hydrated && session && !isEmployee) router.replace('/dashboard');
  }, [hydrated, session, isEmployee, router]);

  function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Login failed. Please verify credentials.');
      return;
    }
    const acct = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (acct?.role !== 'employee') router.replace('/dashboard');
  }

  function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (su.password !== su.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (su.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setBusy(true);
    const res = signup({ name: su.name, email: su.email, password: su.password, role: su.role });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Account creation failed.');
      return;
    }
    if (su.role !== 'employee') router.replace('/dashboard');
  }

  function selectDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setSelectedDemo(demoEmail);
    setError(null);
  }

  // Employee logged in view
  if (hydrated && session && isEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold shadow-lg shadow-teal-900/30">
              HCR
            </div>
            <div>
              <div className="font-semibold text-white tracking-wide text-sm sm:text-base">
                Home Care Residential
              </div>
              <div className="text-xs text-teal-300/80">Staff Attendance &amp; EVV Terminal</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-3.5 py-1.5 transition-colors"
          >
            Sign out
          </button>
        </header>

        <main className="max-w-2xl w-full mx-auto my-8">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Verified Shift Session
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  Welcome, {session.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Record your direct-care punches with automated EVV verification.
                </p>
              </div>
            </div>

            <AttendanceClock />
          </div>
        </main>

        <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 border-t border-white/5 pt-4">
          Home Care Residential, LLC · MaineCare Section 21 Provider · Direct Support Professional EVV
        </footer>
      </div>
    );
  }

  // Hydration fallback
  if (!hydrated || session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm tracking-wide">Loading workspace…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left Showcase Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950/70 to-slate-900 border-r border-white/10">
        {/* Ambient lighting effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-900/50">
              HCR
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">Home Care Residential</div>
              <div className="text-xs text-teal-400 font-medium">Payroll &amp; HR SaaS Platform</div>
            </div>
          </div>

          <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              MaineCare Section 21 Certified Provider
            </span>
          </div>
        </div>

        <div className="relative z-10 my-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Modern Workforce Management for Adult Residential Care
            </h1>
            <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
              Comprehensive Electronic Visit Verification (EVV), smart house roster scheduling, and audited direct-care payroll built specifically for Section 21 community homes.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid gap-3.5 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Live Time &amp; Attendance (EVV)</div>
                <div className="text-xs text-slate-400">Tamper-proof device clock captures with shift matching and zero backdating.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Multi-House Staff Rosters</div>
                <div className="text-xs text-slate-400">Manage DSP, LPN, and administrative shift coverage across group homes seamlessly.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Instant Timesheet Approvals &amp; Reports</div>
                <div className="text-xs text-slate-400">Direct-care breakdown, automatic gross pay estimates, and 1-click CSV export.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement Quote */}
        <div className="relative z-10 p-4 rounded-xl bg-gradient-to-r from-teal-950/60 to-slate-900/60 border border-teal-500/20">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Core Values</span>
          </div>
          <p className="text-xs text-slate-300 italic">
            &ldquo;Home Is Where We Are Safe And Loved. Empowering our care staff with transparent tools to deliver extraordinary residential support.&rdquo;
          </p>
        </div>
      </div>

      {/* Right Interactive Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Branding */}
          <div className="lg:hidden flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                HCR
              </div>
              <div>
                <div className="font-bold text-white text-sm">Home Care Residential</div>
                <div className="text-[11px] text-teal-400">Payroll &amp; HR SaaS</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Sec 21
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Sign in to your account' : 'Register for HCR Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {mode === 'signin'
                ? 'Enter your credentials or choose a pre-configured demo account below.'
                : 'Create an authorized access profile for administrative or care services.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-200 text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={onSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Work Email</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    autoComplete="username"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@hrv-homes.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <span className="text-[11px] text-teal-400 font-mono">Demo: {DEMO_PASSWORD}</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] shadow-lg shadow-teal-900/50 disabled:opacity-60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={onSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={su.name}
                    autoComplete="name"
                    onChange={(e) => setSu((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={su.email}
                    autoComplete="email"
                    onChange={(e) => setSu((s) => ({ ...s, email: e.target.value }))}
                    placeholder="you@hrv-homes.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Role &amp; Permissions</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={su.role}
                    onChange={(e) => setSu((s) => ({ ...s, role: e.target.value as typeof su.role }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  >
                    <option value="employee">Direct Support Professional (DSP Employee)</option>
                    <option value="manager">House Operations Manager</option>
                    <option value="admin">System &amp; Payroll Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={showSuPassword ? 'text' : 'password'}
                      value={su.password}
                      autoComplete="new-password"
                      onChange={(e) => setSu((s) => ({ ...s, password: e.target.value }))}
                      required
                      placeholder="Min 8 chars"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showSuPassword ? 'text' : 'password'}
                      value={su.confirm}
                      autoComplete="new-password"
                      onChange={(e) => setSu((s) => ({ ...s, confirm: e.target.value }))}
                      required
                      placeholder="Repeat password"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowSuPassword(!showSuPassword)}
                  className="text-teal-400 hover:underline flex items-center gap-1"
                >
                  {showSuPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showSuPassword ? 'Hide passwords' : 'Show passwords'}
                </button>
                <span>Min. 8 characters</span>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] shadow-lg shadow-teal-900/50 disabled:opacity-60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {busy ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Authorized Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo Accounts Quick-Fill Section */}
          {mode === 'signin' && (
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Click Demo Logins</span>
                </div>
                <span className="text-[11px] text-slate-500">Click to autofill</span>
              </div>

              <div className="grid gap-2">
                {DEMO_ACCOUNTS.map((a) => {
                  const isSelected = selectedDemo === a.email;
                  const roleBadge =
                    a.role === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : a.role === 'super_admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-teal-500/20 text-teal-300 border-teal-500/30';
                  const initials = a.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('');

                  return (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => selectDemoAccount(a.email)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500/50 ring-1 ring-teal-500/30 shadow-md shadow-teal-950/50'
                          : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-teal-400">
                          {initials}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{a.name}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${roleBadge}`}>
                              {a.role.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{a.email}</div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 group-hover:text-slate-300">Select</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
