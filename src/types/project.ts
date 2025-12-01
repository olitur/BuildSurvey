"use client";

export interface Observation {
  id: string;
  text: string;
  photos: string[]; // Will store URLs or base64 for local, then URLs for Supabase
}

// Removed LocationInSpace type as it will be dynamic

export interface SpaceRoom {
  id: string;
  name: string; // e.g., "Living Room", "Kitchen"
  observations: Record<string, Observation[]>; // Changed to a record for dynamic keys
}

export interface Level {
  id: string;
  name: string; // e.g., "R-1", "R+0", "R+1"
  spaces: SpaceRoom[];
}

export interface Project {
  id: string;
  location: string; // Postal address
  buildingCharacteristics: string; // Text description
  levels: Level[];
}