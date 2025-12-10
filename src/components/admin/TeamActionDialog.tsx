import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, Award, Gift, DollarSign, Target, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TeamMember } from "./AddTeamMemberDialog";

type ActionType = "role" | "promotion" | "bonus" | "salary" | "work";

interface TeamActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  actionType: ActionType;
  onAction: (memberId: string, data: Record<string, string>) => void;
}

const roles = [
  "CEO & Founder",
  "Production Head and Manager",
  "Sales Lead and Head",
  "Core Members and Managing Team Lead",
  "Website Admin and SWE",
  "Marketing Manager",
  "HR Manager",
  "Finance Manager",
  "Team Lead",
  "Senior Developer",
  "Developer",
  "Junior Developer",
  "Intern",
];

const actionConfig = {
  role: {
    title: "Change Role",
    icon: Shield,
    color: "text-purple-500",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
  },
  promotion: {
    title: "Give Promotion",
    icon: Award,
    color: "text-yellow-500",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600",
  },
  bonus: {
    title: "Give Bonus",
    icon: Gift,
    color: "text-green-500",
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
  salary: {
    title: "Change Salary",
    icon: DollarSign,
    color: "text-emerald-500",
    buttonColor: "bg-emerald-500 hover:bg-emerald-600",
  },
  work: {
    title: "Assign Work",
    icon: Target,
    color: "text-blue-500",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
};

export function TeamActionDialog({ open, onOpenChange, members, actionType, onAction }: TeamActionDialogProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = actionConfig[actionType];
  const Icon = config.icon;

  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({});
  };

  const handleSubmit = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onAction(selectedMember.id, formData);
    
    const messages: Record<ActionType, string> = {
      role: `${selectedMember.name}'s role has been updated`,
      promotion: `${selectedMember.name} has been promoted! 🎉`,
      bonus: `Bonus of ${formData.amount || "₹X,XXX"} given to ${selectedMember.name}`,
      salary: `${selectedMember.name}'s salary has been updated`,
      work: `Work assigned to ${selectedMember.name}`,
    };
    
    toast.success(messages[actionType]);
    
    setSelectedMember(null);
    setFormData({});
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedMember(null);
    setFormData({});
  };

  const renderActionForm = () => {
    switch (actionType) {
      case "role":
        return (
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={formData.newRole} onValueChange={(value) => setFormData({ ...formData, newRole: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {roles.filter(r => r !== "CEO & Founder").map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case "promotion":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Position</Label>
              <Select value={formData.newPosition} onValueChange={(value) => setFormData({ ...formData, newPosition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new position" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(r => r !== "CEO & Founder").map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salary Increase</Label>
              <Input
                placeholder="₹XX,XXX"
                value={formData.salaryIncrease || ""}
                onChange={(e) => setFormData({ ...formData, salaryIncrease: e.target.value })}
              />
            </div>
          </div>
        );
      
      case "bonus":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bonus Amount</Label>
              <Input
                placeholder="₹XX,XXX"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Reason for bonus..."
                value={formData.reason || ""}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        );
      
      case "salary":
        return (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Salary</p>
              <p className="font-semibold">{selectedMember?.salary || "Not set"}</p>
            </div>
            <div className="space-y-2">
              <Label>New Salary</Label>
              <Input
                placeholder="₹XX,XXX/month"
                value={formData.newSalary || ""}
                onChange={(e) => setFormData({ ...formData, newSalary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Effective From</Label>
              <Input
                type="date"
                value={formData.effectiveDate || ""}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </div>
          </div>
        );
      
      case "work":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input
                placeholder="Enter task title"
                value={formData.taskTitle || ""}
                onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the work..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setSelectedMember(null);
        setFormData({});
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl ${config.color}`}>
            <Icon className="w-6 h-6" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {selectedMember ? `Action for ${selectedMember.name}` : "Select a team member"}
          </DialogDescription>
        </DialogHeader>

        {!selectedMember ? (
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {members.filter(m => m.role !== "CEO & Founder").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No team members available</p>
              </div>
            ) : (
              members.filter(m => m.role !== "CEO & Founder").map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-primary/10 hover:border-primary/30 border border-transparent cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.department.split(" ")[0]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{selectedMember.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
              </div>
            </div>

            {renderActionForm()}
          </div>
        )}

        <DialogFooter className="gap-2">
          {selectedMember ? (
            <>
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                type="button" 
                className={config.buttonColor}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Confirm ${config.title}`}
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
