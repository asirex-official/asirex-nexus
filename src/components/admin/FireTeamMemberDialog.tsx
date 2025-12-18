import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserMinus, AlertTriangle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TeamMember } from "./AddTeamMemberDialog";
import { useAuditLog } from "@/hooks/useAuditLog";

interface FireTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  onFire: (memberId: string) => void;
}

export function FireTeamMemberDialog({ open, onOpenChange, members, onFire }: FireTeamMemberDialogProps) {
  const auditLogger = useAuditLog();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [reason, setReason] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectMember = (member: TeamMember) => {
    if (member.role === "CEO & Founder") {
      toast.error("Cannot remove CEO & Founder");
      return;
    }
    setSelectedMember(member);
    setIsConfirming(true);
  };

  const handleConfirmFire = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onFire(selectedMember.id);
    
    // Log audit event
    await auditLogger.logTeamMemberFired(selectedMember.name, selectedMember.id, reason || undefined, false);
    
    toast.success(`${selectedMember.name} has been removed from the team`);
    
    setSelectedMember(null);
    setReason("");
    setIsConfirming(false);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    setIsConfirming(false);
    setSelectedMember(null);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setSelectedMember(null);
        setReason("");
        setIsConfirming(false);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserMinus className="w-6 h-6 text-red-500" />
            Remove Team Member
          </DialogTitle>
          <DialogDescription>
            {isConfirming ? "Confirm removal of team member" : "Select a team member to remove from ASIREX"}
          </DialogDescription>
        </DialogHeader>

        {!isConfirming ? (
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {members.filter(m => m.role !== "CEO & Founder").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No team members to remove</p>
              </div>
            ) : (
              members.filter(m => m.role !== "CEO & Founder").map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 border border-transparent cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.id}
                  </Badge>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-500">Warning: This action cannot be undone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You are about to remove <strong>{selectedMember?.name}</strong> from the team.
                </p>
              </div>
            </div>

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

            <div className="space-y-2">
              <Label>Reason for removal (optional)</Label>
              <Textarea
                placeholder="Enter reason for removing this team member..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {isConfirming ? (
            <>
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleConfirmFire}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Removing..." : "Confirm Removal"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
