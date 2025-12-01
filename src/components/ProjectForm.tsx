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
    message: "Location must be at least 2 characters.",
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
              <FormLabel>Project Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
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
              <FormLabel>Building Characteristics (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 3-story residential building, built 1980"
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
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;