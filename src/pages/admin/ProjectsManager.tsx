import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Calendar, Users, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { ProjectTeamDialog } from "@/components/admin/ProjectTeamDialog";
import { useAllProjectAssignments } from "@/hooks/useProjectAssignments";
import { MediaUploader } from "@/components/admin/MediaUploader";

const statuses = ["Planning", "In Development", "Prototype Ready", "Beta Testing", "Launched"];

interface ProjectForm {
  title: string;
  tagline: string;
  description: string;
  launch_date: string;
  status: string;
  progress_percentage: number;
  image_url: string;
  video_url: string;
  impact: string;
  features: string[];
  gallery_images: string[];
  gallery_videos: string[];
}

const defaultForm: ProjectForm = {
  title: "",
  tagline: "",
  description: "",
  launch_date: "",
  status: "Planning",
  progress_percentage: 0,
  image_url: "",
  video_url: "",
  impact: "",
  features: [],
  gallery_images: [],
  gallery_videos: [],
};

export default function ProjectsManager() {
  const { data: projects, isLoading } = useProjects();
  const { data: allAssignments } = useAllProjectAssignments();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(defaultForm);
  const [featuresInput, setFeaturesInput] = useState("");
  const [teamDialogProject, setTeamDialogProject] = useState<{ id: string; title: string } | null>(null);

  // Group assignments by project
  const assignmentsByProject = (allAssignments || []).reduce((acc, assignment: any) => {
    const projectId = assignment.project_id;
    if (!acc[projectId]) acc[projectId] = [];
    acc[projectId].push(assignment);
    return acc;
  }, {} as Record<string, any[]>);

  const openCreateDialog = () => {
    setForm(defaultForm);
    setFeaturesInput("");
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: any) => {
    const features = Array.isArray(project.features) ? project.features : [];
    const galleryImages = Array.isArray(project.gallery_images) ? project.gallery_images : [];
    const galleryVideos = Array.isArray(project.gallery_videos) ? project.gallery_videos : [];
    setForm({
      title: project.title,
      tagline: project.tagline || "",
      description: project.description || "",
      launch_date: project.launch_date || "",
      status: project.status || "Planning",
      progress_percentage: project.progress_percentage || 0,
      image_url: project.image_url || "",
      video_url: project.video_url || "",
      impact: project.impact || "",
      features,
      gallery_images: galleryImages,
      gallery_videos: galleryVideos,
    });
    setFeaturesInput(features.join(", "));
    setEditingId(project.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const features = featuresInput.split(",").map(f => f.trim()).filter(Boolean);
    
    // Use first gallery image as main image if not set
    const image_url = form.image_url || form.gallery_images[0] || "";
    // Use first gallery video as main video if not set
    const video_url = form.video_url || form.gallery_videos[0] || "";
    
    try {
      if (editingId) {
        await updateProject.mutateAsync({ 
          id: editingId, 
          ...form, 
          features, 
          image_url,
          video_url,
          gallery_images: form.gallery_images,
          gallery_videos: form.gallery_videos,
        });
        toast({ title: "Project updated successfully" });
      } else {
        await createProject.mutateAsync({ 
          ...form, 
          features, 
          image_url,
          video_url,
          gallery_images: form.gallery_images,
          gallery_videos: form.gallery_videos,
        });
        toast({ title: "Project created successfully" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save project", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: "Project deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage your future projects</p>
        </div>
        <Button variant="hero" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects?.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {project.status}
                  </span>
                  <h3 className="font-display text-xl font-semibold mt-1">{project.title}</h3>
                  <p className="text-sm text-accent">{project.tagline}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {project.launch_date}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-accent">{project.progress_percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Team Members Preview */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Team
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {assignmentsByProject[project.id]?.length || 0} members
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {(assignmentsByProject[project.id] || []).slice(0, 5).map((assignment: any) => (
                    <Avatar key={assignment.id} className="w-7 h-7 border-2 border-background -ml-1 first:ml-0">
                      <AvatarImage src={assignment.team_members?.profile_image || undefined} />
                      <AvatarFallback className="text-xs">
                        {assignment.team_members?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {(assignmentsByProject[project.id]?.length || 0) > 5 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      +{(assignmentsByProject[project.id]?.length || 0) - 5}
                    </span>
                  )}
                  {(!assignmentsByProject[project.id] || assignmentsByProject[project.id].length === 0) && (
                    <span className="text-xs text-muted-foreground">No members assigned</span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(project)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTeamDialogProject({ id: project.id, title: project.title })}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Team
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Project" : "Add New Project"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Launch Date</Label>
                <Input
                  value={form.launch_date}
                  onChange={(e) => setForm({ ...form, launch_date: e.target.value })}
                  placeholder="e.g., Q2 2025"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Progress: {form.progress_percentage}%</Label>
              <Slider
                value={[form.progress_percentage]}
                onValueChange={([v]) => setForm({ ...form, progress_percentage: v })}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Features (comma-separated)</Label>
              <Input
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>

            <div className="space-y-2">
              <Label>Projected Impact</Label>
              <Input
                value={form.impact}
                onChange={(e) => setForm({ ...form, impact: e.target.value })}
                placeholder="e.g., Help 10M+ users"
              />
            </div>

            {/* Media Upload Section */}
            <div className="space-y-3 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Project Media</h3>
              </div>
              <MediaUploader
                images={form.gallery_images}
                videos={form.gallery_videos}
                onImagesChange={(images) => setForm({ ...form, gallery_images: images })}
                onVideosChange={(videos) => setForm({ ...form, gallery_videos: videos })}
                maxImages={10}
                maxVideos={2}
                folder="projects"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                {editingId ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {teamDialogProject && (
        <ProjectTeamDialog
          projectId={teamDialogProject.id}
          projectTitle={teamDialogProject.title}
          open={!!teamDialogProject}
          onOpenChange={(open) => !open && setTeamDialogProject(null)}
        />
      )}
    </div>
  );
}