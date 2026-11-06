import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const authStep = recoveryMode
    ? recoveryCodeSent
      ? 'recovery-code'
      : 'recovery-email'
    : verificationMode
      ? 'verification'
      : 'password-login';

  const { login, verifyEmail, resendVerification, requestRecoveryCode, loginWithRecoveryCode } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setNeedsVerification(result.message === 'Please verify your email before signing in.');
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyEmail(email, verificationCode);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    const result = await resendVerification(email);
    setLoading(false);

    if (result.success) {
      setVerificationMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  const handleRequestRecoveryCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await requestRecoveryCode(email);
    setLoading(false);

    if (result.success) {
      setRecoveryCodeSent(true);
      setRecoveryMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  const handleRecoveryLogin = async (resetPassword = false) => {
    setError('');
    if (resetPassword && recoveryNewPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await loginWithRecoveryCode(
      email,
      recoveryCode,
      resetPassword ? recoveryNewPassword : undefined
    );
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const openRecovery = () => {
    setError('');
    setRecoveryMode(true);
    setRecoveryCodeSent(false);
    setRecoveryCode('');
    setRecoveryNewPassword('');
    setShowRecoveryPassword(false);
  };

  const handleFillDefaultAdmin = () => {
    setEmail('tarunkushwaha456@gmail.com');
    setPassword('tannu@123');
  };

  return (
    <div className="auth-page flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="auth-shell relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_32px_100px_rgba(30,41,74,0.14)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="auth-brand-panel relative hidden min-h-[680px] flex-col justify-between overflow-hidden p-10 text-white lg:flex">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10 shadow-[0_0_0_42px_rgba(255,255,255,0.025),0_0_0_92px_rgba(255,255,255,0.02)]" />
          <div className="relative">
            <Logo size="md" theme="light" />
            <div className="mt-24 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d2d3ff]">
              <ShieldCheck className="h-3.5 w-3.5" /> Work, in balance
            </div>
            <h2 className="mt-5 max-w-sm font-display text-4xl font-semibold leading-[1.13] tracking-tight">
              Make room for work that matters.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
              A calmer way to bring your projects, people, and time together.
            </p>
          </div>
          <div className="relative space-y-3">
            {['One clear view of your work', 'Thoughtful team workflows', 'Time that tells a story'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/75">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#aaa7ff] text-[#202242]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                {item}
              </div>
            ))}
            <p className="pt-6 text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
              A little more focus. A lot more flow.
            </p>
          </div>
        </aside>
        <div className="px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-slate-900">
          Sign in to Workzen
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Workforce management, project governance & timesheet tracking
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="auth-card px-6 py-8 sm:px-8">
          <div key={authStep} className="auth-flow-panel">
          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {needsVerification && !verificationMode && !recoveryMode && (
            <button
              type="button"
              onClick={() => {
                setVerificationMode(true);
                setVerificationMessage(`Enter the code sent to ${email}, or request a new one.`);
                setError('');
              }}
              className="mb-4 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
            >
              Verify this email address
            </button>
          )}

          {!verificationMode && !recoveryMode && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/80 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-700" />
                <div className="text-[11px] text-indigo-900">
                  <span className="font-bold">Default Admin:</span> <span className="font-mono">tarunkushwaha456@gmail.com</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDefaultAdmin}
                className="text-[11px] font-bold text-indigo-700 underline hover:text-indigo-900"
              >
                Auto-fill
              </button>
            </div>
          )}

          {recoveryMode ? (
            recoveryCodeSent ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{recoveryMessage}</p>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Email Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    placeholder="Enter the 6-digit code"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    New Password <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <div className="auth-password-field relative">
                    <input
                      type={showRecoveryPassword ? 'text' : 'password'}
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Leave blank to sign in without changing it"
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryPassword((visible) => !visible)}
                      aria-label={showRecoveryPassword ? 'Hide new password' : 'Show new password'}
                      aria-pressed={showRecoveryPassword}
                      className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-400 hover:text-indigo-600 focus-visible:outline-indigo-500"
                    >
                      {showRecoveryPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRecoveryLogin(false)}
                  className="auth-primary-button flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Sign In with Code'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRecoveryLogin(true)}
                  className="flex w-full items-center justify-center rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-50 disabled:opacity-50"
                >
                  Sign In and Update Password
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRequestRecoveryCode}
                  className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  Send a new code
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleRequestRecoveryCode}>
                <p className="text-sm text-slate-600">
                  Enter your account email and we’ll send a one-time sign-in code. You can optionally set a new password after verification.
                </p>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-teal-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Sending...' : 'Send Sign-In Code'}
                </button>
              </form>
            )
          ) : verificationMode ? (
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
                className="flex w-full items-center justify-center rounded-xl bg-teal-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition-all"
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
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Work Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@workzen.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Remember this device
              </label>
            </div>
            <button
              type="button"
              onClick={openRecovery}
              className="w-full text-left text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Forgot password? Sign in with an email code
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          )}
          </div>

          {(verificationMode || recoveryMode) && (
            <button
              type="button"
              onClick={() => {
                setVerificationMode(false);
                setRecoveryMode(false);
                setNeedsVerification(false);
                setError('');
              }}
              className="mt-4 w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Back to password sign in
            </button>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Need a new workforce account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};
