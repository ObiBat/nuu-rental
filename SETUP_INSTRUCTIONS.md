# 🚀 Final Setup Steps

## ✅ Completed
- `.env` file created with your Supabase credentials
- All backend code is ready

## 📋 Next Steps (5 minutes)

### Step 1: Run Database Migration

1. **Go to Supabase SQL Editor**:
   - Open: https://supabase.com/dashboard/project/knncneivhuwnldecahiu/sql/new
   - (You may need to log in first)

2. **Copy the SQL migration**:
   - Open file: `supabase/migrations/001_initial_schema.sql`
   - Copy ALL contents (166 lines)

3. **Paste and Run**:
   - Paste into the SQL editor
   - Click "Run" button (bottom right)
   - Wait for "Success. No rows returned" message

4. **Verify Tables Created**:
   - Go to: Table Editor (left sidebar)
   - You should see 3 tables:
     - `properties`
     - `user_preferences`
     - `match_results`

### Step 2: Import Sample Data

Run this command in your terminal:

```bash
npm run import-data
```

This will import 20 sample properties into your database.

**Expected output**:
```
🏠 NUU Property Data Import Tool

📂 Importing from: /Users/obi/Desktop/Projects/RENTAL/backend/data/sample_properties.csv

✅ Successfully imported 20 properties

✨ Import complete!
```

### Step 3: Verify Data

1. Go to Supabase → Table Editor → `properties`
2. You should see 20 rows with properties from Sydney, Melbourne, and Brisbane

### Step 4: Test the API

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Run local dev server
vercel dev
```

Once running, test the search endpoint:

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "property_types": ["2BED"],
      "price_max": 1000,
      "location_center": {
        "lat": -33.8688,
        "lng": 151.2093,
        "suburb": "Sydney"
      },
      "location_radius": 10,
      "features": ["PARKING"],
      "amenities": [],
      "utilities": [],
      "weights": {
        "price": 0.25,
        "location": 0.30,
        "features": 0.20,
        "amenities": 0.15,
        "modernity": 0.10
      }
    }
  }'
```

You should get back JSON with matching properties and their scores!

---

## 🎯 Quick Reference

**Your Supabase Project**: https://knncneivhuwnldecahiu.supabase.co

**Files to check**:
- ✅ `.env` — Credentials configured
- 📄 `supabase/migrations/001_initial_schema.sql` — Copy this to SQL editor
- 📊 `backend/data/sample_properties.csv` — 20 sample properties

**Commands**:
```bash
npm run import-data    # Import sample data
vercel dev             # Run local server
npm run build          # Build frontend
```

---

## ⚠️ Troubleshooting

**"Missing Supabase environment variables"**
- Check `.env` file exists in project root
- Restart terminal/dev server

**"Database error: relation 'properties' does not exist"**
- You need to run the SQL migration first (Step 1 above)

**Import fails**
- Make sure SQL migration ran successfully first
- Check `.env` has correct credentials

---

## 🎉 Once Complete

After running the migration and importing data, you'll have:
- ✅ 3 database tables with indexes
- ✅ 20 sample properties
- ✅ Working API endpoints
- ✅ Ready to test locally

Then you can deploy to Vercel for production!
