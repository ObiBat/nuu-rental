import { createClient } from '@supabase/supabase-js';

// This client is for the frontend (using VITE_ env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase VITE_ environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

