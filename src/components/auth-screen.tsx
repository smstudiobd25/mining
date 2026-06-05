'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Gift, Loader2, Sparkles } from 'lucide-react';

export function AuthScreen() {
  const { login, signup, guestLogin, isLoading } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(loginEmail, loginPassword);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signup(signupEmail, signupPassword, signupName, referralCode || undefined);
    if (!result.success) {
      setError(result.error || 'Signup failed');
    }
  };

  const handleGuest = async () => {
    setError('');
    const result = await guestLogin();
    if (!result.success) {
      setError(result.error || 'Failed to create guest account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="text-4xl font-bold text-primary">N</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">Nexora Network</h1>
          <p className="text-muted-foreground mt-2">Mine Activity. Earn Rewards. Grow Together.</p>
        </div>

        {/* Welcome Bonus Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm"
        >
          <Gift className="w-4 h-4" />
          <span>Get 100 NXR Welcome Bonus!</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>

        <Card className="bg-card border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="pb-2">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardContent className="pt-4 px-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50"
                          required
                        />
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Login
                    </Button>
                  </form>

                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">or</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4 border-border/50 bg-secondary/30 hover:bg-secondary/50"
                      onClick={handleGuest}
                      disabled={isLoading}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Quick Guest Access
                    </Button>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Demo: admin@nexora.com / admin123<br />
                      or: user@nexora.com / user123
                    </p>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup">
                <CardContent className="pt-4 px-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-muted-foreground">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Your name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 bg-secondary/50 border-border/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral-code" className="text-muted-foreground">Referral Code (Optional)</Label>
                      <Input
                        id="referral-code"
                        type="text"
                        placeholder="NEXORA-XXXXXX"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="bg-secondary/50 border-border/50"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to Nexora&apos;s Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
