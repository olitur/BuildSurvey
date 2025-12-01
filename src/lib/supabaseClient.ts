"use client";

import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env file
// For local development, create a .env file in the root of your project:
// VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
// VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Diagnostic logs ---
console.log("Supabase URL from .env:", supabaseUrl);
console.log("Supabase Anon Key from .env:", supabaseAnonKey ? "******" : "Not set"); // Mask key for security
// --- End diagnostic logs ---

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set. Please check your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);