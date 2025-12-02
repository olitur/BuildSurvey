// Removed 'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { Trash2, Edit, Eye } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView: (projectId: string) => void;
}

const ProjectCard = ({ project, onEdit, onDelete, onView }: ProjectCardProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{project.location}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {project.buildingCharacteristics || "Aucune caractéristique fournie."}
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onView(project.id)}>
            <Eye className="h-4 w-4 mr-2" /> Voir
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
            <Edit className="h-4 w-4 mr-2" /> Modifier
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;