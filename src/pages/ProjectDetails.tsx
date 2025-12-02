// Removed 'use client';

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProjects, updateProject, getLevelsForProject, addLevel, deleteLevel, getProjectFullData } from "@/lib/storage"; // Import new storage functions
import { Project, Level, SpaceRoom, Observation } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Trash2, Edit, Eye, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [levels, setLevels] = useState<Level[]>([]); // State for levels
  const [isLevelFormOpen, setIsLevelFormOpen] = useState(false);
  const [newLevelName, setNewLevelName] = useState("");

  const fetchProjectAndLevels = async () => {
    if (!projectId) return;
    const projects = await getProjects();
    const foundProject = projects.find((p) => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      const fetchedLevels = await getLevelsForProject(projectId);
      setLevels(fetchedLevels);
    } else {
      toast.error("Projet introuvable.");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchProjectAndLevels();
  }, [projectId, navigate, location.pathname]);

  const handleAddLevel = async () => {
    if (!project || !newLevelName.trim()) {
      toast.error("Le nom du niveau ne peut pas être vide.");
      return;
    }

    const newLevelData = {
      name: newLevelName.trim(),
      project_id: project.id,
    };

    const addedLevel = await addLevel(newLevelData);
    if (addedLevel) {
      setLevels((prevLevels) => [...prevLevels, addedLevel]);
      setNewLevelName("");
      setIsLevelFormOpen(false);
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (!project) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce niveau et tout son contenu ?")) {
      const success = await deleteLevel(levelId);
      if (success) {
        setLevels((prevLevels) => prevLevels.filter((level) => level.id !== levelId));
      }
    }
  };

  const handleDownloadProjectData = async () => {
    if (!projectId) {
      toast.error("ID du projet manquant pour le téléchargement.");
      return;
    }

    toast.info("Préparation des données du projet pour le téléchargement...");
    const projectToDownload = await getProjectFullData(projectId); // Use the new function

    if (!projectToDownload) {
      toast.error("Aucune donnée de projet à télécharger ou projet introuvable.");
      return;
    }

    try {
      const projectData = JSON.stringify(projectToDownload, null, 2); // Pretty print JSON
      const blob = new Blob([projectData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projet_${projectToDownload.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Données du projet téléchargées avec succès !");
    } catch (error) {
      console.error("Erreur lors du téléchargement des données du projet:", error);
      toast.error("Échec du téléchargement des données du projet.");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Chargement du projet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux projets
          </Button>
          <Button onClick={handleDownloadProjectData}>
            <Download className="h-4 w-4 mr-2" /> Télécharger les données du projet
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-50">
          Projet: {project.location}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {project.buildingCharacteristics || "Aucune caractéristique fournie."}
        </p>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Niveaux</h2>
          <Dialog open={isLevelFormOpen} onOpenChange={setIsLevelFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsLevelFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter un niveau
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau niveau</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="levelName" className="text-right">
                    Nom du niveau
                  </Label>
                  <Input
                    id="levelName"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                    placeholder="ex: R+0, R-1, Niveau 1"
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsLevelFormOpen(false)}>Annuler</Button>
                <Button onClick={handleAddLevel}>Ajouter le niveau</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {levels.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Aucun niveau ajouté pour le moment. Ajoutez le premier niveau !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levels.map((level) => (
              <Card key={level.id} className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{level.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/project/${projectId}/level/${level.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/* <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button> */}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLevel(level.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {/* This count will be inaccurate until spaces are fetched here or passed down */}
                    0 espaces (à charger)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ProjectDetails;