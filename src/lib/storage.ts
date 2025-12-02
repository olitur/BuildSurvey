// Removed 'use client';

import { supabase } from "@/lib/supabaseClient";
import { Project, Level, SpaceRoom, Observation } from "@/types/project";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid"; // Used for generating unique filenames

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return user?.id || null;
};

// --- Image Storage Management ---

const uploadImageToSupabaseStorage = async (base64String: string, userId: string): Promise<string | null> => {
  try {
    // Extract file type from base64 string (e.g., data:image/png;base64,...)
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error("Invalid base64 string format.");
      toast.error("Format d'image invalide.");
      return null;
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileExtension = contentType.split('/')[1];
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`; // Store under user's folder

    const { data, error } = await supabase.storage
      .from('observation-photos')
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image to Supabase Storage:", error);
      toast.error("Erreur lors du téléchargement de l'image.");
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('observation-photos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;

  } catch (e: any) {
    console.error("Unhandled exception during image upload:", e);
    toast.error(`Erreur inattendue lors du téléchargement de l'image: ${e.message || e}`);
    return null;
  }
};

const deleteImageFromSupabaseStorage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the public URL
    const urlParts = imageUrl.split('/public/observation-photos/');
    if (urlParts.length < 2) {
      console.error("Invalid image URL format for deletion:", imageUrl);
      return false;
    }
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('observation-photos')
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image from Supabase Storage:", error);
      toast.error("Erreur lors de la suppression de l'image.");
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("Unhandled exception during image deletion:", e);
    toast.error(`Erreur inattendue lors de la suppression de l'image: ${e.message || e}`);
    return false;
  }
};

// --- Project Management ---

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching projects:", error);
    toast.error("Erreur lors du chargement des projets.");
    return [];
  }
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
    building_characteristics: project.buildingCharacteristics,
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
    building_characteristics: fieldsToUpdate.buildingCharacteristics,
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
  return data.map(s => ({ ...s, observations: {} }));
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
  return { ...data, observations: {} };
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
  return { ...data, observations: {} };
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
    const uploadedPhotoUrls: string[] = [];
    for (const base64Photo of observation.photos) {
      const url = await uploadImageToSupabaseStorage(base64Photo, userId);
      if (url) {
        uploadedPhotoUrls.push(url);
      } else {
        // If any photo upload fails, we might want to stop or log a warning
        console.warn("Failed to upload one or more photos for observation.");
        // Decide if you want to proceed with the observation without these photos or fail entirely
      }
    }

    const { data, error } = await supabase.from("observations").insert({
      text: observation.text,
      location_in_space: observation.location_in_space,
      photos: uploadedPhotoUrls, // Store URLs instead of base64
      space_id: observation.space_id,
      user_id: userId,
    }).select().single();
    if (error) {
      console.error("Error adding observation:", error);
      toast.error("Erreur lors de la création de l'observation.");
      // If observation insertion fails, try to delete uploaded photos
      for (const url of uploadedPhotoUrls) {
        await deleteImageFromSupabaseStorage(url);
      }
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
  try {
    // First, fetch the observation to get photo URLs
    const { data: observationData, error: fetchError } = await supabase
      .from("observations")
      .select("photos")
      .eq("id", observationId)
      .single();

    if (fetchError) {
      console.error("Error fetching observation for photo deletion:", fetchError);
      toast.error("Erreur lors de la récupération de l'observation pour la suppression des photos.");
      return false;
    }

    // Delete photos from storage
    if (observationData && observationData.photos && observationData.photos.length > 0) {
      for (const photoUrl of observationData.photos) {
        await deleteImageFromSupabaseStorage(photoUrl);
      }
    }

    // Then, delete the observation record
    const { error: deleteError } = await supabase.from("observations").delete().eq("id", observationId);
    if (deleteError) {
      console.error("Error deleting observation record:", deleteError);
      toast.error("Erreur lors de la suppression de l'observation.");
      return false;
    }
    toast.success("Observation supprimée.");
    return true;
  } catch (e: any) {
    console.error("Unhandled exception during observation deletion:", e);
    toast.error(`Erreur inattendue lors de la suppression de l'observation: ${e.message || e}`);
    return false;
  }
};