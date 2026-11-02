'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/app-store';
import { AttendanceClock } from '@/components/attendance-clock';
import {
  ShieldCheck,
  Clock,
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
  Building2,
  LogIn,
  UserPlus,
  KeyRound,
  HeartHandshake,
  Phone,
  Home,
} from 'lucide-react';

type Mode = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  const { login, signup, resetPassword, session, hydrated, accounts, logout, houses } = useApp();
  const router = useRouter();

  // Employer sign-in / registration state
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('admin@hrv-homes.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [employerError, setEmployerError] = useState<string | null>(null);
  const [employerSuccess, setEmployerSuccess] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string>('admin@hrv-homes.com');
  const [lastCreatedCaregiver, setLastCreatedCaregiver] = useState<{
    name: string;
    email: string;
    employeeCode: string;
  } | null>(null);

  // Time & attendance quick caregiver state
  const [staffEmail, setStaffEmail] = useState('maria.garcia@hrv-homes.com');
  const [staffPassword, setStaffPassword] = useState(DEMO_PASSWORD);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null);

  // Fallback houses list if store is still hydrating
  const availableHouses = houses.length > 0 ? houses : [
    { id: 'clxhouse01', name: 'Maple House' },
    { id: 'clxhouse02', name: 'Oak House' },
    { id: 'clxhouse03', name: 'Pine House' },
    { id: 'clxhouse04', name: 'Birch House' },
  ];

  // Sign-up state (default to registering a caregiver / employee for time & attendance)
  const [su, setSu] = useState({
    name: '',
    email: '',
    phone: '',
    houseId: availableHouses[0]?.id ?? 'clxhouse01',
    password: '',
    confirm: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
  });
  const [showSuPassword, setShowSuPassword] = useState(false);

  // Forgot password flow state for Employer
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('849201');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [busy, setBusy] = useState(false);

  // Live time ticker for Time & Attendance Kiosk
  const [kioskTime, setKioskTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setKioskTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Employees stay on this page to use the real-time Time & Attendance clock
  const isEmployee = session?.role === 'employee';

  useEffect(() => {
    if (hydrated && session && !isEmployee) {
      router.replace('/dashboard');
    }
  }, [hydrated, session, isEmployee, router]);

  // Employer Sign-In
  function onEmployerSignIn(e: React.FormEvent) {
    e.preventDefault();
    setEmployerError(null);
    setEmployerSuccess(null);
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (!res.ok) {
      setEmployerError(res.error ?? 'Login failed. Please verify credentials.');
      return;
    }
    const acct = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (acct?.role !== 'employee') {
      router.replace('/dashboard');
    }
  }

  // Time & Attendance Caregiver Punch Sign-In
  function onStaffClockInSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAttendanceError(null);
    setAttendanceSuccess(null);
    setBusy(true);
    const res = login(staffEmail, staffPassword);
    setBusy(false);
    if (!res.ok) {
      setAttendanceError(res.error ?? 'Staff verification failed. Please verify email/code and PIN/password.');
      return;
    }
  }

  // 1-Tap Quick DSP Punch
  function onQuickLaunchStaff(demoStaffEmail: string) {
    setStaffEmail(demoStaffEmail);
    setStaffPassword(DEMO_PASSWORD);
    setAttendanceError(null);
    setAttendanceSuccess(null);
    setBusy(true);
    const res = login(demoStaffEmail, DEMO_PASSWORD);
    setBusy(false);
    if (!res.ok) {
      setAttendanceError(res.error ?? 'Could not launch staff terminal.');
    }
  }

  // Registration: Allows registering Caregiver/Employee accounts OR Administrative accounts
  function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setEmployerError(null);
    setEmployerSuccess(null);
    if (su.password !== su.confirm) {
      setEmployerError('Passwords do not match.');
      return;
    }
    if (su.password.length < 8) {
      setEmployerError('Password must be at least 8 characters long.');
      return;
    }

    setBusy(true);

    if (su.role === 'employee') {
      // Caregiver registration: create account + employee roster record without kicking employer off the page
      const res = signup({
        name: su.name,
        email: su.email,
        password: su.password,
        role: 'employee',
        phone: su.phone,
        houseId: su.houseId,
        autoLogin: false,
      });
      setBusy(false);

      if (!res.ok) {
        setEmployerError(res.error ?? 'Caregiver registration failed.');
        return;
      }

      const assignedHouseName = availableHouses.find((h) => h.id === su.houseId)?.name ?? 'Group Home';
      const code = res.employeeCode ?? 'EMP';

      setLastCreatedCaregiver({
        name: su.name,
        email: su.email,
        employeeCode: code,
      });

      setEmployerSuccess(
        `Caregiver account for ${su.name} (${code}) created successfully! Assigned to ${assignedHouseName}. They now have full sign-in access to Time & Attendance.`
      );

      // Pre-fill credentials into the Time & Attendance terminal on the right side
      setStaffEmail(su.email);
      setStaffPassword(su.password);
      setAttendanceSuccess(`New Caregiver Ready to Clock In: ${su.name} (${code})`);

      // Reset form and switch back to sign-in view
      setSu({
        name: '',
        email: '',
        phone: '',
        houseId: availableHouses[0]?.id ?? 'clxhouse01',
        password: '',
        confirm: '',
        role: 'employee',
      });
      setMode('signin');
    } else {
      // Management registration: auto-log in and redirect to admin dashboard
      const res = signup({
        name: su.name,
        email: su.email,
        password: su.password,
        role: su.role,
        autoLogin: true,
      });
      setBusy(false);

      if (!res.ok) {
        setEmployerError(res.error ?? 'Administrative account creation failed.');
        return;
      }

      router.replace('/dashboard');
    }
  }

  // Employer Password Recovery Step 1
  function onSendResetCode(e: React.FormEvent) {
    e.preventDefault();
    setEmployerError(null);
    setEmployerSuccess(null);
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      setEmployerError('Please enter your work email address.');
      return;
    }
    const exists = accounts.some((a) => a.email.toLowerCase() === targetEmail);
    if (!exists) {
      setEmployerError(`No account found matching ${targetEmail}. Please check spelling or contact your administrator.`);
      return;
    }

    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setVerificationCode(code);
      setForgotStep(2);
      setEmployerSuccess(`A 6-digit reset code has been sent to ${targetEmail}.`);
    }, 500);
  }

  // Employer Password Recovery Step 2
  function onResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmployerError(null);
    setEmployerSuccess(null);
    if (verificationCode.trim() !== generatedCode) {
      setEmployerError('Invalid verification code. Please check the 6-digit code sent to your email.');
      return;
    }
    if (newPassword.length < 8) {
      setEmployerError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setEmployerError('New passwords do not match.');
      return;
    }

    setBusy(true);
    const res = resetPassword(forgotEmail, newPassword);
    setBusy(false);

    if (!res.ok) {
      setEmployerError(res.error ?? 'Failed to reset password.');
      return;
    }

    setForgotStep(3);
    setEmployerSuccess('Your password has been successfully updated.');
  }

  function completeResetAndSignIn() {
    setEmail(forgotEmail);
    setPassword(newPassword);
    setMode('signin');
    setForgotStep(1);
    setForgotEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setEmployerError(null);
    setEmployerSuccess('Password updated! You can now sign in.');
  }

  function selectEmployerDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setSelectedDemo(demoEmail);
    setEmployerError(null);
    setEmployerSuccess(null);
  }

  // Employee logged in view (Full Kiosk mode)
  if (hydrated && session && isEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <img
              src="/hcr-nav-logo.png"
              alt="Home Care Residential, LLC"
              className="h-9 sm:h-11 w-auto object-contain"
            />
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

        <main className="max-w-4xl w-full mx-auto my-6 sm:my-10">
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-teal-500/30 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
                    Active Caregiver Session
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">
                    Welcome, {session.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Direct Support Professional (DSP) · Electronic Visit Verification Active
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-semibold text-emerald-300">Terminal Connected</span>
                </div>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ========================================================= */}
      {/* TOP NAVIGATION HEADER WITH OFFICIAL HCR LOGO               */}
      {/* ========================================================= */}
      <header className="w-full border-b border-white/10 bg-slate-950/95 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between z-30 sticky top-0 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3">
          <img
            src="/hcr-nav-logo.png"
            alt="Home Care Residential, LLC — Home Is Where We Are Safe And Loved."
            className="h-9 sm:h-11 w-auto max-w-[280px] sm:max-w-[380px] object-contain"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/25">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>MaineCare Section 21 Certified</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Dual Portal Active</span>
          </div>
        </div>
      </header>

      {/* Main 50/50 Split Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ========================================================= */}
        {/* COMPONENT 1 (LEFT SIDE): EMPLOYER SIGN-IN & CAREGIVER REG */}
        {/* ========================================================= */}
        <div className="w-full lg:w-1/2 relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto bg-gradient-to-br from-slate-950 via-teal-950/70 to-slate-900 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Employer Branding */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-900/50">
              HCR
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">Home Care Residential</div>
              <div className="text-xs text-teal-400 font-medium">Payroll &amp; HR SaaS Platform</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              MaineCare Section 21 Certified Provider
            </span>
          </div>
        </div>

        {/* Employer Login / Registration Interactive Area */}
        <div className="relative z-10 my-6 sm:my-8 space-y-5 max-w-lg w-full mx-auto lg:mx-0">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/25">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Management &amp; HR Console</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'signin'
                ? 'Employer Sign-In'
                : mode === 'signup'
                  ? su.role === 'employee'
                    ? 'Register Caregiver Account'
                    : 'Register Management Account'
                  : 'Employer Account Recovery'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {mode === 'signup'
                ? 'Create a new employee/caregiver account to grant them immediate Time & Attendance clock-in access.'
                : 'Administrative portal for House Managers, Program Directors, and Payroll Admins.'}
            </p>
          </div>

          {/* Mode Switcher Tabs for Employer (Sign In vs Register / Add Staff) */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setEmployerError(null);
                  setEmployerSuccess(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setEmployerError(null);
                  setEmployerSuccess(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Staff / Admin</span>
              </button>
            </div>
          )}

          {/* Employer Feedback Banners */}
          {employerError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{employerError}</span>
            </div>
          )}
          {employerSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 space-y-2 text-xs text-emerald-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{employerSuccess}</span>
              </div>
              {lastCreatedCaregiver && (
                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-300">Credentials pre-filled in Kiosk</span>
                  <button
                    type="button"
                    onClick={() => onQuickLaunchStaff(lastCreatedCaregiver.email)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Launch Shift Clock-In Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={onEmployerSignIn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    autoComplete="username"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900/90 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="admin@hrv-homes.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotEmail(email);
                      setEmployerError(null);
                      setEmployerSuccess(null);
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
                    className="w-full bg-slate-900/90 border border-white/15 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-mono"
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
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Employer Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Caregiver / DSP vs Supervisor / Admin) */}
          {mode === 'signup' && (
            <form onSubmit={onSignUp} className="space-y-3.5">
              {/* Account Purpose Selector */}
              <div className="space-y-1.5 pb-1">
                <label className="text-xs font-semibold text-slate-300">Account Type to Register:</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSu({ ...su, role: 'employee' })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      su.role === 'employee'
                        ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Caregiver / DSP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSu({ ...su, role: 'manager' })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      su.role !== 'employee'
                        ? 'bg-teal-600 text-white shadow-md ring-1 ring-teal-400/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-300" />
                    <span>Admin / Supervisor</span>
                  </button>
                </div>
              </div>

              {/* Informational Callout for Caregiver Account */}
              {su.role === 'employee' && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/25 flex items-center gap-2 text-[11px] text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Registers a care staff member with an <strong>Employee ID</strong> and authorizes them for instant Time &amp; Attendance clock-in.
                  </span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {su.role === 'employee' ? 'Caregiver Full Name' : 'Administrator Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={su.name}
                    onChange={(e) => setSu({ ...su, name: e.target.value })}
                    required
                    placeholder={su.role === 'employee' ? 'e.g. David Smith' : 'e.g. Sarah Jenkins'}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {su.role === 'employee' ? 'Caregiver Email (Used for Shift Terminal Punch)' : 'Work Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={su.email}
                    onChange={(e) => setSu({ ...su, email: e.target.value })}
                    required
                    placeholder={su.role === 'employee' ? 'david.smith@hrv-homes.com' : 'sarah.jenkins@hrv-homes.com'}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Caregiver specific: Phone & Assigned House */}
              {su.role === 'employee' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={su.phone}
                        onChange={(e) => setSu({ ...su, phone: e.target.value })}
                        placeholder="207-555-0142"
                        className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Assigned Facility</label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={su.houseId}
                        onChange={(e) => setSu({ ...su, houseId: e.target.value })}
                        className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                      >
                        {availableHouses.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Administrative Role Selector if Admin is chosen */}
              {su.role !== 'employee' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Management Level</label>
                  <select
                    value={su.role}
                    onChange={(e) => setSu({ ...su, role: e.target.value as 'manager' | 'admin' })}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 px-3 text-xs text-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="manager">House Supervisor / Manager</option>
                    <option value="admin">Platform Administrator / HR Director</option>
                  </select>
                </div>
              )}

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    {su.role === 'employee' ? 'Staff PIN / Password' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showSuPassword ? 'text' : 'password'}
                      value={su.password}
                      onChange={(e) => setSu({ ...su, password: e.target.value })}
                      required
                      placeholder="Min 8 chars"
                      className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 pl-3 pr-8 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSuPassword(!showSuPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSuPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Confirm</label>
                  <input
                    type="password"
                    value={su.confirm}
                    onChange={(e) => setSu({ ...su, confirm: e.target.value })}
                    required
                    placeholder="Re-enter"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                  su.role === 'employee'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50'
                    : 'bg-teal-600 hover:bg-teal-500 shadow-teal-950/50'
                }`}
              >
                {busy ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Provisioning Account…</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {su.role === 'employee'
                        ? 'Register Caregiver & Enable Clock-In'
                        : 'Register Administrative Account'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FLOW */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password Recovery (Step {forgotStep} of 3)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setForgotStep(1);
                    setEmployerError(null);
                    setEmployerSuccess(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              {forgotStep === 1 && (
                <form onSubmit={onSendResetCode} className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Enter your registered administrator email to receive a secure 6-digit verification code.
                  </p>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Work Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="admin@hrv-homes.com"
                      className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 px-3 text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Send 6-Digit Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={onResetPasswordSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">6-Digit Verification Code</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="e.g. 849201"
                        required
                        className="flex-1 bg-slate-900 border border-white/15 rounded-xl py-2 px-3 text-sm text-white font-mono tracking-widest text-center"
                        maxLength={6}
                      />
                      <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-1 rounded">
                        OTP: {generatedCode}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">New Password (min 8 chars)</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      required
                      className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 px-3 text-sm text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                      className="w-full bg-slate-900 border border-white/15 rounded-xl py-2 px-3 text-sm text-white font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
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
            <div className="pt-3 border-t border-white/10 space-y-2.5">
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
                    onClick={() => selectEmployerDemo(a.email)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedDemo === a.email
                        ? 'bg-teal-950/70 border-teal-500/50 text-white ring-1 ring-teal-500/30'
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
        </div>

        {/* Mission Statement Quote */}
        <div className="relative z-10 p-4 rounded-xl bg-gradient-to-r from-teal-950/60 to-slate-900/60 border border-teal-500/20 max-w-lg w-full mx-auto lg:mx-0">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Core Values</span>
          </div>
          <p className="text-xs text-slate-300 italic">
            &ldquo;Home Is Where We Are Safe And Loved. Empowering our care staff with transparent tools to deliver extraordinary residential support.&rdquo;
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMPONENT 2 (RIGHT SIDE): TIME & ATTENDANCE LOGIN ONLY */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Caregiver Header */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-900/50">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">Frontline Care Staff Portal</div>
              <div className="text-xs text-emerald-400 font-medium">Time &amp; Attendance · EVV Kiosk Terminal</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>MaineCare EVV Geotagged Shift Verification</span>
            </span>
          </div>
        </div>

        {/* Time & Attendance Interactive Punch Area */}
        <div className="relative z-10 my-6 sm:my-8 space-y-5 max-w-lg w-full mx-auto lg:mx-0">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Care Staff Time &amp; Attendance</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Dedicated terminal for Direct Support Professionals (DSPs) to punch in and out with real-time EVV shift verification.
            </p>
          </div>

          {/* Attendance Feedback Banners */}
          {attendanceError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{attendanceError}</span>
            </div>
          )}
          {attendanceSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{attendanceSuccess}</span>
            </div>
          )}

          {/* Digital Kiosk Clock Display */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-900 border border-emerald-500/30 shadow-xl text-center space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {kioskTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-wider">
              {kioskTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time EVV Geotag &amp; Time Synchronization Active</span>
            </div>
          </div>

          {/* Quick Launch Demo DSP Staff Punch */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Direct Support Professional (DSP) Clock-In:</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">1-Tap</span>
            </div>

            <button
              type="button"
              onClick={() => onQuickLaunchStaff('maria.garcia@hrv-homes.com')}
              disabled={busy}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/60 transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                  MG
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Maria Garcia (EMP-1001)</div>
                  <div className="text-[10px] text-emerald-200">Maple House · Direct Support Professional</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
                <span>Clock In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Manual Staff Code / Email Sign-In */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3.5">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Staff Shift Terminal Punch (Manual)</span>
            </div>

            <form onSubmit={onStaffClockInSignIn} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Employee Email or Employee Code (e.g. EMP-1001)</label>
                <input
                  type="text"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. david.smith@hrv-homes.com or EMP-1001"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 pl-3 pr-9 text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showStaffPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Launch Attendance Clock Terminal</span>
              </button>
            </form>
          </div>
        </div>

        {/* Frontline Caregiver Notice */}
        <div className="relative z-10 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 max-w-lg w-full mx-auto lg:mx-0">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4" />
            <span>Attendance Kiosk Notice</span>
          </div>
          <p className="text-xs text-slate-300">
            Care staff clock-in punches automatically generate MaineCare Section 21 timesheet entries with GPS and server-verified timestamps.
          </p>
        </div>
      </div>

      </div>
    </div>
  );
}


