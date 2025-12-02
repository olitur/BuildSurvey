// Removed 'use client';

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProjects, getLevelsForProject, getSpacesForLevel, addSpace, deleteSpace } from "@/lib/storage"; // Import new storage functions
import { Project, Level, SpaceRoom } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

const LevelDetails = () => {
  const { projectId, levelId } = useParams<{ projectId: string; levelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [level, setLevel] = useState<Level | null>(null); // State for the current level
  const [spaces, setSpaces] = useState<SpaceRoom[]>([]); // State for spaces
  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  const fetchLevelAndSpaces = async () => {
    if (!projectId || !levelId) return;

    const projects = await getProjects();
    const foundProject = projects.find((p) => p.id === projectId);
    if (!foundProject) {
      toast.error("Projet introuvable.");
      navigate("/");
      return;
    }
    setProject(foundProject);

    const fetchedLevels = await getLevelsForProject(projectId);
    const foundLevel = fetchedLevels.find((l) => l.id === levelId);
    if (!foundLevel) {
      toast.error("Niveau introuvable.");
      navigate(`/project/${projectId}`);
      return;
    }
    setLevel(foundLevel);

    const fetchedSpaces = await getSpacesForLevel(foundLevel.id);
    setSpaces(fetchedSpaces);
  };

  useEffect(() => {
    fetchLevelAndSpaces();
  }, [projectId, levelId, navigate, location.pathname]);

  const handleAddSpace = async () => {
    if (!level || !newSpaceName.trim()) {
      toast.error("Le nom de l'espace ne peut pas être vide.");
      return;
    }

    const newSpaceData = {
      name: newSpaceName.trim(),
      level_id: level.id,
    };

    const addedSpace = await addSpace(newSpaceData);
    if (addedSpace) {
      setSpaces((prevSpaces) => [...prevSpaces, addedSpace]);
      setNewSpaceName("");
      setIsSpaceFormOpen(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    if (!level) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet espace et toutes ses observations ?")) {
      const success = await deleteSpace(spaceId);
      if (success) {
        setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== spaceId));
      }
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

        {spaces.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Aucun espace ajouté pour le moment. Ajoutez le premier espace !</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spaces.map((space) => (
              <Card key={space.id} className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{space.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/project/${projectId}/level/${levelId}/space/${space.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSpace(space.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Total observations : 0 (à charger)
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