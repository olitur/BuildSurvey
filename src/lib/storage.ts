"use client";

import { Project } from "@/types/project";
import { toast } from "sonner"; // Import toast for notifications

const LOCAL_STORAGE_KEY = "building-inspection-projects";

export const getProjects = (): Project[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedProjects ? JSON.parse(storedProjects) : [];
  } catch (error) {
    console.error("Failed to load projects from local storage:", error);
    toast.error("Erreur lors du chargement des projets depuis le stockage local."); // Added toast
    return [];
  }
};

export const saveProjects = (projects: Project[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save projects to local storage:", error);
    // Check for QuotaExceededError specifically
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      toast.error("Erreur: Le stockage local est plein. Impossible de sauvegarder les données. Veuillez supprimer des projets ou passer à un stockage cloud.");
    } else {
      toast.error("Erreur: Impossible de sauvegarder les données. Veuillez réessayer.");
    }
  }
};

export const addProject = (project: Project): Project[] => {
  const projects = getProjects();
  const updatedProjects = [...projects, project];
  saveProjects(updatedProjects);
  return updatedProjects;
};

export const updateProject = (updatedProject: Project): Project[] => {
  const projects = getProjects();
  const updatedProjects = projects.map((p) =>
    p.id === updatedProject.id ? updatedProject : p,
  );
  saveProjects(updatedProjects);
  return updatedProjects;
};

export const deleteProject = (projectId: string): Project[] => {
  const projects = getProjects();
  const updatedProjects = projects.filter((p) => p.id !== projectId);
  saveProjects(updatedProjects);
  return updatedProjects;
};