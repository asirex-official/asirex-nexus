import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FolderKanban, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  status: string | null;
  progress_percentage: number | null;
}

interface AssignProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  onAssigned?: () => void;
}

export function AssignProjectDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
  onAssigned,
}: AssignProjectDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, status, progress_percentage")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAssign = async () => {
    if (selectedProjects.length === 0) {
      toast({
        title: "No projects selected",
        description: "Please select at least one project to assign.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Create tasks for each assigned project
      const tasks = selectedProjects.map((projectId) => {
        const project = projects.find((p) => p.id === projectId);
        return {
          title: `Work on: ${project?.title}`,
          description: `Assigned to work on project: ${project?.title}`,
          assigned_to: memberId,
          status: "pending",
          priority: "medium",
        };
      });

      const { error } = await supabase.from("tasks").insert(tasks);

      if (error) throw error;

      toast({
        title: "Projects assigned",
        description: `${selectedProjects.length} project(s) assigned to ${memberName}.`,
      });

      setSelectedProjects([]);
      onAssigned?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "in development":
      case "in progress":
        return "bg-blue-500/20 text-blue-400";
      case "planning":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            Assign Projects
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Assigning to: <strong>{memberName}</strong>
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects available
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Select projects to assign:
              </Label>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedProjects.includes(project.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleToggleProject(project.id)}
                >
                  <Checkbox
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleToggleProject(project.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{project.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status || "Planning"}
                      </Badge>
                      {project.progress_percentage !== null && (
                        <span className="text-xs text-muted-foreground">
                          {project.progress_percentage}% complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isSaving || selectedProjects.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedProjects.length} Project${selectedProjects.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
