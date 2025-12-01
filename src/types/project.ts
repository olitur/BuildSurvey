"use client";

export interface Observation {
  id: string;
  text: string;
  photos: string[]; // Will store URLs or base64 for local, then URLs for Supabase
}

export type LocationInSpace = "floor" | "wall" | "ceiling";

export interface SpaceRoom {
  id: string;
  name: string; // e.g., "Living Room", "Kitchen"
  observations: {
    floor: Observation[];
    wall: Observation[];
    ceiling: Observation[];
  };
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