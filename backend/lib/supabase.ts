import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Service role client for backend operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Database types
export interface Property {
    id: string;
    external_id?: string;
    source: string;
    street_number?: string;
    street_name?: string;
    suburb: string;
    state: string;
    postcode: string;
    latitude?: number;
    longitude?: number;
    property_type: string;
    bedrooms?: number;
    bathrooms?: number;
    car_spaces?: number;
    rent_weekly: number;
    rent_monthly?: number;
    bond?: number;
    is_negotiable: boolean;
    features: string[];
    amenities: string[];
    utilities: string[];
    building_age?: string;
    description?: string;
    images: string[];
    available_from?: string;
    lease_term?: string;
    created_at: string;
    updated_at: string;
    last_synced_at?: string;
    embedding?: number[];
    // Additional fields that may exist
    pet_friendly?: boolean;
    furnished?: boolean;
}

export interface UserPreference {
    id: string;
    property_types: string[];
    price_min?: number;
    price_max?: number;
    location_center?: {
        lat: number;
        lng: number;
        suburb: string;
    };
    location_radius: number;
    features: string[];
    amenities: string[];
    utilities: string[];
    modernity?: string;
    budget_smart: {
        includeNegotiable?: boolean;
        showBelowBudget?: boolean;
        includeUtilitiesInBudget?: boolean;
    };
    weights: {
        price: number;
        location: number;
        features: number;
        amenities: number;
        modernity: number;
    };
    created_at: string;
    updated_at: string;
}

export interface MatchResult {
    id: string;
    user_preference_id: string;
    property_id: string;
    match_score: number;
    score_breakdown: {
        price: number;
        location: number;
        features: number;
        amenities: number;
        modernity: number;
    };
    created_at: string;
}
