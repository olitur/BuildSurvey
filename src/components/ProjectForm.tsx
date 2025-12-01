"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/project";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  location: z.string().min(2, {
    message: "La localisation doit contenir au moins 2 caractères.",
  }),
  buildingCharacteristics: z.string().optional(),
});

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  initialData?: Project;
  onCancel?: () => void;
}

const ProjectForm = ({ onSubmit, initialData, onCancel }: ProjectFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialData?.location || "",
      buildingCharacteristics: initialData?.buildingCharacteristics || "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const newProject: Project = {
      id: initialData?.id || uuidv4(),
      levels: initialData?.levels || [],
      ...values,
    };
    onSubmit(newProject);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localisation du projet</FormLabel>
              <FormControl>
                <Input placeholder="ex: 123 Rue Principale, Anytown" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buildingCharacteristics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caractéristiques du bâtiment (Facultatif)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ex: Immeuble résidentiel de 3 étages, construit en 1980"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit">
            {initialData ? "Mettre à jour le projet" : "Créer le projet"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;