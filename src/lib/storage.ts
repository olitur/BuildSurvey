// Removed 'use client';

import { supabase } from "@/lib/supabaseClient";
import { Project, Level, SpaceRoom, Observation } from "@/types/project";
import { toast } from "sonner";
// import { v4 as uuidv4 } from "uuid"; // Not needed for image upload anymore

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return user?.id || null;
};

// --- Project Management ---

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching projects:", error);
    toast.error("Erreur lors du chargement des projets.");
    return [];
  }
  // For now, we'll return projects without nested levels/spaces/observations
  // These will be fetched on demand in their respective detail pages.
  return data.map(p => ({ ...p, levels: [], buildingCharacteristics: p.building_characteristics || "" }));
};

export const addProject = async (project: Omit<Project, "id" | "levels" | "created_at" | "user_id">): Promise<Project | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    toast.error("Vous devez être connecté pour créer un projet.");
    return null;
  }
  const { data, error } = await supabase.from("projects").insert({
    location: project.location,
    building_characteristics: project.buildingCharacteristics, // Ensure column name matches DB
    user_id: userId,
  }).select().single();
  if (error) {
    console.error("Error adding project:", error);
    toast.error("Erreur lors de la création du projet.");
    return null;
  }
  toast.success("Projet créé avec succès !");
  return { ...data, levels: [], buildingCharacteristics: data.building_characteristics || "" };
};

export const updateProject = async (updatedProject: Omit<Project, "levels" | "created_at">): Promise<Project | null> => {
  const { id, ...fieldsToUpdate } = updatedProject;
  const { data, error } = await supabase.from("projects").update({
    location: fieldsToUpdate.location,
    building_characteristics: fieldsToUpdate.buildingCharacteristics, // Ensure column name matches DB
  }).eq("id", id).select().single();
  if (error) {
    console.error("Error updating project:", error);
    toast.error("Erreur lors de la mise à jour du projet.");
    return null;
  }
  toast.success("Projet mis à jour avec succès !");
  return { ...data, levels: [], buildingCharacteristics: data.building_characteristics || "" };
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) {
    console.error("Error deleting project:", error);
    toast.error("Erreur lors de la suppression du projet.");
    return false;
  }
  toast.success("Projet supprimé.");
  return true;
};

// --- Level Management ---

export const getLevelsForProject = async (projectId: string): Promise<Level[]> => {
  const { data, error } = await supabase.from("levels").select("*").eq("project_id", projectId).order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching levels:", error);
    toast.error("Erreur lors du chargement des niveaux.");
    return [];
  }
  return data.map(l => ({ ...l, spaces: [] }));
};

export const addLevel = async (level: Omit<Level, "id" | "spaces" | "created_at" | "user_id">): Promise<Level | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    toast.error("Vous devez être connecté pour créer un niveau.");
    return null;
  }
  const { data, error } = await supabase.from("levels").insert({
    name: level.name,
    project_id: level.project_id,
    user_id: userId,
  }).select().single();
  if (error) {
    console.error("Error adding level:", error);
    toast.error("Erreur lors de la création du niveau.");
    return null;
  }
  toast.success(`Niveau "${data.name}" ajouté.`);
  return { ...data, spaces: [] };
};

export const updateLevel = async (updatedLevel: Omit<Level, "spaces" | "created_at">): Promise<Level | null> => {
  const { id, ...fieldsToUpdate } = updatedLevel;
  const { data, error } = await supabase.from("levels").update(fieldsToUpdate).eq("id", id).select().single();
  if (error) {
    console.error("Error updating level:", error);
    toast.error("Erreur lors de la mise à jour du niveau.");
    return null;
  }
  toast.success("Niveau mis à jour avec succès !");
  return { ...data, spaces: [] };
};

export const deleteLevel = async (levelId: string): Promise<boolean> => {
  const { error } = await supabase.from("levels").delete().eq("id", levelId);
  if (error) {
    console.error("Error deleting level:", error);
    toast.error("Erreur lors de la suppression du niveau.");
    return false;
  }
  toast.success("Niveau supprimé.");
  return true;
};

// --- Space Management ---

export const getSpacesForLevel = async (levelId: string): Promise<SpaceRoom[]> => {
  const { data, error } = await supabase.from("spaces").select("*").eq("level_id", levelId).order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching spaces:", error);
    toast.error("Erreur lors du chargement des espaces.");
    return [];
  }
  return data.map(s => ({ ...s, observations: {} })); // Initialize observations as an empty object
};

export const addSpace = async (space: Omit<SpaceRoom, "id" | "observations" | "created_at" | "user_id">): Promise<SpaceRoom | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    toast.error("Vous devez être connecté pour créer un espace.");
    return null;
  }
  const { data, error } = await supabase.from("spaces").insert({
    name: space.name,
    level_id: space.level_id,
    user_id: userId,
  }).select().single();
  if (error) {
    console.error("Error adding space:", error);
    toast.error("Erreur lors de la création de l'espace.");
    return null;
  }
  toast.success(`Espace "${data.name}" ajouté.`);
  return { ...data, observations: {} }; // Return with empty observations object
};

export const updateSpace = async (updatedSpace: Omit<SpaceRoom, "observations" | "created_at">): Promise<SpaceRoom | null> => {
  const { id, ...fieldsToUpdate } = updatedSpace;
  const { data, error } = await supabase.from("spaces").update(fieldsToUpdate).eq("id", id).select().single();
  if (error) {
    console.error("Error updating space:", error);
    toast.error("Erreur lors de la mise à jour de l'espace.");
    return null;
  }
  toast.success("Espace mis à jour avec succès !");
  return { ...data, observations: {} }; // Return with empty observations object
};

export const deleteSpace = async (spaceId: string): Promise<boolean> => {
  const { error } = await supabase.from("spaces").delete().eq("id", spaceId);
  if (error) {
    console.error("Error deleting space:", error);
    toast.error("Erreur lors de la suppression de l'espace.");
    return false;
  }
  toast.success("Espace supprimé.");
  return true;
};

// --- Observation Management ---

export const getObservationsForSpace = async (spaceId: string): Promise<Observation[]> => {
  const { data, error } = await supabase.from("observations").select("*").eq("space_id", spaceId).order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching observations:", error);
    toast.error("Erreur lors du chargement des observations.");
    return [];
  }
  return data;
};

export const addObservation = async (observation: Omit<Observation, "id" | "created_at" | "user_id">): Promise<Observation | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    toast.error("Vous devez être connecté pour créer une observation.");
    return null;
  }
  try {
    const { data, error } = await supabase.from("observations").insert({
      text: observation.text,
      location_in_space: observation.location_in_space,
      // photos: observation.photos, // Temporarily commented out for debugging
      space_id: observation.space_id,
      user_id: userId,
    }).select().single();
    if (error) {
      console.error("Error adding observation:", error);
      toast.error("Erreur lors de la création de l'observation.");
      return null;
    }
    toast.success("Observation ajoutée.");
    return data;
  } catch (e: any) {
    console.error("Unhandled exception adding observation:", e);
    toast.error(`Erreur inattendue lors de l'ajout de l'observation: ${e.message || e}`);
    return null;
  }
};

export const updateObservation = async (updatedObservation: Omit<Observation, "created_at">): Promise<Observation | null> => {
  const { id, ...fieldsToUpdate } = updatedObservation;
  const { data, error } = await supabase.from("observations").update(fieldsToUpdate).eq("id", id).select().single();
  if (error) {
    console.error("Error updating observation:", error);
    toast.error("Erreur lors de la mise à jour de l'observation.");
    return null;
  }
  toast.success("Observation mise à jour avec succès !");
  return data;
};

export const deleteObservation = async (observationId: string): Promise<boolean> => {
  const { error } = await supabase.from("observations").delete().eq("id", observationId);
  if (error) {
    console.error("Error deleting observation:", error);
    toast.error("Erreur lors de la suppression de l'observation.");
    return false;
  }
  toast.success("Observation supprimée.");
  return true;
};