// Removed 'use client';

import { supabase } from "@/lib/supabaseClient";
import { Project, Level, SpaceRoom, Observation } from "@/types/project";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs for images

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
  return data.map(p => ({ ...p, levels: [], buildingCharacteristics: p.buildingCharacteristics || "" }));
};

export const addProject = async (project: Omit<Project, "id" | "levels" | "created_at">): Promise<Project | null> => {
  const { data, error } = await supabase.from("projects").insert({
    location: project.location,
    buildingCharacteristics: project.buildingCharacteristics,
  }).select().single();
  if (error) {
    console.error("Error adding project:", error);
    toast.error("Erreur lors de la création du projet.");
    return null;
  }
  toast.success("Projet créé avec succès !");
  return { ...data, levels: [] };
};

export const updateProject = async (updatedProject: Omit<Project, "levels" | "created_at">): Promise<Project | null> => {
  const { id, ...fieldsToUpdate } = updatedProject;
  const { data, error } = await supabase.from("projects").update({
    location: fieldsToUpdate.location,
    buildingCharacteristics: fieldsToUpdate.buildingCharacteristics,
  }).eq("id", id).select().single();
  if (error) {
    console.error("Error updating project:", error);
    toast.error("Erreur lors de la mise à jour du projet.");
    return null;
  }
  toast.success("Projet mis à jour avec succès !");
  return { ...data, levels: [] };
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

export const addLevel = async (level: Omit<Level, "id" | "spaces" | "created_at">): Promise<Level | null> => {
  const { data, error } = await supabase.from("levels").insert(level).select().single();
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

export const addSpace = async (space: Omit<SpaceRoom, "id" | "observations" | "created_at">): Promise<SpaceRoom | null> => {
  const { data, error } = await supabase.from("spaces").insert(space).select().single();
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

export const addObservation = async (observation: Omit<Observation, "id" | "created_at">): Promise<Observation | null> => {
  const { data, error } = await supabase.from("observations").insert(observation).select().single();
  if (error) {
    console.error("Error adding observation:", error);
    toast.error("Erreur lors de la création de l'observation.");
    return null;
  }
  toast.success("Observation ajoutée.");
  return data;
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

// --- Image Upload to Supabase Storage ---

export const uploadImageToSupabase = async (file: File, projectId: string, levelId: string, spaceId: string): Promise<string | null> => {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${projectId}/${levelId}/${spaceId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("project-images") // Make sure this bucket exists in Supabase Storage
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    toast.error("Erreur lors du chargement de l'image.");
    return null;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("project-images")
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    console.error("Error getting public URL for image.");
    toast.error("Erreur lors de l'obtention de l'URL publique de l'image.");
    return null;
  }

  return publicUrlData.publicUrl;
};

export const deleteImageFromSupabase = async (imageUrl: string): Promise<boolean> => {
  // Extract the path from the public URL
  const urlParts = imageUrl.split('/public/project-images/');
  if (urlParts.length < 2) {
    console.error("Invalid image URL for deletion:", imageUrl);
    return false;
  }
  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from("project-images")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image from storage:", error);
    toast.error("Erreur lors de la suppression de l'image du stockage.");
    return false;
  }
  return true;
};