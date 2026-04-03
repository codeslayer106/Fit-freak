// pages/auth/register.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Zap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6)       return toast.error('Password must be at least 6 characters');

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome 🎉');
      router.push('/profile');   // Send new users to complete their profile
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <Head><title>Sign Up — FitAI</title></Head>
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 0 30px rgba(20,184,166,0.35)' }}>
              <Zap size={26} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Join FitAI</h1>
            <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>

          <div className="card animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="input-field pl-9" placeholder="John Doe" required />
                </div>
              </div>
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
                    className="input-field pl-9 pr-10" placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-3.5" style={{ color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
                  <input type={showPwd ? 'text' : 'password'} value={form.confirm}
                    onChange={e => setForm({...form, confirm: e.target.value})}
                    className="input-field pl-9" placeholder="Repeat password" required />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-white" />
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              By creating an account you agree to our{' '}
              <span style={{ color: 'var(--brand)' }}>Terms of Service</span> and{' '}
              <span style={{ color: 'var(--brand)' }}>Privacy Policy</span>
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[
              { icon: '🤖', text: 'AI calorie detection' },
              { icon: '📊', text: 'Weekly analytics'     },
              { icon: '💧', text: 'Water tracker'        },
              { icon: '🏋️', text: 'Workout logging'     },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
