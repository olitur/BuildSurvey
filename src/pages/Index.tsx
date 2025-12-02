"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProjectForm from "@/components/ProjectForm";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/types/project";
import { getProjects, addProject, updateProject, deleteProject } from "@/lib/storage";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SupabaseConnectionChecker from "@/components/SupabaseConnectionChecker"; // Import the new component

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    const fetchedProjects = await getProjects();
    setProjects(fetchedProjects);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = async (newProjectData: Omit<Project, "id" | "levels" | "created_at">) => {
    const addedProject = await addProject(newProjectData);
    if (addedProject) {
      fetchProjects(); // Re-fetch projects to update the list
      setIsFormOpen(false);
    }
  };

  const handleUpdateProject = async (updatedProjectData: Omit<Project, "levels" | "created_at">) => {
    const updated = await updateProject(updatedProjectData);
    if (updated) {
      fetchProjects(); // Re-fetch projects to update the list
      setEditingProject(undefined);
      setIsFormOpen(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      const success = await deleteProject(projectId);
      if (success) {
        fetchProjects(); // Re-fetch projects to update the list
      }
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-50">
          Projets d'Inspection de Bâtiments
        </h1>

        {/* Supabase Connection Checker */}
        <SupabaseConnectionChecker />

        <div className="flex justify-end mb-6 mt-8">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingProject(undefined); setIsFormOpen(true); }}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter un nouveau projet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Modifier le projet" : "Créer un nouveau projet"}</DialogTitle>
              </DialogHeader>
              <ProjectForm
                onSubmit={editingProject ? handleUpdateProject : handleAddProject}
                initialData={editingProject}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Chargement des projets...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Aucun projet pour le moment. Cliquez sur "Ajouter un nouveau projet" pour commencer !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditClick}
                onDelete={handleDeleteProject}
                onView={handleViewProject}
              />
            ))}
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;