// Removed 'use client';

export interface Observation {
  id: string;
  text: string;
  location_in_space: string; // New field to store the dynamic location (floor, wall, custom, etc.)
  photos: string[]; // Will store URLs from Supabase Storage
  space_id: string; // Foreign key for Supabase
  user_id: string; // Foreign key for Supabase, links to auth.users
  created_at?: string; // Timestamp from Supabase
}

export interface SpaceRoom {
  id: string;
  name: string;
  level_id: string; // Foreign key for Supabase
  user_id: string; // Foreign key for Supabase, links to auth.users
  observations: { [key: string]: Observation[] }; // Observations will be fetched separately or joined
  created_at?: string; // Timestamp from Supabase
}

export interface Level {
  id: string;
  name: string;
  project_id: string; // Foreign key for Supabase
  user_id: string; // Foreign key for Supabase, links to auth.users
  spaces: SpaceRoom[]; // Spaces will be fetched separately or joined
  created_at?: string; // Timestamp from Supabase
}

export interface Project {
  id: string;
  location: string; // Postal address
  buildingCharacteristics: string; // Text description - Changed from building_characteristics
  user_id: string; // Foreign key for Supabase, links to auth.users
  levels: Level[]; // Levels will be fetched separately or joined
  created_at?: string; // Timestamp from Supabase
}