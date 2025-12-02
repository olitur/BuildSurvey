"use client";

import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env file
// For local development, create a .env file in the root of your project:
// VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
// VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Trim the URL and key before validation and use
const supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.trim() : undefined;
const supabaseAnonKey = rawSupabaseAnonKey ? rawSupabaseAnonKey.trim() : undefined;

// --- Diagnostic logs ---
console.log("Raw Supabase URL from .env:", rawSupabaseUrl);
console.log("Trimmed Supabase URL:", supabaseUrl, "(Length:", supabaseUrl?.length, ")");
console.log("Raw Supabase Anon Key from .env:", rawSupabaseAnonKey ? "******" : "Not set");
console.log("Trimmed Supabase Anon Key:", supabaseAnonKey ? "******" : "Not set", "(Length:", supabaseAnonKey?.length, ")");
// --- End diagnostic logs ---

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set or is empty after trimming. Please check your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set or is empty after trimming. Please check your .env file.");
}

// Add more detailed logging just before client creation
console.log("Attempting to create Supabase client with (final values):");
console.log("  URL:", supabaseUrl, " (Length:", supabaseUrl.length, ")");
console.log("  Anon Key:", supabaseAnonKey ? "******" : "Not set", " (Length:", supabaseAnonKey.length, ")");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);