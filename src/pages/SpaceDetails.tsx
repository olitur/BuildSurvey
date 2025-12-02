// Removed 'use client';

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getProjects,
  getLevelsForProject,
  getSpacesForLevel,
  getObservationsForSpace,
  addObservation,
  deleteObservation,
} from "@/lib/storage";
import { Project, Level, SpaceRoom, Observation } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowLeft, Trash2, Loader2 } from "lucide-react"; // Import Loader2 for loading spinner
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MadeWithDyad } from "@/components/made-with-dyad";

const SpaceDetails = () => {
  const { projectId, levelId, spaceId } = useParams<{ projectId: string; levelId: string; spaceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [space, setSpace] = useState<SpaceRoom | null>(null);
  const [observationsByLocation, setObservationsByLocation] = useState<{ [key: string]: Observation[] }>({});
  const [isObservationFormOpen, setIsObservationFormOpen] = useState(false);
  const [newObservationText, setNewObservationText] = useState("");
  const [newObservationLocation, setNewObservationLocation] = useState<string>("floor");
  const [showCustomLocationInput, setShowCustomLocationInput] = useState(false);
  const [customLocationName, setCustomLocationName] = useState("");
  const [newObservationPhotoBase64s, setNewObservationPhotoBase64s] = useState<string[]>([]);
  const [isAddingObservation, setIsAddingObservation] = useState(false); // New loading state

  const fetchSpaceAndObservations = async () => {
    if (!projectId || !levelId || !spaceId) return;

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
    const foundSpace = fetchedSpaces.find((s) => s.id === spaceId);
    if (!foundSpace) {
      toast.error("Espace introuvable.");
      navigate(`/project/${projectId}/level/${levelId}`);
      return;
    }
    setSpace(foundSpace);

    const fetchedObservations = await getObservationsForSpace(spaceId);
    const groupedObservations: { [key: string]: Observation[] } = {};
    fetchedObservations.forEach(obs => {
      if (!groupedObservations[obs.location_in_space]) {
        groupedObservations[obs.location_in_space] = [];
      }
      groupedObservations[obs.location_in_space].push(obs);
    });
    setObservationsByLocation(groupedObservations);
  };

  useEffect(() => {
    fetchSpaceAndObservations();
  }, [projectId, levelId, spaceId, navigate, location.pathname]);

  const handleAddObservation = async () => {
    console.log("handleAddObservation called");
    setIsAddingObservation(true); // Set loading state

    if (!project || !level || !space) {
      console.log("Validation failed: project, level, or space is null");
      toast.error("Erreur interne: Projet, niveau ou espace non chargé.");
      setIsAddingObservation(false); // Reset loading state
      return;
    }

    if (!newObservationText.trim()) {
      console.log("Validation failed: newObservationText is empty");
      toast.error("Le texte de l'observation ne peut pas être vide.");
      setIsAddingObservation(false); // Reset loading state
      return;
    }

    let actualLocation = newObservationLocation;
    if (showCustomLocationInput) {
      if (!customLocationName.trim()) {
        console.log("Validation failed: customLocationName is empty");
        toast.error("Le nom de la localisation personnalisée ne peut pas être vide.");
        setIsAddingObservation(false); // Reset loading state
        return;
      }
      actualLocation = customLocationName.trim();
    }

    console.log("Validation passed, preparing observation data.");
    const newObservationData: Omit<Observation, "id" | "created_at" | "user_id"> = {
      text: newObservationText.trim(),
      location_in_space: actualLocation,
      photos: newObservationPhotoBase64s, // Re-enabled photo upload
      space_id: space.id,
    };

    console.log("Calling addObservation with data:", newObservationData);
    const addedObservation = await addObservation(newObservationData);
    console.log("addObservation returned:", addedObservation);
    if (addedObservation) {
      console.log("Photos in addedObservation:", addedObservation.photos); // Add this log
      toast.success("Observation ajoutée avec succès !");
      setNewObservationText("");
      setNewObservationLocation("floor");
      setNewObservationPhotoBase64s([]);
      setShowCustomLocationInput(false);
      setCustomLocationName("");
      setIsObservationFormOpen(false);
      await fetchSpaceAndObservations(); // Force re-fetch all observations
    } else {
      console.error("Failed to add observation: addObservation returned null.");
      toast.error("Échec de l'ajout de l'observation. Veuillez vérifier la console pour plus de détails.");
    }
    setIsAddingObservation(false); // Reset loading state
  };

  const handleDeleteObservation = async (locationKey: string, observationId: string) => {
    if (!project || !level || !space) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette observation ?")) {
      const success = await deleteObservation(observationId);
      if (success) {
        setObservationsByLocation(prev => ({
          ...prev,
          [locationKey]: prev[locationKey].filter(obs => obs.id !== observationId),
        }));
      }
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFilesArray = Array.from(files);
      const photoPromises: Promise<string>[] = newFilesArray.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(photoPromises)
        .then((base64Strings) => {
          setNewObservationPhotoBase64s((prev) => [...prev, ...base64Strings]);
          toast.success(`${base64Strings.length} photo(s) sélectionnée(s).`);
        })
        .catch((error) => {
          console.error("Error reading files:", error);
          toast.error("Erreur lors de la lecture des photos.");
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

  const getLocationDisplayName = (key: string) => {
    switch (key) {
      case "floor": return "Observations du Sol";
      case "wall": return "Observations du Mur";
      case "ceiling": return "Observations du Plafond";
      default: return `Observations de ${key}`;
    }
  };

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
              <Button onClick={() => {
                setNewObservationText("");
                setNewObservationLocation("floor");
                setNewObservationPhotoBase64s([]);
                setShowCustomLocationInput(false);
                setCustomLocationName("");
                setIsObservationFormOpen(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" /> Ajouter une observation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle observation</DialogTitle>
                <DialogDescription>
                  Remplissez les détails de l'observation et ajoutez des photos.
                </DialogDescription>
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
                    onValueChange={(value) => {
                      setNewObservationLocation(value);
                      setShowCustomLocationInput(value === "custom");
                      if (value !== "custom") {
                        setCustomLocationName("");
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une localisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="floor">Sol</SelectItem>
                      <SelectItem value="wall">Mur</SelectItem>
                      <SelectItem value="ceiling">Plafond</SelectItem>
                      <SelectItem value="custom">Autre (spécifier)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showCustomLocationInput && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customLocationName" className="text-right">
                      Nom personnalisé
                    </Label>
                    <Input
                      id="customLocationName"
                      value={customLocationName}
                      onChange={(e) => setCustomLocationName(e.target.value)}
                      placeholder="ex: Fenêtre, Porte, Toit"
                      className="col-span-3"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observationPhotos" className="text-right">
                    Prendre/Sélectionner des photos
                  </Label>
                  <Input
                    id="observationPhotos"
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="col-span-3"
                  />
                </div>
                <div className="col-span-4 flex flex-wrap gap-2 justify-end">
                  {newObservationPhotoBase64s.map((photo, index) => (
                    <img key={index} src={photo} alt={`Observation ${index + 1}`} className="w-20 h-20 object-cover rounded-md" />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsObservationFormOpen(false)} disabled={isAddingObservation}>Annuler</Button>
                <Button onClick={handleAddObservation} disabled={isAddingObservation || !newObservationText.trim() || (showCustomLocationInput && !customLocationName.trim())}>
                  {isAddingObservation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter l'observation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {Object.keys(observationsByLocation).every(key => observationsByLocation[key].length === 0) ? (
          <p className="text-center text-gray-600 dark:text-gray-400">Aucune observation ajoutée pour cet espace. Ajoutez la première observation !</p>
        ) : (
          <div className="space-y-6">
            {Object.keys(observationsByLocation).map((locationKey) => {
              const observations = observationsByLocation[locationKey];
              if (observations.length === 0) return null;

              return (
                <div key={locationKey} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                  <h3 className="text-xl font-semibold mb-4 capitalize text-gray-800 dark:text-gray-100">
                    {getLocationDisplayName(locationKey)}
                  </h3>
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
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteObservation(locationKey, observation.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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