// pages/food.js
import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import AuthGuard from '../components/AuthGuard';
import MacroBar from '../components/MacroBar';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { getTodayString, COMMON_FOODS, getMealIcon } from '../lib/utils';
import { Plus, Trash2, Camera, Search, X, Sparkles, ChevronDown } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const emptyForm = { name: '', calories: '', protein: '', carbs: '', fat: '', quantity: 1, unit: 'serving', mealType: 'snack' };

export default function FoodPage() {
  const { user } = useAuthStore();
  const [date,        setDate]        = useState(getTodayString());
  const [log,         setLog]         = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [showForm,    setShowForm]    = useState(false);
  const [showAI,      setShowAI]      = useState(false);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiResults,   setAiResults]   = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const fileRef = useRef();

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/food/log?date=${date}`);
      setLog(data);
    } catch { toast.error('Failed to load food log'); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!form.name || !form.calories) return toast.error('Name and calories are required');
    try {
      await api.post('/food/log', { ...form, date });
      toast.success('Food logged!');
      setForm(emptyForm);
      setShowForm(false);
      fetchLog();
    } catch { toast.error('Failed to log food'); }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/food/log/${itemId}?date=${date}`);
      toast.success('Removed');
      fetchLog();
    } catch { toast.error('Failed to remove'); }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setAiLoading(true);
    setAiResults(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/ai/analyze-food', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAiResults(data);
    } catch { toast.error('AI analysis failed. Check your API key.'); }
    finally { setAiLoading(false); }
  };

  const addAiItem = async (item) => {
    try {
      await api.post('/food/log', {
        name:       item.name,
        calories:   item.calories,
        protein:    item.protein,
        carbs:      item.carbs,
        fat:        item.fat,
        quantity:   item.quantity,
        unit:       item.unit,
        mealType:   form.mealType,
        aiDetected: true,
        date,
      });
      toast.success(`${item.name} logged!`);
      fetchLog();
    } catch { toast.error('Failed to log item'); }
  };

  const quickAdd = (food) => {
    setForm({ ...emptyForm, ...food });
    setShowForm(true);
    setSearch('');
  };

  const filteredCommon = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const groupedItems   = MEAL_TYPES.map(meal => ({
    meal,
    items: log?.items?.filter(i => i.mealType === meal) || [],
  })).filter(g => g.items.length > 0);

  return (
    <AuthGuard>
      <Head><title>Nutrition — FitAI</title></Head>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Nutrition Tracker</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Log your meals and macros</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="input-field py-2 text-sm w-auto" />
            <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
              onClick={() => { setShowForm(true); setShowAI(false); }}>
              <Plus size={16} /> Log Food
            </button>
            <button
              onClick={() => { setShowAI(true); setShowForm(false); }}
              className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
              <Sparkles size={16} /> AI Detect
            </button>
          </div>
        </div>

        {/* Daily totals */}
        {log && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Daily Summary</h2>
              <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                {log.totalCalories} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/ {user?.dailyCalorieGoal || 2000} kcal</span>
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <MacroBar label="Protein" value={log.totalProtein} goal={user?.dailyProteinGoal || 150} color="#14b8a6" />
              <MacroBar label="Carbs"   value={log.totalCarbs}   goal={user?.dailyCarbGoal    || 250} color="#f97316" />
              <MacroBar label="Fat"     value={log.totalFat}     goal={user?.dailyFatGoal     || 65}  color="#a78bfa" />
            </div>
          </div>
        )}

        {/* AI Panel */}
        {showAI && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2"><Sparkles size={18} /> AI Food Detection</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Upload a food photo and let AI calculate calories</p>
              </div>
              <button onClick={() => { setShowAI(false); setAiResults(null); setPreview(null); }}
                style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {/* Upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 mb-4"
              style={{ borderColor: 'var(--border)' }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#14b8a6'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files[0]); e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleImageUpload(e.target.files[0])} />
              {preview ? (
                <img src={preview} alt="Food preview" className="max-h-48 mx-auto rounded-xl object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                  <Camera size={40} />
                  <p>Drag & drop or click to upload a food photo</p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            {aiLoading && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#14b8a6' }} />
                <span style={{ color: 'var(--text-secondary)' }}>AI is analyzing your food…</span>
              </div>
            )}

            {aiResults?.items && (
              <div className="space-y-3">
                {aiResults.note && (
                  <div className="badge badge-warning p-2 w-full text-xs">{aiResults.note}</div>
                )}
                {aiResults.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.quantity}{item.unit} • P:{item.protein}g C:{item.carbs}g F:{item.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{item.calories} kcal</span>
                      <button className="btn-primary py-1.5 px-3 text-xs" onClick={() => addAiItem(item)}>
                        Add
                      </button>
                    </div>
                  </div>
                ))}
                {aiResults.alternatives?.length > 0 && (
                  <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(20,184,166,0.08)', color: 'var(--brand)' }}>
                    <p className="font-semibold mb-1">💡 Healthier alternatives:</p>
                    <ul className="space-y-0.5">
                      {aiResults.alternatives.map((a, i) => <li key={i}>• {a}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual form */}
        {showForm && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Log Food Manually</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {/* Quick search */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-3.5" style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search common foods to autofill…"
                className="input-field pl-9" />
              {search && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border overflow-hidden z-10 shadow-xl"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  {filteredCommon.slice(0, 6).map((f, i) => (
                    <button key={i} onClick={() => quickAdd(f)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-opacity-50 flex justify-between transition-colors"
                      style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                      <span>{f.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{f.calories} kcal</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAddFood} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Food Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="input-field" placeholder="e.g. Chicken Breast" required />
                </div>
                <div>
                  <label className="label">Meal Type</label>
                  <select value={form.mealType} onChange={e => setForm({...form, mealType: e.target.value})}
                    className="input-field">
                    {MEAL_TYPES.map(m => <option key={m} value={m}>{getMealIcon(m)} {m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { key: 'calories', label: 'Calories (kcal) *' },
                  { key: 'protein',  label: 'Protein (g)'       },
                  { key: 'carbs',    label: 'Carbs (g)'         },
                  { key: 'fat',      label: 'Fat (g)'           },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input type="number" min="0" step="0.1"
                      value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                      className="input-field" placeholder="0"
                      required={key === 'calories'} />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary py-2.5 px-5 text-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-5 text-sm">Log Food</button>
              </div>
            </form>
          </div>
        )}

        {/* Meal groups */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#14b8a6' }} />
          </div>
        ) : groupedItems.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No meals logged yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Start by adding a meal or using AI detection</p>
          </div>
        ) : (
          groupedItems.map(({ meal, items }) => (
            <div key={meal} className="card animate-slide-up">
              <h3 className="font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
                <span className="text-xl">{getMealIcon(meal)}</span>
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
                <span className="badge badge-brand ml-auto">
                  {items.reduce((s, i) => s + i.calories, 0)} kcal
                </span>
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                        {item.aiDetected && <span className="badge badge-brand ml-2">AI</span>}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{item.calories} kcal</span>
                      <button onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                        style={{ color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </AuthGuard>
  );
}

FoodPage.Layout = Layout;
