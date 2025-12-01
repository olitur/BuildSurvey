"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjects, updateProject } from "@/lib/storage";
import { Project, Level, SpaceRoom, Observation, LocationInSpace } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Trash2, Edit, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

const SpaceDetails = () => {
  const { projectId, levelId, spaceId } = useParams<{ projectId: string; levelId: string; spaceId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [space, setSpace] = useState<SpaceRoom | null>(null);
  const [isObservationFormOpen, setIsObservationFormOpen] = useState(false);
  const [newObservationText, setNewObservationText] = useState("");
  const [newObservationLocation, setNewObservationLocation] = useState<LocationInSpace>("floor");
  const [newObservationPhotos, setNewObservationPhotos] = useState<string[]>([]);

  useEffect(() => {
    const projects = getProjects();
    const foundProject = projects.find((p) => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      const foundLevel = foundProject.levels.find((l) => l.id === levelId);
      if (foundLevel) {
        setLevel(foundLevel);
        const foundSpace = foundLevel.spaces.find((s) => s.id === spaceId);
        if (foundSpace) {
          setSpace(foundSpace);
        } else {
          toast.error("Espace introuvable.");
          navigate(`/project/${projectId}/level/${levelId}`);
        }
      } else {
        toast.error("Niveau introuvable.");
        navigate(`/project/${projectId}`);
      }
    } else {
      toast.error("Projet introuvable.");
      navigate("/");
    }
  }, [projectId, levelId, spaceId, navigate]);

  const handleAddObservation = () => {
    if (!project || !level || !space || !newObservationText.trim()) {
      toast.error("Le texte de l'observation ne peut pas être vide.");
      return;
    }

    const newObservation: Observation = {
      id: uuidv4(),
      text: newObservationText.trim(),
      photos: newObservationPhotos,
    };

    const updatedSpace: SpaceRoom = {
      ...space,
      observations: {
        ...space.observations,
        [newObservationLocation]: [...space.observations[newObservationLocation], newObservation],
      },
    };

    const updatedLevels = project.levels.map((l) =>
      l.id === level.id
        ? { ...l, spaces: l.spaces.map((s) => (s.id === space.id ? updatedSpace : s)) }
        : l
    );

    const updatedProject = {
      ...project,
      levels: updatedLevels,
    };

    setProject(updatedProject);
    setLevel(updatedLevels.find((l) => l.id === level.id) || null);
    setSpace(updatedSpace);
    updateProject(updatedProject);

    setNewObservationText("");
    setNewObservationLocation("floor");
    setNewObservationPhotos([]);
    setIsObservationFormOpen(false);
    toast.success("Observation ajoutée.");
  };

  const handleDeleteObservation = (location: LocationInSpace, observationId: string) => {
    if (!project || !level || !space) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette observation ?")) {
      const updatedSpace: SpaceRoom = {
        ...space,
        observations: {
          ...space.observations,
          [location]: space.observations[location].filter((obs) => obs.id !== observationId),
        },
      };

      const updatedLevels = project.levels.map((l) =>
        l.id === level.id
          ? { ...l, spaces: l.spaces.map((s) => (s.id === space.id ? updatedSpace : s)) }
          : l
      );

      const updatedProject = {
        ...project,
        levels: updatedLevels,
      };

      setProject(updatedProject);
      setLevel(updatedLevels.find((l) => l.id === level.id) || null);
      setSpace(updatedSpace);
      updateProject(updatedProject);
      toast.success("Observation supprimée.");
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewObservationPhotos((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (!project || !level || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Chargement des détails de l'espace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        <Button variant="outline" onClick={() => navigate(`/project/${projectId}/level/${levelId}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour au niveau
        </Button>

        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-50">
          Projet: {project.location} - Niveau: {level.name} - Espace: {space.name}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Gérer les observations pour cet espace.
        </p>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Observations</h2>
          <Dialog open={isObservationFormOpen} onOpenChange={setIsObservationFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsObservationFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter une observation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle observation</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observationText" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="observationText"
                    value={newObservationText}
                    onChange={(e) => setNewObservationText(e.target.value)}
                    placeholder="Décrivez l'observation..."
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observationLocation" className="text-right">
                    Localisation
                  </Label>
                  <Select
                    value={newObservationLocation}
                    onValueChange={(value: LocationInSpace) => setNewObservationLocation(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une localisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="floor">Sol</SelectItem>
                      <SelectItem value="wall">Mur</SelectItem>
                      <SelectItem value="ceiling">Plafond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observationPhotos" className="text-right">
                    Photos
                  </Label>
                  <Input
                    id="observationPhotos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="col-span-3"
                  />
                </div>
                <div className="col-span-4 flex flex-wrap gap-2 justify-end">
                  {newObservationPhotos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Observation ${index + 1}`} className="w-20 h-20 object-cover rounded-md" />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsObservationFormOpen(false)}>Annuler</Button>
                <Button onClick={handleAddObservation}>Ajouter l'observation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {Object.keys(space.observations).every(key => space.observations[key as LocationInSpace].length === 0) ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Aucune observation ajoutée pour cet espace. Ajoutez la première observation !</p>
        ) : (
          <div className="space-y-6">
            {["floor", "wall", "ceiling"].map((locationKey) => {
              const location = locationKey as LocationInSpace;
              const observations = space.observations[location];
              return (
                <div key={location} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <h3 className="text-xl font-semibold mb-4 capitalize text-gray-800 dark:text-gray-100">
                    {location === "floor" ? "Observations du Sol" : location === "wall" ? "Observations du Mur" : "Observations du Plafond"}
                  </h3>
                  {observations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune observation pour le {location === "floor" ? "sol" : location === "wall" ? "mur" : "plafond"}.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {observations.map((observation) => (
                        <Card key={observation.id} className="bg-gray-50 dark:bg-gray-700 shadow-sm">
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">{observation.text}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {observation.photos.map((photo, index) => (
                                <img key={index} src={photo} alt={`Observation photo ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
                              ))}
                            </div>
                            <div className="flex justify-end space-x-2">
                              {/* <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button> */}
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteObservation(location, observation.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default SpaceDetails;