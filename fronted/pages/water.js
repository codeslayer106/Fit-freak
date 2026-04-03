// pages/water.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { getTodayString, pct } from '../lib/utils';
import { Droplets, Plus } from 'lucide-react';

const QUICK_AMOUNTS = [150, 200, 250, 350, 500, 750];

export default function WaterPage() {
  const { user } = useAuthStore();
  const [date,    setDate]    = useState(getTodayString());
  const [water,   setWater]   = useState({ totalAmount: 0, entries: [] });
  const [custom,  setCustom]  = useState('');
  const [loading, setLoading] = useState(false);

  const goal = user?.dailyWaterGoal || 2500;

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get(`/water?date=${date}`);
      setWater(data);
    } catch { toast.error('Failed to load water log'); }
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  const addWater = async (amount) => {
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await api.post('/water', { amount: parseInt(amount), date });
      toast.success(`+${amount}ml added 💧`);
      setCustom('');
      fetch();
    } catch { toast.error('Failed to log water'); }
    finally { setLoading(false); }
  };

  const total   = water.totalAmount || 0;
  const percent = pct(total, goal);
  const glasses = Math.round(total / 250);

  // Visual cups
  const totalCups  = 8;
  const filledCups = Math.min(Math.round(total / (goal / totalCups)), totalCups);

  return (
    <AuthGuard>
      <Head><title>Hydration — FitAI</title></Head>
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold gradient-text">Hydration Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Stay hydrated throughout the day</p>
        </div>

        {/* Date picker */}
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="input-field py-2 text-sm w-auto" />

        {/* Main card */}
        <div className="card text-center animate-slide-up">
          <div className="text-6xl mb-2">💧</div>
          <p className="text-5xl font-bold mb-1" style={{ color: '#3b82f6' }}>
            {(total / 1000).toFixed(1)}<span className="text-2xl font-normal" style={{ color: 'var(--text-muted)' }}>L</span>
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>of {(goal / 1000).toFixed(1)}L goal · ~{glasses} glasses</p>

          {/* Progress bar */}
          <div className="progress-bar h-4 mt-6 mb-2">
            <div className="progress-fill h-full transition-all duration-700"
              style={{
                width: `${percent}%`,
                background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
              }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{percent}% of daily goal</p>

          {/* Visual cups */}
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {Array.from({ length: totalCups }).map((_, i) => (
              <div key={i} className="w-10 h-12 rounded-b-xl rounded-t-sm border-2 flex items-end overflow-hidden transition-all duration-300"
                style={{ borderColor: i < filledCups ? '#3b82f6' : 'var(--border)' }}>
                <div className="w-full transition-all duration-500"
                  style={{
                    height: i < filledCups ? '100%' : '0%',
                    background: 'linear-gradient(180deg, #60a5fa, #2563eb)',
                  }} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick add */}
        <div className="card animate-slide-up">
          <h2 className="section-title mb-4">Quick Add</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {QUICK_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => addWater(amt)} disabled={loading}
                className="btn-secondary py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Droplets size={14} style={{ color: '#3b82f6' }} />
                {amt}ml
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="number" value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="Custom amount (ml)" className="input-field flex-1"
              onKeyDown={e => e.key === 'Enter' && addWater(custom)}
            />
            <button className="btn-primary flex items-center gap-2 px-4"
              onClick={() => addWater(custom)} disabled={loading}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Log history */}
        {water.entries?.length > 0 && (
          <div className="card animate-slide-up">
            <h2 className="section-title mb-4">Today's Log</h2>
            <div className="space-y-2">
              {[...water.entries].reverse().map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <Droplets size={16} style={{ color: '#3b82f6' }} />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.amount}ml</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(entry.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="card" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
          <h3 className="font-semibold mb-3" style={{ color: '#60a5fa' }}>💡 Hydration Tips</h3>
          <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• Drink a glass of water first thing in the morning</li>
            <li>• Have a glass before each meal to aid digestion</li>
            <li>• Drink more on days you exercise or it's hot</li>
            <li>• Herbal teas count towards your daily intake</li>
            <li>• Urine should be pale yellow — that's your hydration indicator</li>
          </ul>
        </div>
      </div>
    </AuthGuard>
  );
}

WaterPage.Layout = Layout;
