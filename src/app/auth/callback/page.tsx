'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthCallback() {
  useEffect(() => {
    // Redirect to home after Google auth
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030508]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#3B82F6]/20 border-t-[#3B82F6] rounded-full animate-spin mx-auto" />
        <p className="text-white text-sm">Signing in with Google...</p>
      </div>
    </div>
  );
}
