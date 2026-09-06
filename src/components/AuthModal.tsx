import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, User as UserIcon, CheckCircle2, Shield } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  isDark: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isDark,
}) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: email.includes('admin') ? 'admin' : 'user',
        createdAt: Date.now(),
      };
      onLoginSuccess(newUser);
      onClose();
    } else {
      if (!email.includes('@')) {
        setError('Please enter your email.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      // Check for owner / admin demo email
      const isAdmin =
        email.toLowerCase() === 'ranveernishad830@gmail.com' ||
        email.toLowerCase().includes('admin');

      const loggedInUser: User = {
        id: `usr-${Date.now()}`,
        name: isAdmin ? 'Ranveer Nishad' : email.split('@')[0],
        email: email.trim(),
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: isAdmin ? 'admin' : 'user',
        createdAt: Date.now(),
      };
      onLoginSuccess(loggedInUser);
      onClose();
    }
  };

  const loginDemoAccount = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      onLoginSuccess({
        id: 'usr-admin-ranveer',
        name: 'Ranveer Nishad',
        email: 'ranveernishad830@gmail.com',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'admin',
        createdAt: Date.now() - 86400000 * 30,
      });
    } else {
      onLoginSuccess({
        id: 'usr-guest-user',
        name: 'Sarah Connor',
        email: 'sarah.tech@example.com',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'user',
        createdAt: Date.now() - 86400000 * 5,
      });
    }
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="auth-modal-card"
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 relative ${
          isDark
            ? 'bg-[#1e1e1e] border-[#303030] text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isSignup ? 'Create your AI Vexa account' : 'Welcome back to AI Vexa'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isSignup
              ? 'Join to save chats, access vision models & voice'
              : 'Log in to sync your conversations across devices'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. Ranveer Nishad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none border transition-colors ${
                    isDark
                      ? 'bg-[#282828] border-[#383838] text-white focus:border-indigo-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none border transition-colors ${
                  isDark
                    ? 'bg-[#282828] border-[#383838] text-white focus:border-indigo-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold">Password</label>
              {!isSignup && (
                <div className="flex items-center gap-2">
                  {resetNotice && <span className="text-[11px] text-emerald-400 font-medium">{resetNotice}</span>}
                  <button
                    type="button"
                    onClick={() => {
                      setResetNotice('Reset email sent!');
                      setTimeout(() => setResetNotice(null), 3000);
                    }}
                    className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none border transition-colors ${
                  isDark
                    ? 'bg-[#282828] border-[#383838] text-white focus:border-indigo-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                }`}
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-xs font-semibold mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none border transition-colors ${
                    isDark
                      ? 'bg-[#282828] border-[#383838] text-white focus:border-indigo-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.99] mt-2"
          >
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-5 pt-4 border-t border-gray-500/15">
          <div className="text-[11px] text-gray-400 text-center mb-2.5">
            Quick 1-Click Demo Profiles:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginDemoAccount('admin')}
              className={`p-2 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                isDark
                  ? 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                  : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Ranveer (Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => loginDemoAccount('user')}
              className={`p-2 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                isDark
                  ? 'border-gray-700 bg-gray-800/60 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Sarah (User)</span>
            </button>
          </div>
        </div>

        {/* Switch Login / Signup */}
        <div className="mt-4 text-center text-xs text-gray-400">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
            }}
            className="text-indigo-400 font-semibold hover:underline"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
