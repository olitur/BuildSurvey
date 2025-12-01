"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjects, updateProject } from "@/lib/storage";
import { Project, Level, SpaceRoom } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Trash2, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

const LevelDetails = () => {
  const { projectId, levelId } = useParams<{ projectId: string; levelId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  useEffect(() => {
    const projects = getProjects();
    const foundProject = projects.find((p) => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      const foundLevel = foundProject.levels.find((l) => l.id === levelId);
      if (foundLevel) {
        setLevel(foundLevel);
      } else {
        toast.error("Niveau introuvable.");
        navigate(`/project/${projectId}`);
      }
    } else {
      toast.error("Projet introuvable.");
      navigate("/");
    }
  }, [projectId, levelId, navigate]);

  const handleAddSpace = () => {
    if (!project || !level || !newSpaceName.trim()) {
      toast.error("Le nom de l'espace ne peut pas être vide.");
      return;
    }

    const newSpace: SpaceRoom = {
      id: uuidv4(),
      name: newSpaceName.trim(),
      observations: {
        floor: [],
        wall: [],
        ceiling: [],
      },
    };

    const updatedLevels = project.levels.map((l) =>
      l.id === level.id ? { ...l, spaces: [...l.spaces, newSpace] } : l
    );

    const updatedProject = {
      ...project,
      levels: updatedLevels,
    };

    setProject(updatedProject);
    setLevel(updatedLevels.find(l => l.id === level.id) || null); // Update the local level state
    updateProject(updatedProject);
    setNewSpaceName("");
    setIsSpaceFormOpen(false);
    toast.success(`Espace "${newSpace.name}" ajouté.`);
  };

  const handleDeleteSpace = (spaceId: string) => {
    if (!project || !level) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet espace et toutes ses observations ?")) {
      const updatedLevels = project.levels.map((l) =>
        l.id === level.id
          ? { ...l, spaces: l.spaces.filter((space) => space.id !== spaceId) }
          : l
      );

      const updatedProject = {
        ...project,
        levels: updatedLevels,
      };

      setProject(updatedProject);
      setLevel(updatedLevels.find(l => l.id === level.id) || null); // Update the local level state
      updateProject(updatedProject);
      toast.success("Espace supprimé.");
    }
  };

  if (!project || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Chargement des détails du niveau...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        <Button variant="outline" onClick={() => navigate(`/project/${projectId}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour au projet
        </Button>

        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-50">
          Projet: {project.location} - Niveau: {level.name}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Gérer les espaces et les observations pour ce niveau.
        </p>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Espaces</h2>
          <Dialog open={isSpaceFormOpen} onOpenChange={setIsSpaceFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsSpaceFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter un espace
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel espace/pièce</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="spaceName" className="text-right">
                    Nom de l'espace
                  </Label>
                  <Input
                    id="spaceName"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder="ex: Salon, Cuisine, Chambre 1"
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsSpaceFormOpen(false)}>Annuler</Button>
                <Button onClick={handleAddSpace}>Ajouter l'espace</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {level.spaces.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Aucun espace ajouté pour le moment. Ajoutez le premier espace !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {level.spaces.map((space) => (
              <Card key={space.id} className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{space.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/project/${projectId}/level/${levelId}/space/${space.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/* <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button> */}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSpace(space.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Observations : Sol ({space.observations.floor.length}), Mur ({space.observations.wall.length}), Plafond ({space.observations.ceiling.length})
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

export default LevelDetails;