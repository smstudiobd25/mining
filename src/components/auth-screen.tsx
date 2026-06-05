'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, X, Zap, Shield, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// Floating particles component
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number }>>([]);

  useEffect(() => {
    const pts = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(pts);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#3B82F6' : p.id % 3 === 1 ? '#8B5CF6' : '#06B6D4',
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.id % 3 === 0 ? 'rgba(59,130,246,0.6)' : p.id % 3 === 1 ? 'rgba(139,92,246,0.6)' : 'rgba(6,182,212,0.6)'}`,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, p.id % 2 === 0 ? 20 : -20, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Orbit ring animation
function OrbitRings() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Outer orbit */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 500, height: 500 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full rounded-full border border-blue-500/[0.04]"
          style={{ boxShadow: '0 0 60px rgba(59,130,246,0.03), inset 0 0 60px rgba(59,130,246,0.02)' }}
        />
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400"
          style={{ boxShadow: '0 0 12px rgba(59,130,246,0.8), 0 0 24px rgba(59,130,246,0.4)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      {/* Inner orbit */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 320, height: 320 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full rounded-full border border-purple-500/[0.06]"
          style={{ boxShadow: '0 0 40px rgba(139,92,246,0.03), inset 0 0 40px rgba(139,92,246,0.02)' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"
          style={{ boxShadow: '0 0 10px rgba(139,92,246,0.8), 0 0 20px rgba(139,92,246,0.4)' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, loginAsGuest, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Login failed');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const result = await signup(email, password, name, referralCode || undefined);
    if (!result.success) setError(result.error || 'Signup failed');
  };

  const handleGuest = async () => {
    setError('');
    const result = await loginAsGuest();
    if (!result.success) setError(result.error || 'Guest login failed');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'forgot', email: forgotEmail }) });
      setForgotSent(true);
    } catch { setError('Failed to send reset email'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden auth-hyper-bg">
      {/* Animated background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary nebula glow */}
        <motion.div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.08) 40%, transparent 65%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Secondary glow */}
        <motion.div
          className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.06) 40%, transparent 60%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Cyan accent */}
        <motion.div
          className="absolute top-[60%] left-[5%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 55%)' }}
          animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 crypto-grid opacity-40" />
      </div>

      {/* Floating particles */}
      <FloatingParticles />

      {/* Orbit rings */}
      <OrbitRings />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo & branding */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          {/* Logo with holographic effect */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
            className="w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center text-5xl font-black text-white relative auth-logo-holo"
          >
            N
            {/* Holographic border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'conic-gradient(from 0deg, #3B82F6, #8B5CF6, #06B6D4, #3B82F6)',
                padding: 2,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <motion.h1
            className="text-3xl font-black tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-gradient-blue">Nexora</span>{' '}
            <span className="text-white">Network</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground/60 text-xs mt-2 font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Mine Activity. Earn Rewards. Grow Together.
          </motion.p>

          {/* Welcome bonus badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full text-xs font-bold relative overflow-hidden auth-bonus-badge"
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              }}
              animate={{ x: [-200, 200] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Zap className="w-3.5 h-3.5 text-yellow-400 relative z-10" />
            <span className="relative z-10">Get 100 NXR Welcome Bonus!</span>
          </motion.div>
        </motion.div>

        {/* Main auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="auth-card-hyper rounded-3xl p-5"
        >
          {/* Tab selector */}
          <div className="flex rounded-2xl p-1 mb-5 relative auth-tab-container">
            {/* Sliding indicator */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-xl auth-tab-indicator"
              style={{ width: 'calc(50% - 4px)' }}
              animate={{ x: tab === 'login' ? 2 : 'calc(100% + 2px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-200 relative z-10 ${
                  tab === t ? 'text-white' : 'text-muted-foreground/50 hover:text-white/80'
                }`}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-4 p-3.5 rounded-2xl text-sm font-medium auth-error-box"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={tab === 'login' ? handleLogin : handleSignup}
              className="space-y-3.5"
            >
              {tab === 'signup' && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                  <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
                    className="pl-11 rounded-2xl font-medium h-12 auth-input-hyper"
                  />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="pl-11 rounded-2xl font-medium h-12 auth-input-hyper"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="pl-11 pr-11 rounded-2xl font-medium h-12 auth-input-hyper"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tab === 'signup' && (
                <div className="relative group">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-purple-400 transition-colors" />
                  <Input placeholder="Referral Code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="pl-11 rounded-2xl font-medium h-12 auth-input-hyper"
                  />
                </div>
              )}

              {/* Submit button */}
              <Button type="submit" disabled={isLoading}
                className="w-full btn-hyper-ultra text-white font-bold h-12 rounded-2xl text-sm relative overflow-hidden mt-2">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {tab === 'login' ? 'Login to Nexora' : 'Create Account'}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          {tab === 'login' && (
            <button onClick={() => setShowForgot(true)}
              className="w-full text-center text-xs text-muted-foreground/40 hover:text-blue-400 mt-3 transition-colors font-medium">
              Forgot Password?
            </button>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full section-divider" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-3 text-muted-foreground/30 font-bold rounded-full"
                style={{ background: 'rgba(8,12,24,0.95)' }}>OR</span>
            </div>
          </div>

          {/* Google Login */}
          <Button variant="outline" className="w-full rounded-2xl font-semibold h-12 relative overflow-hidden auth-google-btn" disabled>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
            <span className="absolute top-1 right-2 text-[9px] font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-0.5 rounded-full">Soon</span>
          </Button>

          {/* Guest Access */}
          <Button onClick={handleGuest} disabled={isLoading} variant="ghost"
            className="w-full text-muted-foreground/40 hover:text-white mt-2 rounded-2xl font-semibold text-sm h-11 hover:bg-white/[0.03] transition-all">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Quick Guest Access
          </Button>
        </motion.div>

        {/* Bottom security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-1.5 mt-6 text-muted-foreground/25 text-[10px] font-medium"
        >
          <Shield className="w-3 h-3" />
          Secured with end-to-end encryption
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowForgot(false)}>
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-6 w-full max-w-sm auth-card-hyper relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/10 rounded-full blur-3xl" />

              <div className="flex items-center justify-between mb-5 relative">
                <h3 className="text-lg font-bold text-white">Reset Password</h3>
                <button onClick={() => setShowForgot(false)}
                  className="text-muted-foreground/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {forgotSent ? (
                <div className="text-center py-6 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}
                  >
                    <Mail className="w-7 h-7 text-blue-400" />
                  </motion.div>
                  <p className="text-white font-bold text-lg">Check your email</p>
                  <p className="text-muted-foreground/50 text-sm mt-2">If an account exists, a reset link will be sent.</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4 relative">
                  <p className="text-muted-foreground/50 text-sm">Enter your email address for a reset link.</p>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/50 group-focus-within:text-blue-400 transition-colors" />
                    <Input type="email" placeholder="Email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required
                      className="pl-11 rounded-2xl h-12 auth-input-hyper"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-hyper-ultra text-white rounded-2xl font-bold h-12">
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
