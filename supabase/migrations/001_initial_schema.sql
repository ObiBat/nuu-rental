-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;
CREATE EXTENSION IF NOT EXISTS "vector";

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(255) UNIQUE,
  source VARCHAR(50) DEFAULT 'manual',
  
  -- Address
  street_number VARCHAR(50),
  street_name VARCHAR(255),
  suburb VARCHAR(255) NOT NULL,
  state VARCHAR(10) NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property Details
  property_type VARCHAR(50) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  car_spaces INTEGER,
  
  -- Pricing
  rent_weekly INTEGER NOT NULL,
  rent_monthly INTEGER,
  bond INTEGER,
  is_negotiable BOOLEAN DEFAULT false,
  
  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  utilities JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  building_age VARCHAR(50),
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Availability
  available_from DATE,
  lease_term VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  
  -- Vector embedding for similarity search (Phase 2)
  embedding VECTOR(1536)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_suburb ON properties(suburb);
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON properties(postcode);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(rent_weekly);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Index for location-based queries (using lat/lng directly)
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties(latitude, longitude);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_properties_features ON properties USING GIN (features);
CREATE INDEX IF NOT EXISTS idx_properties_amenities ON properties USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_properties_utilities ON properties USING GIN (utilities);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Search Criteria
  property_types JSONB DEFAULT '[]'::jsonb,
  price_min INTEGER,
  price_max INTEGER,
  location_center JSONB,
  location_radius INTEGER DEFAULT 10,
  features JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  utilities JSONB DEFAULT '[]'::jsonb,
  modernity VARCHAR(50),
  budget_smart JSONB DEFAULT '{}'::jsonb,
  
  -- Weights for scoring
  weights JSONB DEFAULT '{"price": 0.25, "location": 0.30, "features": 0.20, "amenities": 0.15, "modernity": 0.10}'::jsonb,
  
  -- Embedding (Phase 2)
  preference_embedding VECTOR(1536),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Results Cache
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_preference_id UUID REFERENCES user_preferences(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  match_score DECIMAL(5, 2) NOT NULL,
  score_breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_results_score ON match_results(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_results_preference ON match_results(user_preference_id);
CREATE INDEX IF NOT EXISTS idx_match_results_property ON match_results(property_id);

-- Function: Calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION earth_distance_km(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT earth_distance(
    ll_to_earth(lat1, lon1),
    ll_to_earth(lat2, lon2)
  ) / 1000.0;
$$;

-- Function: Find properties within radius
CREATE OR REPLACE FUNCTION properties_within_radius(
  center_lat DECIMAL,
  center_lng DECIMAL,
  radius_km INTEGER
)
RETURNS SETOF properties
LANGUAGE SQL
STABLE
AS $$
  SELECT *
  FROM properties
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND earth_distance_km(latitude, longitude, center_lat, center_lng) <= radius_km;
$$;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
