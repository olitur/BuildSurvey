"use client";

import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env file
// For local development, create a .env file in the root of your project:
// VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
// VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not set. Please check your environment variables.");
  // You might want to throw an error or handle this more gracefully in a production app
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);