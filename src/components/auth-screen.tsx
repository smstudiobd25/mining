'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { login, signup, loginAsGuest, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await signup(email, password, name, referralCode || undefined);
    if (!result.success) {
      setError(result.error || 'Signup failed');
    }
  };

  const handleGuest = async () => {
    setError('');
    const result = await loginAsGuest();
    if (!result.success) {
      setError(result.error || 'Guest login failed');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot', email: forgotEmail }),
      });
      setForgotSent(true);
    } catch {
      setError('Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden crypto-bg crypto-grid">
      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563EB]/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-[80px]" />
        <div className="absolute top-2/3 left-1/4 w-[250px] h-[250px] bg-[#06B6D4]/8 rounded-full blur-[70px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[#2563EB]/30">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">Nexora Network</h1>
          <p className="text-muted-foreground text-sm mt-1">Mine Activity. Earn Rewards. Grow Together.</p>

          {/* Welcome bonus badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 text-[#2563EB] text-xs font-medium"
          >
            <Sparkles className="w-3 h-3" />
            Get 100 NXR Welcome Bonus!
          </motion.div>
        </motion.div>

        {/* Tab selector */}
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'login'
                ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'signup'
                ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms */}
        <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-3">
          {tab === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-secondary border-secondary-foreground/10 text-white placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-secondary border-secondary-foreground/10 text-white placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 bg-secondary border-secondary-foreground/10 text-white placeholder:text-muted-foreground"
            />
          </div>

          {tab === 'signup' && (
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Referral Code (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="pl-10 bg-secondary border-secondary-foreground/10 text-white placeholder:text-muted-foreground"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium py-5 shadow-lg shadow-[#2563EB]/30"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {tab === 'login' ? 'Login' : 'Create Account'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {tab === 'login' && (
          <button
            onClick={() => setShowForgot(true)}
            className="w-full text-center text-sm text-muted-foreground hover:text-[#2563EB] mt-3 transition-colors"
          >
            Forgot Password?
          </button>
        )}

        {/* Google Login - Coming Soon */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0A0F1C] text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-secondary-foreground/10 text-white relative overflow-hidden"
          disabled
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
          <span className="absolute top-1 right-2 text-[10px] bg-[#F59E0B] text-black px-1.5 py-0.5 rounded-full font-medium">
            Soon
          </span>
        </Button>

        {/* Guest Access */}
        <Button
          onClick={handleGuest}
          disabled={isLoading}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-white mt-3"
        >
          Quick Guest Access →
        </Button>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForgot(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                <button onClick={() => setShowForgot(false)} className="text-muted-foreground hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {forgotSent ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">📧</div>
                  <p className="text-white font-medium">Check your email</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    If an account with that email exists, a reset link will be sent.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-muted-foreground text-sm">Enter your email address and we&apos;ll send you a reset link.</p>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="pl-10 bg-secondary border-secondary-foreground/10 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                    Send Reset Link
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
