import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  useProjectAssignments,
  useAssignToProject,
  useUnassignFromProject,
  useUpdateProjectRole,
} from "@/hooks/useProjectAssignments";
import {
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  Crown,
  Briefcase,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  designation: string | null;
  profile_image: string | null;
  department: string | null;
}

interface ProjectTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

export function ProjectTeamDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: ProjectTeamDialogProps) {
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showAddView, setShowAddView] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: assignments, isLoading: isLoadingAssignments } = useProjectAssignments(projectId);
  const assignMutation = useAssignToProject();
  const unassignMutation = useUnassignFromProject();
  const updateRoleMutation = useUpdateProjectRole();

  const assignedMemberIds = new Set(assignments?.map((a) => a.team_member_id) || []);

  useEffect(() => {
    if (open && showAddView) {
      fetchAllMembers();
    }
  }, [open, showAddView]);

  const fetchAllMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, email, role, designation, profile_image, department")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setAllMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;

    try {
      for (const memberId of selectedMembers) {
        await assignMutation.mutateAsync({
          projectId,
          teamMemberId: memberId,
        });
      }

      toast({
        title: "Members assigned",
        description: `${selectedMembers.length} member(s) added to ${projectTitle}`,
      });

      setSelectedMembers([]);
      setShowAddView(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (teamMemberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;

    try {
      await unassignMutation.mutateAsync({
        projectId,
        teamMemberId,
      });

      toast({
        title: "Member removed",
        description: `${memberName} has been removed from ${projectTitle}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const unassignedMembers = allMembers.filter(
    (m) => !assignedMemberIds.has(m.id)
  );

  const handleSetLead = async (teamMemberId: string, memberName: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        projectId,
        teamMemberId,
        role: "lead",
      });
      toast({
        title: "Lead assigned",
        description: `${memberName} is now the project lead`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveLead = async (teamMemberId: string, memberName: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        projectId,
        teamMemberId,
        role: "member",
      });
      toast({
        title: "Lead removed",
        description: `${memberName} is now a regular member`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Sort assignments: leads first
  const sortedAssignments = [...(assignments || [])].sort((a, b) => {
    if (a.role === "lead" && b.role !== "lead") return -1;
    if (a.role !== "lead" && b.role === "lead") return 1;
    return 0;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {showAddView ? "Add Team Members" : "Project Team"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{projectTitle}</p>
        </DialogHeader>

        {showAddView ? (
          // Add members view
          <div className="space-y-4">
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : unassignedMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                All team members are already assigned
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {unassignedMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMembers.includes(member.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleToggleMember(member.id)}
                    >
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                      />
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.profile_image || undefined} />
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.designation || member.role}
                        </p>
                      </div>
                      {member.department && (
                        <Badge variant="outline" className="text-xs">
                          {member.department}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAddView(false);
                  setSelectedMembers([]);
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0 || assignMutation.isPending}
              >
                {assignMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        ) : (
          // View assigned members
          <div className="space-y-4">
            {isLoadingAssignments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !sortedAssignments || sortedAssignments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No team members assigned</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add team members to collaborate on this project
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {sortedAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className={`flex items-center gap-3 p-3 rounded-lg group transition-colors ${
                        assignment.role === "lead"
                          ? "bg-yellow-500/10 border border-yellow-500/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={assignment.team_member?.profile_image || undefined}
                        />
                        <AvatarFallback>
                          {assignment.team_member?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {assignment.team_member?.name}
                          </p>
                          {assignment.role === "lead" && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {assignment.team_member?.designation ||
                            assignment.team_member?.role}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant="outline"
                            className={`text-xs cursor-pointer hover:bg-accent ${
                              assignment.role === "lead"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : ""
                            }`}
                          >
                            {assignment.role === "lead" ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Lead
                              </>
                            ) : (
                              "Member"
                            )}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {assignment.role === "lead" ? (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveLead(
                                  assignment.team_member_id,
                                  assignment.team_member?.name || "Member"
                                )
                              }
                            >
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Demote to Member
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleSetLead(
                                  assignment.team_member_id,
                                  assignment.team_member?.name || "Member"
                                )
                              }
                            >
                              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                              Promote to Lead
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleRemoveMember(
                            assignment.team_member_id,
                            assignment.team_member?.name || "Member"
                          )
                        }
                        disabled={unassignMutation.isPending}
                      >
                        <UserMinus className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowAddView(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Members
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
