import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, DollarSign, Building, Sparkles, Check } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    hourlyRate: '45',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      ...formData,
      hourlyRate: Number(formData.hourlyRate) || 40,
    });
    setLoading(false);

    if (result.success) {
      setVerificationEmail(result.email);
      setVerificationMessage(`We sent a six-digit code to ${result.email}.`);
    } else {
      setError(result.message);
      if (result.email) {
        setVerificationEmail(result.email);
        setVerificationMessage(`We couldn't send a code to ${result.email}. Fix the email service settings or retry below.`);
      }
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyEmail(verificationEmail, verificationCode);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setVerificationMessage('');
    setLoading(true);
    const result = await resendVerification(verificationEmail);
    setLoading(false);

    if (result.success) {
      setVerificationMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_32px_100px_rgba(27,45,31,0.12)] backdrop-blur-xl lg:grid-cols-[0.82fr_1.18fr]">
      <aside className="relative hidden min-h-[760px] flex-col justify-between overflow-hidden bg-[#202242] p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10 shadow-[0_0_0_42px_rgba(255,255,255,0.025),0_0_0_92px_rgba(255,255,255,0.02)]" />
        <div className="relative">
          <Logo size="md" theme="light" />
          <div className="mt-24 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d2d3ff]">
            <Sparkles className="h-3.5 w-3.5" /> A better kind of busy
          </div>
          <h2 className="mt-5 max-w-sm font-display text-4xl font-semibold leading-[1.13] tracking-tight">
            Good work starts with a little more clarity.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
            Bring your team into one thoughtful space to plan, track, and move forward.
          </p>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-5">
          <p className="text-xs font-medium leading-5 text-white/70">
            “The best work happens when the busywork gets out of the way.”
          </p>
          <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d2d3ff]">
            <Check className="h-3.5 w-3.5" /> Made for your team
          </div>
        </div>
      </aside>
      <div className="px-6 py-9 sm:px-10 lg:px-12 lg:py-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-slate-900">
          Create your Workzen account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Join the workforce management platform with role-based governance
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="auth-card py-7 px-6 sm:px-8">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {verificationEmail ? (
            <form className="space-y-4" onSubmit={handleVerifyEmail}>
              <p className="text-sm text-slate-600">{verificationMessage}</p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="Enter the 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-teal-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleResendCode}
                className="w-full text-center text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-50"
              >
                Send a new code
              </button>
            </form>
          ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="jordan@workzen.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Account Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['employee', 'manager', 'admin'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      formData.role === r
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Department
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Hourly Rate ($/hr)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    placeholder="45"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-teal-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 transition-all mt-6"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};
