# 🏋️ FitAI — AI-Powered Fitness & Nutrition Tracker

A full-stack fitness tracking web app with AI food photo detection, calorie tracking, workout logging, hydration tracking, and beautiful analytics.

---

## 🌟 Features

- 🤖 **AI Food Detection** — Upload a photo, AI detects food & estimates calories
- 🍽️ **Nutrition Tracker** — Log meals by type (breakfast/lunch/dinner/snack)
- 📊 **Analytics** — Weekly calorie & macro charts
- 🏋️ **Activity Tracker** — Log workouts with auto calorie-burn estimation
- 💧 **Water Tracker** — Visual hydration tracker with quick-add buttons
- ⚖️ **BMI Calculator** — Instant BMI with health advice
- 🎯 **Smart Goals** — Calorie goals calculated via Mifflin-St Jeor equation
- 🌙 **Dark/Light Mode** — Full theme switching
- 📱 **Mobile-First** — Fully responsive design

---

## 📁 Project Structure

```
fitai/
├── backend/              # Node.js + Express API
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth middleware
│   ├── server.js         # Entry point
│   └── .env.example      # Environment template
│
├── frontend/             # Next.js app
│   ├── pages/            # Routes (dashboard, food, activity, water, profile)
│   ├── components/       # Reusable UI components
│   ├── store/            # Zustand auth state
│   ├── lib/              # API client + utilities
│   ├── styles/           # Global CSS
│   └── .env.example      # Environment template
│
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ → https://nodejs.org
- MongoDB Atlas account (free) → https://cloud.mongodb.com
- OpenAI API key (optional, for AI food detection) → https://platform.openai.com

---

### Step 1 — Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/fitai
JWT_SECRET=any_long_random_string_here
OPENAI_API_KEY=sk-your-openai-key   # Optional — mock data used if not set
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### Step 3 — Set Up MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com and create a free account
2. Click **"Build a Database"** → choose **M0 Free Tier**
3. Create a database user (username + password)
4. Under **Network Access** → click **"Add IP Address"** → **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Connect"** → **"Drivers"** → copy the connection string
6. Replace `<password>` in the string with your password
7. Paste it as `MONGODB_URI` in `backend/.env`

---

### Step 4 — Run the App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# ✅ Connected to MongoDB
# 🚀 FitAI server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Ready on http://localhost:3000
```

Open http://localhost:3000 in your browser 🎉

---

## 🤖 AI Food Detection Setup

1. Get an API key from https://platform.openai.com/api-keys
2. Add it to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxx
   ```
3. The app uses `gpt-4o` for high-accuracy food recognition
4. **Without a key:** the app still works — it returns demo/mock food data

---

## ☁️ Deployment Guide

### Option A — Vercel (Full-Stack, Recommended)

**Deploy Frontend to Vercel:**
1. Push your code to GitHub
2. Go to https://vercel.com → **New Project** → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
   ```
5. Click **Deploy** ✅

**Deploy Backend to Render:**
1. Go to https://render.com → **New Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add environment variables (same as your `.env`)
7. Click **Deploy** ✅

---

### Option B — Netlify (Frontend) + Render (Backend)

**Frontend on Netlify:**
1. Go to https://netlify.com → **Add New Site** → Import from Git
2. Set **Base Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `frontend/.next`
5. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
6. Click **Deploy** ✅

> ⚠️ Note: Netlify works best with static Next.js exports. For full SSR support, Vercel is recommended for the frontend.

---

### Option C — Railway (Backend Alternative)

1. Go to https://railway.app → **New Project** → **Deploy from GitHub**
2. Select your repo, set root to `backend`
3. Add all environment variables
4. Railway auto-detects Node.js and deploys ✅

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description                    | Auth |
|--------|-----------------------------|--------------------------------|------|
| POST   | /api/auth/register          | Create account                 | ❌   |
| POST   | /api/auth/login             | Login                          | ❌   |
| GET    | /api/auth/me                | Get current user               | ✅   |
| GET    | /api/user/profile           | Get profile                    | ✅   |
| PUT    | /api/user/profile           | Update profile & recalc goals  | ✅   |
| GET    | /api/user/bmi               | Calculate BMI                  | ✅   |
| GET    | /api/food/log?date=         | Get food log for date          | ✅   |
| POST   | /api/food/log               | Add food item                  | ✅   |
| DELETE | /api/food/log/:itemId       | Remove food item               | ✅   |
| GET    | /api/food/analytics?days=   | Weekly/monthly analytics       | ✅   |
| GET    | /api/activity?date=         | Get activities for date        | ✅   |
| POST   | /api/activity               | Log activity                   | ✅   |
| DELETE | /api/activity/:id           | Remove activity                | ✅   |
| POST   | /api/ai/analyze-food        | AI food photo analysis         | ✅   |
| GET    | /api/water?date=            | Get water log                  | ✅   |
| POST   | /api/water                  | Add water entry                | ✅   |

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | Next.js 14, React 18        |
| Styling    | Tailwind CSS, CSS Variables |
| State      | Zustand                     |
| Charts     | Recharts                    |
| Animations | Framer Motion               |
| Backend    | Node.js, Express.js         |
| Database   | MongoDB + Mongoose          |
| Auth       | JWT (jsonwebtoken)          |
| AI         | OpenAI GPT-4o Vision        |
| HTTP       | Axios                       |

---

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
→ Check your `MONGODB_URI` is correct and your IP is whitelisted in MongoDB Atlas

**"401 Unauthorized" errors**
→ Make sure `JWT_SECRET` is set and matches between restarts

**"AI analysis failed"**
→ Check your `OPENAI_API_KEY` is valid and has billing credits. Without a key, demo data is returned.

**CORS errors in browser**
→ Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly

**Port already in use**
→ Change `PORT=5001` in backend `.env` and update `NEXT_PUBLIC_API_URL` accordingly

---

## 📄 License

MIT — free to use, modify, and deploy.
