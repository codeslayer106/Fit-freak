// pages/profile.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { getGoalLabel } from '../lib/utils';
import { User, Scale, Target, Activity, Save, Calculator } from 'lucide-react';

const ACTIVITY_LEVELS = [
  { value: 'sedentary',   label: 'Sedentary',   desc: 'Little or no exercise' },
  { value: 'light',       label: 'Light',        desc: '1-3 days/week' },
  { value: 'moderate',    label: 'Moderate',     desc: '3-5 days/week' },
  { value: 'active',      label: 'Active',       desc: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active',  desc: 'Hard daily exercise' },
];

const GOALS = [
  { value: 'fat_loss',    label: '🔥 Fat Loss',      desc: '-500 kcal/day deficit' },
  { value: 'maintenance', label: '⚖️ Maintenance',   desc: 'Maintain current weight' },
  { value: 'muscle_gain', label: '💪 Muscle Gain',   desc: '+300 kcal/day surplus' },
];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form,   setForm]   = useState({});
  const [bmi,    setBmi]    = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name:          user.name          || '',
        age:           user.age           || '',
        height:        user.height        || '',
        weight:        user.weight        || '',
        gender:        user.gender        || 'male',
        goal:          user.goal          || 'maintenance',
        activityLevel: user.activityLevel || 'moderate',
        dailyWaterGoal:user.dailyWaterGoal|| 2500,
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/user/profile', form);
      setUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const fetchBmi = async () => {
    try {
      const { data } = await api.get('/user/bmi');
      setBmi(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not calculate BMI');
    }
  };

  const bmiColor = (bmi) => {
    if (!bmi) return '#14b8a6';
    if (bmi < 18.5) return '#3b82f6';
    if (bmi < 25)   return '#22c55e';
    if (bmi < 30)   return '#eab308';
    return '#ef4444';
  };

  return (
    <AuthGuard>
      <Head><title>Profile — FitAI</title></Head>
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold gradient-text">Your Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Keep your info updated for accurate calorie goals</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic info */}
          <div className="card animate-slide-up">
            <h2 className="section-title flex items-center gap-2"><User size={18} /> Basic Info</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Full Name</label>
                <input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
                  className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input value={user?.email || ''} disabled className="input-field opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select value={form.gender || 'male'} onChange={e => setForm({...form, gender: e.target.value})}
                  className="input-field">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" min="10" max="120" value={form.age || ''}
                  onChange={e => setForm({...form, age: e.target.value})}
                  className="input-field" placeholder="Years" />
              </div>
            </div>
          </div>

          {/* Body metrics */}
          <div className="card animate-slide-up">
            <h2 className="section-title flex items-center gap-2"><Scale size={18} /> Body Metrics</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" min="50" max="300" value={form.height || ''}
                  onChange={e => setForm({...form, height: e.target.value})}
                  className="input-field" placeholder="e.g. 175" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" min="20" max="500" step="0.1" value={form.weight || ''}
                  onChange={e => setForm({...form, weight: e.target.value})}
                  className="input-field" placeholder="e.g. 70" />
              </div>
              <div>
                <label className="label">Daily Water Goal (ml)</label>
                <input type="number" min="500" max="6000" step="100" value={form.dailyWaterGoal || 2500}
                  onChange={e => setForm({...form, dailyWaterGoal: e.target.value})}
                  className="input-field" />
              </div>
            </div>

            {/* BMI calculator */}
            <button type="button" onClick={fetchBmi}
              className="btn-secondary mt-4 flex items-center gap-2 text-sm py-2.5 px-4">
              <Calculator size={16} /> Calculate BMI
            </button>

            {bmi && (
              <div className="mt-4 p-4 rounded-xl flex items-start gap-4"
                style={{ background: `${bmiColor(bmi.bmi)}10`, border: `1px solid ${bmiColor(bmi.bmi)}30` }}>
                <div className="text-3xl font-bold" style={{ color: bmiColor(bmi.bmi) }}>{bmi.bmi}</div>
                <div>
                  <p className="font-semibold" style={{ color: bmiColor(bmi.bmi) }}>{bmi.category}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{bmi.advice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Goal */}
          <div className="card animate-slide-up">
            <h2 className="section-title flex items-center gap-2"><Target size={18} /> Fitness Goal</h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {GOALS.map(({ value, label, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm({...form, goal: value})}
                  className="p-4 rounded-xl border text-left transition-all duration-200"
                  style={{
                    borderColor: form.goal === value ? 'var(--brand)' : 'var(--border)',
                    background: form.goal === value ? 'rgba(20,184,166,0.08)' : 'var(--bg-secondary)',
                  }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Activity level */}
          <div className="card animate-slide-up">
            <h2 className="section-title flex items-center gap-2"><Activity size={18} /> Activity Level</h2>
            <div className="space-y-2 mt-4">
              {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm({...form, activityLevel: value})}
                  className="w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200 text-left"
                  style={{
                    borderColor: form.activityLevel === value ? 'var(--brand)' : 'var(--border)',
                    background: form.activityLevel === value ? 'rgba(20,184,166,0.08)' : 'var(--bg-secondary)',
                  }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                  {form.activityLevel === value && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--brand)' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Calorie goal preview */}
          {user?.dailyCalorieGoal && (
            <div className="card" style={{ background: 'rgba(20,184,166,0.05)', borderColor: 'rgba(20,184,166,0.2)' }}>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--brand)' }}>📊 Your Calculated Daily Goals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Calories',  value: user.dailyCalorieGoal, unit: 'kcal' },
                  { label: 'Protein',   value: user.dailyProteinGoal,  unit: 'g'    },
                  { label: 'Carbs',     value: user.dailyCarbGoal,     unit: 'g'    },
                  { label: 'Fat',       value: user.dailyFatGoal,      unit: 'g'    },
                ].map(({ label, value, unit }) => (
                  <div key={label}>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label} ({unit})</p>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                * Goals are recalculated using the Mifflin-St Jeor equation each time you save
              </p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-white" /> Saving…</>
            ) : (
              <><Save size={18} /> Save Profile</>
            )}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}

ProfilePage.Layout = Layout;
