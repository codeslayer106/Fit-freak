// pages/dashboard.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import StatCard from '../components/StatCard';
import MacroBar from '../components/MacroBar';
import RingProgress from '../components/RingProgress';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { getTodayString, formatCalories, formatDate, pct } from '../lib/utils';
import { Flame, Dumbbell, Droplets, TrendingUp, Apple } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [foodLog,     setFoodLog]     = useState(null);
  const [activities,  setActivities]  = useState([]);
  const [water,       setWater]       = useState(null);
  const [analytics,   setAnalytics]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const today = getTodayString();
    try {
      const [food, act, wat, anl] = await Promise.all([
        api.get(`/food/log?date=${today}`),
        api.get(`/activity?date=${today}`),
        api.get(`/water?date=${today}`),
        api.get('/food/analytics?days=7'),
      ]);
      setFoodLog(food.data);
      setActivities(act.data.activities || []);
      setWater(wat.data);
      setAnalytics(anl.data.analytics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const calorieGoal   = user?.dailyCalorieGoal || 2000;
  const consumed      = foodLog?.totalCalories  || 0;
  const burned        = activities.reduce((s, a) => s + a.caloriesBurned, 0);
  const netCalories   = consumed - burned;
  const waterGoal     = user?.dailyWaterGoal || 2500;
  const waterAmt      = water?.totalAmount || 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card p-3 text-sm shadow-xl">
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{formatDate(label)}</p>
        <p style={{ color: '#14b8a6' }}>{payload[0]?.value} kcal</p>
      </div>
    );
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AuthGuard>
      <Head><title>Dashboard — FitAI</title></Head>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]} 👋</span>
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="badge badge-brand px-4 py-2 text-sm">
            🎯 Goal: {user?.goal?.replace('_', ' ') || 'Maintenance'}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Calories Consumed" value={formatCalories(consumed)} unit="kcal"
            icon="🔥" color="#f97316" />
          <StatCard label="Calories Burned"   value={formatCalories(burned)}   unit="kcal"
            icon="💪" color="#14b8a6" />
          <StatCard label="Net Calories"       value={formatCalories(netCalories)} unit="kcal"
            icon="⚡" color="#a78bfa" />
          <StatCard label="Water Intake"       value={Math.round(waterAmt / 100) / 10} unit="L"
            icon="💧" color="#3b82f6" />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Calorie ring + macros */}
          <div className="lg:col-span-1 card">
            <h2 className="section-title">Today's Calories</h2>
            <p className="section-subtitle">Goal: {formatCalories(calorieGoal)} kcal</p>

            <div className="flex justify-center mb-6">
              <RingProgress
                value={consumed} max={calorieGoal} size={150} strokeWidth={12}
                color={consumed > calorieGoal ? '#ef4444' : '#14b8a6'}
                sublabel="of goal"
              />
            </div>

            <div className="space-y-4">
              <MacroBar label="Protein" value={foodLog?.totalProtein || 0}
                goal={user?.dailyProteinGoal || 150} color="#14b8a6" />
              <MacroBar label="Carbs"   value={foodLog?.totalCarbs   || 0}
                goal={user?.dailyCarbGoal    || 250} color="#f97316" />
              <MacroBar label="Fat"     value={foodLog?.totalFat     || 0}
                goal={user?.dailyFatGoal     || 65}  color="#a78bfa" />
            </div>
          </div>

          {/* Weekly chart */}
          <div className="lg:col-span-2 card">
            <h2 className="section-title">Weekly Calories</h2>
            <p className="section-subtitle">Last 7 days overview</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analytics} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).split(',')[0]}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#14b8a6" strokeWidth={2.5}
                  fill="url(#calGrad)" dot={{ fill: '#14b8a6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#14b8a6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water tracker */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Hydration</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{waterAmt} / {waterGoal} ml</p>
            </div>
            <span className="text-2xl">💧</span>
          </div>
          <div className="progress-bar h-4">
            <div className="progress-fill h-full"
              style={{
                width: `${pct(waterAmt, waterGoal)}%`,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
              }} />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>0</span>
            <span>{Math.round(waterGoal / 2)} ml</span>
            <span>{waterGoal} ml</span>
          </div>
        </div>

        {/* Recent foods */}
        {foodLog?.items?.length > 0 && (
          <div className="card">
            <h2 className="section-title mb-4">Today's Meals</h2>
            <div className="space-y-2">
              {foodLog.items.slice(-5).reverse().map((item) => (
                <div key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {{ breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }[item.mealType] || '🍽️'}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.mealType}</p>
                    </div>
                    {item.aiDetected && <span className="badge badge-brand text-xs">AI</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{item.calories} kcal</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>P:{item.protein}g C:{item.carbs}g F:{item.fat}g</p>
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

Dashboard.Layout = Layout;
