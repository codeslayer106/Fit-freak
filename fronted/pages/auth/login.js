// pages/auth/login.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🎉');
      router.push('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Head><title>Login — FitAI</title></Head>
      <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

        {/* Left: decorative */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #0a1628 100%)' }}>
          {/* Decorative circles */}
          {[200, 350, 500].map((size, i) => (
            <div key={i} className="absolute rounded-full border opacity-10"
              style={{ width: size, height: size, borderColor: '#14b8a6', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', animation: `spin-slow ${8 + i * 4}s linear infinite` }} />
          ))}
          <div className="relative z-10 text-center max-w-md">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 0 60px rgba(20,184,166,0.4)' }}>
              <Zap size={36} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">FitAI</h1>
            <p className="text-lg mb-8" style={{ color: '#94a3b8' }}>
              Your AI-powered fitness companion. Track nutrition, log workouts, and reach your goals.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '🤖', label: 'AI Food Detection' },
                { icon: '📊', label: 'Smart Analytics'  },
                { icon: '💪', label: 'Workout Tracking' },
              ].map(({ icon, label }) => (
                <div key={label} className="p-4 rounded-2xl text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-2xl mb-2">{icon}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">FitAI</span>
            </div>

            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="mb-8" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-medium" style={{ color: 'var(--brand)' }}>Sign up free</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="input-field pl-9" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="input-field pl-9 pr-10" placeholder="••••••••" required />
                  <button type="button" className="absolute right-3 top-3.5" onClick={() => setShowPwd(!showPwd)}
                    style={{ color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-white" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--brand)' }}>🚀 New here?</p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Create an account to start tracking your nutrition and fitness journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
