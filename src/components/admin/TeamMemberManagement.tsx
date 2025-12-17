import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Filter, Users, Edit, Trash2, UserX, UserCheck, 
  Mail, Phone, Building, Circle, 
  AlertTriangle, CheckCircle, XCircle, Eye
} from "lucide-react";
import { ViewTeamMemberDialog } from "./ViewTeamMemberDialog";
import { TeamMemberProfile } from "./TeamMemberProfileCard";

interface TeamMemberWithUserId extends TeamMemberProfile {
  user_id?: string | null;
}

interface TeamMemberManagementProps {
  members: TeamMemberWithUserId[];
  onUpdate: () => void;
}

type FilterStatus = "all" | "active" | "inactive";
type FilterRole = "all" | string;

export function TeamMemberManagement({ members, onUpdate }: TeamMemberManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  
  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberWithUserId | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [permanentDelete, setPermanentDelete] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    status: "active",
  });

  // Get unique roles and departments
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(members.map(m => m.role))];
    return roles.filter(Boolean);
  }, [members]);

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(members.map(m => m.department).filter(Boolean))];
    return departments as string[];
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || member.status === filterStatus;
      const matchesRole = filterRole === "all" || member.role === filterRole;
      const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;

      return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
    });
  }, [members, searchQuery, filterStatus, filterRole, filterDepartment]);

  const getOnlineStatus = (lastSeen?: string | null) => {
    if (!lastSeen) return { status: "offline", color: "bg-gray-400" };
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 5) return { status: "online", color: "bg-green-500" };
    if (diffMinutes < 30) return { status: "away", color: "bg-yellow-500" };
    return { status: "offline", color: "bg-gray-400" };
  };

  const handleEditClick = (member: TeamMemberWithUserId) => {
    if (member.role === "CEO & Founder") {
      toast.error("Cannot edit CEO & Founder profile from here");
      return;
    }
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      role: member.role,
      department: member.department || "",
      designation: member.designation || "",
      email: member.email,
      phone: member.phone || "",
      status: member.status || "active",
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (member: TeamMemberWithUserId) => {
    if (member.role === "CEO & Founder") {
      toast.error("Cannot remove CEO & Founder");
      return;
    }
    setSelectedMember(member);
    setDeleteReason("");
    setPermanentDelete(false);
    setShowDeleteDialog(true);
  };

  const handleViewClick = (member: TeamMemberWithUserId) => {
    setSelectedMember(member);
    setShowViewDialog(true);
  };

  const handleToggleStatus = async (member: TeamMemberWithUserId) => {
    if (member.role === "CEO & Founder") {
      toast.error("Cannot disable CEO & Founder account");
      return;
    }

    const newStatus = member.status === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", member.id);

      if (error) throw error;

      toast.success(`${member.name} account ${newStatus === "active" ? "enabled" : "disabled"}`);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: editForm.name,
          role: editForm.role,
          department: editForm.department,
          designation: editForm.designation,
          email: editForm.email,
          phone: editForm.phone,
          status: editForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedMember.id);

      if (error) throw error;

      toast.success("Team member updated successfully");
      setShowEditDialog(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update team member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    setIsProcessing(true);

    try {
      if (permanentDelete) {
        // Permanent delete - remove from all related tables
        // First, clean up from projects (nullify assigned_to)
        await supabase
          .from("tasks")
          .update({ assigned_to: null })
          .eq("assigned_to", selectedMember.user_id || selectedMember.id);

        // Clean up tasks assigned by this member
        await supabase
          .from("tasks")
          .update({ assigned_by: null })
          .eq("assigned_by", selectedMember.user_id || selectedMember.id);

        // Remove from meetings attendees (we need to handle JSON array)
        const { data: meetings } = await supabase
          .from("meetings")
          .select("id, attendees");

        if (meetings) {
          for (const meeting of meetings) {
            const attendees = meeting.attendees as string[] | null;
            if (attendees && attendees.includes(selectedMember.id)) {
              const updatedAttendees = attendees.filter(id => id !== selectedMember.id);
              await supabase
                .from("meetings")
                .update({ attendees: updatedAttendees })
                .eq("id", meeting.id);
            }
          }
        }

        // If user has auth account, delete it
        if (selectedMember.user_id) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.functions.invoke("delete-user", {
              body: { user_id: selectedMember.user_id },
            });
          }
        }

        // Delete the team member record
        const { error } = await supabase
          .from("team_members")
          .delete()
          .eq("id", selectedMember.id);

        if (error) throw error;
        
        toast.success(`${selectedMember.name} has been permanently deleted`);
      } else {
        // Soft delete - just disable the account
        // First, clean up from active projects and tasks
        await supabase
          .from("tasks")
          .update({ assigned_to: null })
          .eq("assigned_to", selectedMember.user_id || selectedMember.id);

        await supabase
          .from("tasks")
          .update({ assigned_by: null })
          .eq("assigned_by", selectedMember.user_id || selectedMember.id);

        // Update status to inactive
        const { error } = await supabase
          .from("team_members")
          .update({ 
            status: "inactive", 
            updated_at: new Date().toISOString() 
          })
          .eq("id", selectedMember.id);

        if (error) throw error;

        // Remove user role to revoke access
        if (selectedMember.user_id) {
          await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", selectedMember.user_id);
        }

        toast.success(`${selectedMember.name} has been removed (data preserved for audit)`);
      }

      setShowDeleteDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove team member");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Member Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mt-4">
            Showing {filteredMembers.length} of {members.length} team members
          </p>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <div className="grid gap-4">
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No team members found</p>
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map(member => {
            const onlineStatus = getOnlineStatus(member.last_seen);
            const isCEO = member.role === "CEO & Founder";

            return (
              <Card key={member.id} className={`${member.status === "inactive" ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar with status */}
                    <div className="relative">
                      {member.profile_image ? (
                        <img 
                          src={member.profile_image} 
                          alt={member.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${isCEO ? "bg-gradient-to-br from-yellow-500 to-orange-500" : "bg-gradient-to-br from-blue-500 to-purple-500"}`}>
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${onlineStatus.color}`} />
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        {isCEO && <Badge className="bg-yellow-500/20 text-yellow-500">CEO</Badge>}
                        {member.is_core_pillar && <Badge variant="outline" className="text-xs">Core Pillar</Badge>}
                        <Badge className={`text-xs ${member.status === "active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {member.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {member.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </span>
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Online Status */}
                    <div className="hidden md:block text-right text-sm">
                      <span className={`flex items-center gap-1 ${onlineStatus.status === "online" ? "text-green-500" : "text-muted-foreground"}`}>
                        <Circle className={`w-2 h-2 ${onlineStatus.status === "online" ? "fill-green-500" : ""}`} />
                        {onlineStatus.status === "online" ? "Online" : onlineStatus.status === "away" ? "Away" : "Offline"}
                      </span>
                      {member.serial_number && (
                        <p className="text-xs text-muted-foreground mt-1">ID: {member.serial_number}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewClick(member)} title="View Profile">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditClick(member)}
                        disabled={isCEO}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleToggleStatus(member)}
                        disabled={isCEO}
                        title={member.status === "active" ? "Disable Account" : "Enable Account"}
                      >
                        {member.status === "active" ? (
                          <UserX className="w-4 h-4 text-orange-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(member)}
                        disabled={isCEO}
                        className="text-red-500 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Team Member
            </DialogTitle>
            <DialogDescription>
              Update {selectedMember?.name}'s information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input 
                  value={editForm.role} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input 
                  value={editForm.department} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input 
                  value={editForm.designation} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={editForm.email} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isProcessing}>
              {isProcessing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription>
              This will revoke access and remove from all projects/tasks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Member info */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {selectedMember?.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{selectedMember?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMember?.role}</p>
                <p className="text-xs text-muted-foreground">{selectedMember?.department}</p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-600 mb-2">This action will:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Remove from all assigned projects
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Remove from all assigned tasks
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Remove from all meetings
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Revoke login access immediately
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Historical data preserved for audit
                </li>
              </ul>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason for removal (optional)</Label>
              <Textarea
                placeholder="Enter reason..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={2}
              />
            </div>

            {/* Permanent delete option */}
            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div>
                <p className="font-medium text-red-500">Permanent Delete</p>
                <p className="text-xs text-muted-foreground">Completely remove from database (irreversible)</p>
              </div>
              <Switch 
                checked={permanentDelete} 
                onCheckedChange={setPermanentDelete}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isProcessing}>
              {isProcessing ? "Processing..." : permanentDelete ? "Delete Permanently" : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      {selectedMember && (
        <ViewTeamMemberDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          member={selectedMember}
          canEdit={true}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
