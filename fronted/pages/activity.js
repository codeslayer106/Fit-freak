// pages/activity.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { getTodayString, EXERCISES, getActivityColor } from '../lib/utils';
import { Plus, Trash2, X, Flame, Clock } from 'lucide-react';

export default function ActivityPage() {
  const { user } = useAuthStore();
  const [date,       setDate]       = useState(getTodayString());
  const [activities, setActivities] = useState([]);
  const [totalBurned,setTotalBurned]= useState(0);
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [form, setForm] = useState({ name: 'running', category: 'cardio', duration: 30, caloriesBurned: '', notes: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/activity?date=${date}`);
      setActivities(data.activities || []);
      setTotalBurned(data.totalBurned || 0);
    } catch { toast.error('Failed to load activities'); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { fetch(); }, [fetch]);

  // Auto-estimate calories when exercise/duration changes
  useEffect(() => {
    const ex = EXERCISES.find(e => e.name === form.name);
    if (ex && form.duration) {
      const weight = user?.weight || 70;
      const est = Math.round(ex.met * weight * (form.duration / 60));
      setForm(f => ({ ...f, caloriesBurned: est, category: ex.category }));
    }
  }, [form.name, form.duration, user?.weight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activity', { ...form, date });
      toast.success('Activity logged!');
      setShowForm(false);
      setForm({ name: 'running', category: 'cardio', duration: 30, caloriesBurned: '', notes: '' });
      fetch();
    } catch { toast.error('Failed to log activity'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/activity/${id}`);
      toast.success('Removed');
      fetch();
    } catch { toast.error('Failed to remove'); }
  };

  // Weekly summary data (mock for now - can be extended)
  const summaryData = [
    { day: 'Mon', burned: 0 }, { day: 'Tue', burned: 0 },
    { day: 'Wed', burned: 0 }, { day: 'Thu', burned: 0 },
    { day: 'Fri', burned: 0 }, { day: 'Sat', burned: 0 },
    { day: 'Sun', burned: totalBurned },
  ];

  return (
    <AuthGuard>
      <Head><title>Activity — FitAI</title></Head>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Activity Tracker</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Log exercises and track calories burned</p>
          </div>
          <div className="flex gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="input-field py-2 text-sm w-auto" />
            <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
              onClick={() => setShowForm(true)}>
              <Plus size={16} /> Log Activity
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Calories Burned',  value: totalBurned,       unit: 'kcal', icon: '🔥', color: '#f97316' },
            { label: 'Activities Today', value: activities.length,  unit: 'done', icon: '💪', color: '#14b8a6' },
            { label: 'Total Duration',   value: activities.reduce((s, a) => s + a.duration, 0), unit: 'min', icon: '⏱️', color: '#a78bfa' },
          ].map(({ label, value, unit, icon, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${color}20` }}>{icon}</div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {value}<span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{unit}</span>
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Log form */}
        {showForm && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Log Activity</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Exercise</label>
                  <select value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="input-field">
                    {EXERCISES.map(ex => (
                      <option key={ex.name} value={ex.name}>{ex.label} ({ex.category})</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input type="number" min="1" value={form.duration}
                    onChange={e => setForm({...form, duration: parseInt(e.target.value) || 0})}
                    className="input-field" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Calories Burned (auto-estimated)</label>
                  <input type="number" min="0" value={form.caloriesBurned}
                    onChange={e => setForm({...form, caloriesBurned: parseInt(e.target.value) || 0})}
                    className="input-field" placeholder="Auto-calculated" />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    className="input-field" placeholder="How did it feel?" />
                </div>
              </div>
              {form.caloriesBurned > 0 && (
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(20,184,166,0.08)', color: 'var(--brand)' }}>
                  ⚡ Estimated {form.caloriesBurned} kcal burned for {form.duration} min of {form.name}
                  {user?.weight && ` (based on your ${user.weight}kg weight)`}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary py-2.5 px-5 text-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-5 text-sm">Log Activity</button>
              </div>
            </form>
          </div>
        )}

        {/* Activities list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#14b8a6' }} />
          </div>
        ) : activities.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">🏃</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No activities logged yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Start logging your workouts!</p>
          </div>
        ) : (
          <div className="card animate-slide-up">
            <h2 className="section-title mb-4">Today's Activities</h2>
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity._id} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${getActivityColor(activity.category)}20` }}>
                      <span style={{ fontSize: 18 }}>
                        {{ cardio: '🏃', strength: '💪', flexibility: '🧘', sports: '⚽', other: '🏋️' }[activity.category] || '🏋️'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                        {activity.name}
                        <span className="badge ml-2" style={{
                          background: `${getActivityColor(activity.category)}20`,
                          color: getActivityColor(activity.category),
                        }}>{activity.category}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-0.5" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        <span className="flex items-center gap-1"><Clock size={12} /> {activity.duration} min</span>
                        {activity.notes && <span>· {activity.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold flex items-center gap-1" style={{ color: '#f97316' }}>
                        <Flame size={14} />{activity.caloriesBurned}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>kcal</p>
                    </div>
                    <button onClick={() => handleDelete(activity._id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

ActivityPage.Layout = Layout;
