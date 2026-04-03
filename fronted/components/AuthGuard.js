// components/AuthGuard.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { Zap } from 'lucide-react';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center spin-slow"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <Zap size={22} className="text-white" />
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting…</p>
        </div>
      </div>
    );
  }

  return children;
}
