import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberProfileCard, TeamMemberProfile, AssignedTask, AssignedProject } from "./TeamMemberProfileCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Upload, X } from "lucide-react";

interface ViewTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMemberProfile | null;
  canEdit?: boolean;
  onUpdate?: () => void;
}

export function ViewTeamMemberDialog({
  open,
  onOpenChange,
  member,
  canEdit = false,
  onUpdate,
}: ViewTeamMemberDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [projects, setProjects] = useState<AssignedProject[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    department: "",
    designation: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setEditForm({
        name: member.name || "",
        phone: member.phone || "",
        department: member.department || "",
        designation: member.designation || "",
      });
      fetchMemberData(member.id);
    }
  }, [member]);

  const fetchMemberData = async (memberId: string) => {
    try {
      // Fetch tasks assigned to this member (by user_id if linked)
      if (member?.email) {
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("id, title, status, priority, due_date")
          .or(`assigned_to.eq.${member.id}`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (tasksData) {
          setTasks(tasksData as AssignedTask[]);
        }
      }

      // For now, projects don't have direct assignment, so we'll leave empty
      setProjects([]);
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!member) return;
    setIsLoading(true);

    try {
      let profileImageUrl = member.profile_image;

      // Upload new profile image if selected
      if (profileImage) {
        const fileExt = profileImage.name.split(".").pop();
        const fileName = `${member.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("team-profiles")
          .upload(fileName, profileImage, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("team-profiles")
          .getPublicUrl(fileName);

        profileImageUrl = urlData.publicUrl;
      }

      // Update team member
      const { error } = await supabase
        .from("team_members")
        .update({
          name: editForm.name,
          phone: editForm.phone,
          department: editForm.department,
          designation: editForm.designation,
          profile_image: profileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", member.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Team member profile has been updated successfully.",
      });

      setIsEditing(false);
      setProfileImage(null);
      setPreviewUrl(null);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    setProfileImage(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Team Member" : "Team Member Profile"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Card</TabsTrigger>
            {canEdit && <TabsTrigger value="edit">Edit Details</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <TeamMemberProfileCard
              member={member}
              tasks={tasks}
              projects={projects}
              canEdit={canEdit}
              onEdit={() => setIsEditing(true)}
            />
          </TabsContent>

          {canEdit && (
            <TabsContent value="edit" className="mt-4 space-y-6">
              {/* Profile Photo */}
              <div className="space-y-3">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted">
                    {previewUrl || member.profile_image ? (
                      <img
                        src={previewUrl || member.profile_image || ""}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload New Photo</span>
                      </div>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </Label>
                    {previewUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProfileImage(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    placeholder="Enter designation"
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
                <div className="space-y-2">
                  <Label>Email (Read-only)</Label>
                  <Input value={member.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number (Read-only)</Label>
                  <Input value={member.serial_number || "N/A"} disabled />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
