# NUU Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Set Up Supabase (5 minutes)

```bash
# 1. Go to https://supabase.com and create a project
# 2. Copy your credentials from Project Settings → API
# 3. Create .env file:
cp .env.example .env

# 4. Edit .env with your credentials:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

**Run Migration:**
- Go to Supabase Dashboard → SQL Editor
- Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
- Click "Run"

### 2. Import Sample Data (1 minute)

```bash
npm run import-data
```

This imports 20 sample properties into your database.

### 3. Test Locally (2 minutes)

```bash
# Install Vercel CLI (if needed)
npm install -g vercel

# Run dev server
vercel dev
```

**Test the API:**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "property_types": ["2BED"],
      "price_max": 1000,
      "location_center": {"lat": -33.8688, "lng": 151.2093, "suburb": "Sydney"},
      "location_radius": 10,
      "features": ["PARKING"],
      "amenities": [],
      "utilities": [],
      "weights": {"price": 0.25, "location": 0.30, "features": 0.20, "amenities": 0.15, "modernity": 0.10}
    }
  }'
```

---

## 📁 Project Structure

```
backend/
├── lib/
│   ├── supabase.ts       # Database client
│   └── matching.ts       # Matching algorithm
├── api/
│   ├── search.ts         # Search logic
│   └── properties.ts     # Property CRUD
└── data/
    └── sample_properties.csv

api/                      # Vercel serverless functions
├── search.ts
└── properties/
    ├── index.ts
    └── [id].ts

supabase/migrations/      # Database schema
```

---

## 🔧 Common Commands

```bash
# Import data
npm run import-data

# Build frontend
npm run build

# Run dev server (frontend only)
npm run dev

# Run full stack (Vercel)
vercel dev

# Deploy to Vercel
vercel --prod
```

---

## 📚 Full Documentation

- **Architecture Plan**: `property_integration_architecture.md`
- **Setup Guide**: `setup_guide.md`
- **Walkthrough**: `walkthrough.md`

---

## ✅ What's Working

- ✅ Database schema with 20 sample properties
- ✅ Matching algorithm (5-component weighted scoring)
- ✅ API endpoints (search, properties)
- ✅ Vercel serverless functions
- ✅ Frontend with advanced filters

---

## 🎯 Next Steps

1. **Connect Frontend**: Update `SearchDemo.jsx` to call `/api/search`
2. **Deploy**: Push to GitHub → Import to Vercel → Add env vars → Deploy
3. **Phase 2**: Integrate PropTrack API for real property data

---

## 💡 Tips

- **Free Tier**: Supabase + Vercel free tiers are enough for MVP
- **Sample Data**: 20 properties across Sydney, Melbourne, Brisbane
- **Matching**: Scores are 0-100 with detailed breakdowns
- **Location**: Uses Haversine formula for accurate distance

---

## 🆘 Need Help?

Check `setup_guide.md` for detailed troubleshooting and step-by-step instructions.
