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
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HeartHandshake,
  Building2,
  Check,
  LogIn,
  UserPlus,
  KeyRound,
  RefreshCw,
  Radio,
  Timer,
} from 'lucide-react';

type Portal = 'employer' | 'attendance';
type Mode = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  const { login, signup, resetPassword, session, hydrated, accounts, logout, employees, houses } = useApp();
  const router = useRouter();

  // Top-level distinction between Employer Portal and Time & Attendance
  const [portal, setPortal] = useState<Portal>('employer');
  const [mode, setMode] = useState<Mode>('signin');

  // Employer sign-in state
  const [email, setEmail] = useState('admin@hrv-homes.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  // Time & attendance quick caregiver state
  const [staffEmail, setStaffEmail] = useState('maria.garcia@hrv-homes.com');
  const [staffPassword, setStaffPassword] = useState(DEMO_PASSWORD);
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Sign-up state
  const [su, setSu] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
  });
  const [showSuPassword, setShowSuPassword] = useState(false);

  // Forgot password flow state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('849201');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>('admin@hrv-homes.com');

  // Live time ticker for Time & Attendance Kiosk
  const [kioskTime, setKioskTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setKioskTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  function onStaffClockInSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = login(staffEmail, staffPassword);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Staff clock-in verification failed. Please verify email and PIN/password.');
      return;
    }
  }

  function onQuickLaunchStaff(demoStaffEmail: string) {
    setStaffEmail(demoStaffEmail);
    setStaffPassword(DEMO_PASSWORD);
    setError(null);
    setBusy(true);
    const res = login(demoStaffEmail, DEMO_PASSWORD);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not launch staff terminal.');
    }
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

  function onSendResetCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter your work email address.');
      return;
    }
    const exists = accounts.some((a) => a.email.toLowerCase() === targetEmail);
    if (!exists) {
      setError(`No account found matching ${targetEmail}. Please check spelling or contact your administrator.`);
      return;
    }

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setVerificationCode(code);
      setForgotStep(2);
      setSuccessMsg(`A 6-digit reset code has been sent to ${targetEmail}.`);
    }, 500);
  }

  function onResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (verificationCode.trim() !== generatedCode) {
      setError('Invalid verification code. Please check the 6-digit code sent to your email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setBusy(true);
    const res = resetPassword(forgotEmail, newPassword);
    setBusy(false);

    if (!res.ok) {
      setError(res.error ?? 'Failed to reset password.');
      return;
    }

    setForgotStep(3);
    setSuccessMsg('Your password has been successfully updated.');
  }

  function completeResetAndSignIn() {
    setEmail(forgotEmail);
    setPassword(newPassword);
    setMode('signin');
    setForgotStep(1);
    setForgotEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setSuccessMsg('Password updated! You can now sign in.');
  }

  function selectDemoAccount(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setSelectedDemo(demoEmail);
    setError(null);
    setSuccessMsg(null);
  }

  // Employee logged in view (Full Kiosk mode)
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-3.5 py-1.5 transition-colors cursor-pointer"
            >
              Sign out of Kiosk
            </button>
          </div>
        </header>

        <main className="max-w-2xl w-full mx-auto my-8">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified EVV Shift Session
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  Welcome, {session.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Direct Support Professional (DSP) · Electronic Visit Verification Active
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

  // Employer Demo Accounts (Admins & Directors)
  const employerDemoAccounts = DEMO_ACCOUNTS.filter((a) => a.role !== 'employee');
  // Employee Demo Accounts (Direct Support Professionals)
  const employeeDemoAccounts = DEMO_ACCOUNTS.filter((a) => a.role === 'employee');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left Showcase Banner (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950/70 to-slate-900 border-r border-white/10">
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

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              MaineCare Section 21 Certified Provider
            </span>
          </div>
        </div>

        <div className="relative z-10 my-8 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Specialized Residential Care Workforce System
            </h1>
            <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
              Designed with a strict separation between <strong>Administrative Employer Controls</strong> and <strong>Frontline Care Staff Time &amp; Attendance</strong>.
            </p>
          </div>

          {/* Dual Engine Highlighting */}
          <div className="grid gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-teal-500/30 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>1. Employer &amp; Management Portal</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full administration for directors and house managers: payroll processing, MaineCare billing exports, house rosters, schedules, and timesheet approvals.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>2. Time &amp; Attendance (Clock-In) Kiosk</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated terminal for Direct Support Professionals (DSPs) to punch in and out at residential facilities with real-time EVV shift verification.
              </p>
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
        <div className="w-full max-w-md space-y-5">
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

          {/* ========================================================= */}
          {/* PRIMARY PORTAL SWITCHER: EMPLOYER VS TIME & ATTENDANCE */}
          {/* ========================================================= */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Access Portal:</span>
              <span className="text-[10px] text-teal-400">Dual-Mode Security</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-white/15 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setPortal('employer');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  portal === 'employer'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-900/50 ring-1 ring-teal-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Employer Sign-In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('attendance');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  portal === 'attendance'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-900/50 ring-1 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Time &amp; Attendance</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PORTAL 1: EMPLOYER / MANAGEMENT SIGN-IN */}
          {/* ========================================================= */}
          {portal === 'employer' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/25 mb-1.5">
                  <Building2 className="w-3 h-3 text-teal-400" />
                  <span>Management &amp; HR Console</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {mode === 'signin'
                    ? 'Employer Sign-In'
                    : mode === 'signup'
                      ? 'Register Organization Account'
                      : 'Employer Account Recovery'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {mode === 'signin'
                    ? 'Administrative portal for House Managers, Program Directors, and Payroll Admins.'
                    : mode === 'signup'
                      ? 'Create an administrative management profile.'
                      : 'Reset and restore access to your employer account.'}
                </p>
              </div>

              {/* Mode Switcher Tabs for Employer (Sign In / Register) */}
              {mode !== 'forgot' && (
                <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-white/10 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
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
                      setSuccessMsg(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                      mode === 'signup'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Register
                  </button>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs sm:text-sm animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">{successMsg}</div>
                  <button
                    type="button"
                    onClick={() => setSuccessMsg(null)}
                    className="text-emerald-400 hover:text-emerald-200 text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

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

              {/* SIGN IN FORM */}
              {mode === 'signin' && (
                <form onSubmit={onSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        autoComplete="username"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        placeholder="admin@hrv-homes.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setForgotEmail(email);
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {busy ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authenticating Employer…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Employer Console</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {mode === 'signup' && (
                <form onSubmit={onSignUp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={su.name}
                        onChange={(e) => setSu({ ...su, name: e.target.value })}
                        required
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                        placeholder="Jordan Taylor"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={su.email}
                        onChange={(e) => setSu({ ...su, email: e.target.value })}
                        required
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                        placeholder="jordan@hrv-homes.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Management Role</label>
                    <select
                      value={su.role}
                      onChange={(e) => setSu({ ...su, role: e.target.value as typeof su.role })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-hidden focus:border-teal-500"
                    >
                      <option value="admin">Administrator (Full Access)</option>
                      <option value="manager">House Supervisor / Manager</option>
                      <option value="employee">Direct Support Staff</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showSuPassword ? 'text' : 'password'}
                        value={su.password}
                        onChange={(e) => setSu({ ...su, password: e.target.value })}
                        required
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white font-mono"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSuPassword(!showSuPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSuPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        value={su.confirm}
                        onChange={(e) => setSu({ ...su, confirm: e.target.value })}
                        required
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Create Employer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD WORKFLOW */}
              {mode === 'forgot' && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/20 space-y-4">
                  {forgotStep === 1 && (
                    <form onSubmit={onSendResetCode} className="space-y-3.5">
                      <div className="text-xs text-slate-300">
                        Enter your work email address to receive a 6-digit recovery code.
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500"
                          placeholder="admin@hrv-homes.com"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={busy}
                        className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 cursor-pointer"
                      >
                        Send Reset Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className="w-full text-center text-xs text-slate-400 hover:text-white pt-1 cursor-pointer"
                      >
                        Back to Employer Sign-In
                      </button>
                    </form>
                  )}

                  {forgotStep === 2 && (
                    <form onSubmit={onResetPasswordSubmit} className="space-y-3.5">
                      <div className="text-xs text-slate-300">
                        Enter the verification code and set your new password.
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="6-digit code"
                          className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-sm text-white font-mono text-center tracking-widest"
                          maxLength={6}
                        />
                        <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-1 rounded">
                          OTP: {generatedCode}
                        </span>
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password (min 8 chars)"
                        className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-sm text-white font-mono"
                      />
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-sm text-white font-mono"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 cursor-pointer"
                      >
                        Reset Password
                      </button>
                    </form>
                  )}

                  {forgotStep === 3 && (
                    <div className="text-center space-y-3 py-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <div className="text-sm font-bold text-white">Password Updated!</div>
                      <button
                        type="button"
                        onClick={completeResetAndSignIn}
                        className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 cursor-pointer"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Employer Demo Credentials */}
              {mode === 'signin' && (
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>One-Click Employer Demos:</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Dem0Demo123!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {employerDemoAccounts.map((a) => (
                      <button
                        key={a.email}
                        type="button"
                        onClick={() => selectDemoAccount(a.email)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          selectedDemo === a.email
                            ? 'bg-teal-950/60 border-teal-500/50 text-white ring-1 ring-teal-500/30'
                            : 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold text-white">{a.name}</div>
                        <div className="text-[10px] text-teal-400 capitalize">{a.role.replace('_', ' ')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt to switch to Attendance */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-300">Caregiver or DSP reporting for shift?</span>
                <button
                  type="button"
                  onClick={() => {
                    setPortal('attendance');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Clock In Here</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PORTAL 2: TIME & ATTENDANCE (CLOCK IN) KIOSK */}
          {/* ========================================================= */}
          {portal === 'attendance' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>MaineCare EVV Clock-In Terminal</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Care Staff Attendance</span>
                  <Clock className="w-5 h-5 text-emerald-400" />
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Direct Support Professionals (DSPs) &amp; Caregivers Kiosk Terminal for electronic shift punch tracking.
                </p>
              </div>

              {/* Digital Kiosk Clock Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl text-center space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  {kioskTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-wider">
                  {kioskTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Real-time EVV Geotag &amp; Time Synchronization Active</span>
                </div>
              </div>

              {/* Quick Launch Demo DSP Staff Punch */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quick Direct Support Professional (DSP) Clock-In:</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">1-Tap</span>
                </div>

                <button
                  type="button"
                  onClick={() => onQuickLaunchStaff('maria.garcia@hrv-homes.com')}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                      MG
                    </div>
                    <div>
                      <div className="font-bold">Maria Garcia (EMP-1001)</div>
                      <div className="text-[10px] text-emerald-200">Maple House · Direct Support Professional</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-100 bg-white/10 px-2.5 py-1 rounded-lg text-xs font-bold">
                    <span>Clock In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Or Manual Staff Code / Email Sign-In */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="text-xs font-semibold text-slate-300">Staff Shift Terminal Punch</div>

                <form onSubmit={onStaffClockInSignIn} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Employee Email or Code</label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. maria.garcia@hrv-homes.com"
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">PIN / Password</label>
                    <div className="relative">
                      <input
                        type={showStaffPassword ? 'text' : 'password'}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showStaffPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Launch Attendance Clock Terminal</span>
                  </button>
                </form>
              </div>

              {/* Prompt to switch back to Employer Sign-In */}
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-300">Need management or payroll admin tools?</span>
                <button
                  type="button"
                  onClick={() => {
                    setPortal('employer');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Employer Sign-In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
