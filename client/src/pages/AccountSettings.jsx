import React, { useState } from 'react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CodeInput = ({ value, onChange }) => (
  <input
    type="text"
    inputMode="numeric"
    autoComplete="one-time-code"
    pattern="[0-9]{6}"
    maxLength={6}
    required
    placeholder="Enter the 6-digit code"
    value={value}
    onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
  />
);

export const AccountSettings = () => {
  const { user, setUser } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordCode, setPasswordCode] = useState('');
  const [passwordCodeSent, setPasswordCodeSent] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestEmailCode = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/account/email/request-code', { email: newEmail });
      setEmailCodeSent(true);
      setEmailMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send email verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmail = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/account/email/confirm', { code: emailCode });
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('workzen_user', JSON.stringify(updatedUser));
      setNewEmail('');
      setEmailCode('');
      setEmailCodeSent(false);
      setEmailMessage('Your email address has been updated and verified.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify your new email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordCode = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/account/password/request-code');
      setPasswordCodeSent(true);
      setPasswordMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send password verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassword = async (event) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/account/password/confirm', {
        code: passwordCode,
        newPassword,
      });
      setPasswordCode('');
      setNewPassword('');
      setPasswordCodeSent(false);
      setPasswordMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Account settings</h2>
        <p className="mt-1 text-sm text-slate-500">Update your email and password using verification codes.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/10">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-teal-50 p-2 text-teal-700"><Mail className="h-5 w-5" /></div>
          <div>
            <h3 className="font-bold text-slate-900">Change email address</h3>
            <p className="text-xs text-slate-500">Current email: {user?.email}</p>
          </div>
        </div>
        {emailCodeSent ? (
          <form className="space-y-4" onSubmit={handleConfirmEmail}>
            <p className="text-sm text-slate-600">{emailMessage}</p>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Verification code</span>
              <CodeInput value={emailCode} onChange={setEmailCode} />
            </label>
            <button disabled={loading} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify and update email'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleRequestEmailCode}
              className="ml-3 text-sm font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50"
            >
              Send another code
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRequestEmailCode}>
            {emailMessage && <p className="text-sm text-emerald-700">{emailMessage}</p>}
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">New email address</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
            <button disabled={loading} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Sending code...' : 'Send code to new email'}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/10">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><KeyRound className="h-5 w-5" /></div>
          <div>
            <h3 className="font-bold text-slate-900">Change password</h3>
            <p className="text-xs text-slate-500">A verification code will be sent to {user?.email}.</p>
          </div>
        </div>
        {passwordCodeSent ? (
          <form className="space-y-4" onSubmit={handleConfirmPassword}>
            <p className="text-sm text-slate-600">{passwordMessage}</p>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Verification code</span>
              <CodeInput value={passwordCode} onChange={setPasswordCode} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">New password</span>
              <input
                type="password"
                minLength={6}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
            <button disabled={loading} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Verify and update password'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleRequestPasswordCode}
              className="ml-3 text-sm font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50"
            >
              Send another code
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {passwordMessage && <p className="text-sm text-emerald-700">{passwordMessage}</p>}
            <button
              type="button"
              disabled={loading}
              onClick={handleRequestPasswordCode}
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send password verification code'}
            </button>
          </div>
        )}
      </section>

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        Verification codes expire after 10 minutes and can only be used once.
      </p>
    </div>
  );
};
