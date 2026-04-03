// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setTimeout(() => {
      router.replace(isAuthenticated ? '/dashboard' : '/auth/login');
    }, 500);
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center spin-slow"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 0 40px rgba(20,184,166,0.4)' }}>
          <Zap size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">FitAI</h1>
        <p style={{ color: 'var(--text-muted)' }}>Loading your fitness journey…</p>
      </div>
    </div>
  );
}
