// lib/utils.js

export const getTodayString = () => new Date().toISOString().split('T')[0];

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatCalories = (cal) => Math.round(cal).toLocaleString();

export const getMacroColor = (macro) => ({
  protein: '#14b8a6',
  carbs:   '#f97316',
  fat:     '#a78bfa',
  calories:'#fb923c',
}[macro] || '#64748b');

export const getMealIcon = (meal) => ({ breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }[meal] || '🍽️');

export const getGoalLabel = (goal) => ({ fat_loss: 'Fat Loss', muscle_gain: 'Muscle Gain', maintenance: 'Maintenance' }[goal] || goal);

export const getActivityColor = (category) => ({
  cardio:      '#14b8a6',
  strength:    '#f97316',
  flexibility: '#a78bfa',
  sports:      '#3b82f6',
  other:       '#64748b',
}[category] || '#64748b');

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const pct = (value, total) => total > 0 ? clamp(Math.round((value / total) * 100), 0, 100) : 0;

export const COMMON_FOODS = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0,  fat: 3.6 },
  { name: 'Brown Rice (100g)',     calories: 111, protein: 2.6,carbs: 23, fat: 0.9 },
  { name: 'Egg (1 large)',         calories: 72,  protein: 6,  carbs: 0.4,fat: 5   },
  { name: 'Oats (100g)',           calories: 389, protein: 17, carbs: 66, fat: 7   },
  { name: 'Banana (1 medium)',     calories: 89,  protein: 1.1,carbs: 23, fat: 0.3 },
  { name: 'Greek Yogurt (100g)',   calories: 59,  protein: 10, carbs: 3.6,fat: 0.4 },
  { name: 'Salmon (100g)',         calories: 208, protein: 20, carbs: 0,  fat: 13  },
  { name: 'Sweet Potato (100g)',   calories: 86,  protein: 1.6,carbs: 20, fat: 0.1 },
  { name: 'Almonds (28g)',         calories: 164, protein: 6,  carbs: 6,  fat: 14  },
  { name: 'Broccoli (100g)',       calories: 34,  protein: 2.8,carbs: 7,  fat: 0.4 },
  { name: 'Whole Milk (240ml)',    calories: 149, protein: 8,  carbs: 12, fat: 8   },
  { name: 'White Rice (100g)',     calories: 130, protein: 2.7,carbs: 28, fat: 0.3 },
  { name: 'Apple (1 medium)',      calories: 95,  protein: 0.5,carbs: 25, fat: 0.3 },
  { name: 'Peanut Butter (2tbsp)',calories: 188, protein: 8,  carbs: 6,  fat: 16  },
  { name: 'Bread (1 slice)',       calories: 79,  protein: 3,  carbs: 15, fat: 1   },
];

export const EXERCISES = [
  { name: 'running',       label: 'Running',        category: 'cardio',    met: 8.0 },
  { name: 'walking',       label: 'Walking',         category: 'cardio',    met: 3.5 },
  { name: 'cycling',       label: 'Cycling',         category: 'cardio',    met: 6.0 },
  { name: 'swimming',      label: 'Swimming',        category: 'cardio',    met: 7.0 },
  { name: 'weightlifting', label: 'Weight Training', category: 'strength',  met: 4.0 },
  { name: 'yoga',          label: 'Yoga',            category: 'flexibility',met: 2.5 },
  { name: 'hiit',          label: 'HIIT',            category: 'cardio',    met: 8.5 },
  { name: 'basketball',    label: 'Basketball',      category: 'sports',    met: 6.5 },
  { name: 'soccer',        label: 'Soccer',          category: 'sports',    met: 7.0 },
  { name: 'dancing',       label: 'Dancing',         category: 'cardio',    met: 4.5 },
];
