import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, Lock, ArrowRight, Check, Mail, KeyRound } from 'lucide-react';
import { api } from '../../services/api';
import { Profile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup' | 'forgot-password';
  onClose: () => void;
  onSuccess: (user: Profile) => void;
}

const HBTU_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Biochemical Engineering',
  'Food Technology',
  'Leather Technology',
  'Oil Technology',
  'Paint Technology',
  'Plastic Technology'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot-password'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [branch, setBranch] = useState(HBTU_BRANCHES[0]);
  const [academicYear, setAcademicYear] = useState<'1st Year' | '2nd Year' | '3rd Year' | 'Final Year' | 'M.Tech / PhD'>('3rd Year');
  const [rollNumber, setRollNumber] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'institutional_email' | 'student_id_card' | 'fee_receipt' | 'roll_number'>('institutional_email');
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isOpen) return null;

  const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOtp = async () => {
    if (!email.trim() || !isValidEmailFormat) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.sendOtp(email.trim());
      setOtpSent(true);
      setMode('otp');
      setSuccessMsg(`OTP code generated for ${email.toLowerCase().trim()}. Enter code below to continue.`);
      if (res.testCode) {
        setDevOtpHint(res.testCode);
        setOtpCode(res.testCode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(email.trim(), otpCode.trim());
      if (res.isNewUser) {
        // Need to complete registration info
        setMode('signup');
        setSuccessMsg('Email verified successfully! Complete your student profile details below.');
      } else if (res.user) {
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmailFormat) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email.trim());
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email or register a new profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmailFormat) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms of service and community safety guidelines to register.');
      return;
    }

    // Age validation: 18+
    if (!dateOfBirth) {
      setError('Date of birth is required to verify age eligibility (18+ required).');
      return;
    }

    const birth = new Date(dateOfBirth);
    const ageDifMs = Date.now() - birth.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) {
      setError('AFTERCLASS dating and social services are strictly reserved for students aged 18 or older.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        fullName: fullName.trim(),
        displayName: (displayName.trim() || fullName.trim().split(' ')[0]),
        email: email.trim().toLowerCase(),
        dateOfBirth,
        branch,
        academicYear,
        rollNumber: rollNumber.trim() || undefined,
        verificationMethod: 'institutional_email'
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isValidEmailFormat) {
      setError('Please enter your registered email address.');
      return;
    }
    setSuccessMsg('If an account exists for this email, recovery instructions have been dispatched.');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#151a25] border border-[#2b3548] rounded-2xl p-6 sm:p-8 shadow-2xl my-8 text-[#f3f4f6]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1d2636] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-heading font-extrabold text-xl text-[#f3f4f6]">
              AFTER<span className="text-[#d9b978]">CLASS</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#d9b978] font-bold px-2 py-0.5 rounded bg-[#d9b978]/10 border border-[#d9b978]/30">
              HBTU Exclusive
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f3f4f6]">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your student profile'}
            {mode === 'otp' && 'Enter 6-digit OTP'}
            {mode === 'forgot-password' && 'Reset account access'}
          </h2>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            {mode === 'login' && 'Sign in with your email and password, or use email OTP.'}
            {mode === 'signup' && 'Sign up with any email address to connect with students. Age 18+ required.'}
            {mode === 'otp' && `Enter the verification code dispatched to ${email}.`}
            {mode === 'forgot-password' && 'Enter your registered email address.'}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 flex items-start gap-2.5 text-xs text-[#f87171]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-start gap-2.5 text-xs text-[#4ade80]">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com or student@hbtu.ac.in"
                  required
                  className={`w-full px-3.5 py-2.5 bg-[#101827] border rounded-xl text-sm text-[#f3f4f6] placeholder-[#9ca3af]/40 focus:outline-none transition-colors ${
                    isValidEmailFormat 
                      ? 'border-[#4ade80] focus:border-[#4ade80]' 
                      : 'border-[#2b3548] focus:border-[#d9b978]'
                  }`}
                />
                {isValidEmailFormat && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4ade80] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Valid Email
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#9ca3af]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-xs text-[#d9b978] hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#101827] border border-[#2b3548] rounded-xl text-sm text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="submit"
                disabled={loading || !isValidEmailFormat}
                className="w-full py-2.5 px-4 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !isValidEmailFormat}
                className="w-full py-2 px-4 bg-[#1d2636] hover:bg-[#253247] text-[#d9b978] font-medium text-xs rounded-xl border border-[#2b3548] transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Or Sign In with Email OTP</span>
              </button>
            </div>

            <div className="text-center pt-2 text-xs text-[#9ca3af]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#d9b978] font-semibold hover:underline"
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* 2. CAMPUS OTP FORM */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-[#101827] rounded-xl border border-[#2b3548] text-xs text-[#9ca3af] space-y-1">
              <div className="flex items-center justify-between">
                <span>Verification Email:</span>
                <span className="font-mono text-[#f3f4f6] font-semibold">{email}</span>
              </div>
              {devOtpHint && (
                <div className="flex items-center justify-between text-[#d9b978] pt-1 border-t border-[#1d2636]">
                  <span>Campus Test OTP:</span>
                  <span className="font-mono font-bold tracking-widest">{devOtpHint}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                6-Digit Verification Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full px-4 py-3 bg-[#101827] border border-[#2b3548] rounded-xl text-center font-mono text-lg tracking-[0.3em] text-[#d9b978] placeholder-[#9ca3af]/30 focus:outline-none focus:border-[#d9b978]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-2.5 px-4 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
            </button>

            <div className="flex items-center justify-between text-xs text-[#9ca3af] pt-1">
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[#d9b978] hover:underline"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#9ca3af] hover:text-[#f3f4f6]"
              >
                Back to Password Login
              </button>
            </div>
          </form>
        )}

        {/* 3. SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com or student@hbtu.ac.in"
                  required
                  className={`w-full px-3 py-2 bg-[#101827] border rounded-xl text-xs sm:text-sm text-[#f3f4f6] placeholder-[#9ca3af]/40 focus:outline-none ${
                    isValidEmailFormat 
                      ? 'border-[#4ade80]' 
                      : 'border-[#2b3548] focus:border-[#d9b978]'
                  }`}
                />
                {isValidEmailFormat && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4ade80] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Valid Email
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Display Name (First name)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ananya"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  HBTU Branch *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                >
                  {HBTU_BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Academic Year *
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                  <option value="M.Tech / PhD">M.Tech / PhD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Date of Birth (18+ Required) *
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  max="2008-01-01"
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  HBTU Roll / Enrollment No.
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 220102035"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Account Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 accent-[#d9b978] w-4 h-4 rounded"
              />
              <label htmlFor="terms" className="text-[11px] text-[#9ca3af] leading-relaxed">
                I certify that I am at least 18 years old, an enrolled HBTU Kanpur student, and agree to the{' '}
                <span className="text-[#d9b978]">Community Safety Guidelines</span> and{' '}
                <span className="text-[#d9b978]">Privacy Policy</span>. No harassment, doxxing, or unauthorized disclosure.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isValidEmailFormat || !termsAccepted}
              className="w-full py-2.5 px-4 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Submitting Registration...' : 'Complete Registration'}
            </button>

            <div className="text-center pt-1 text-xs text-[#9ca3af]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#d9b978] font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                Registered Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-[#101827] border border-[#2b3548] rounded-xl text-sm text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978]"
              />
            </div>
            <button
              type="submit"
              disabled={!isValidEmailFormat}
              className="w-full py-2.5 px-4 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              Send Password Reset Link
            </button>
            <div className="text-center pt-2 text-xs text-[#9ca3af]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#d9b978] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
