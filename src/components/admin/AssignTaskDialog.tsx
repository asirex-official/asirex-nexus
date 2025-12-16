import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ClipboardList, Users, Calendar, Bell, AlertCircle, CheckCircle, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TeamMember } from "./AddTeamMemberDialog";

interface AssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  onTaskAssigned?: () => void;
}

export function AssignTaskDialog({ open, onOpenChange, members, onTaskAssigned }: AssignTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  const handleAssign = async () => {
    if (!formData.title) {
      toast.error("Please enter a task title");
      return;
    }

    if (!selectedMember) {
      toast.error("Please select a team member to assign the task");
      return;
    }

    setIsLoading(true);

    try {
      const assignedMember = members.find(m => m.id === selectedMember);
      const currentUser = (await supabase.auth.getUser()).data.user;

      // Insert task into database
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          status: 'pending',
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assigned_to: assignedMember?.id || null,
          assigned_by: currentUser?.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // If notify is enabled, create a notice for the assignee
      if (notifyAssignee && taskData && assignedMember) {
        await supabase
          .from('notices')
          .insert({
            title: `New Task Assigned: ${formData.title}`,
            content: `You have been assigned a new task by CEO.\n\nTask: ${formData.title}\nPriority: ${formData.priority.toUpperCase()}\n${formData.dueDate ? `Due Date: ${new Date(formData.dueDate).toLocaleDateString()}\n` : ''}${formData.description ? `\nDescription:\n${formData.description}` : ''}`,
            priority: formData.priority === 'high' ? 'high' : formData.priority === 'medium' ? 'medium' : 'low',
            is_active: true,
            posted_by: currentUser?.id,
          });

        toast.success("Task assigned and notification sent!", {
          description: `${assignedMember.name} has been notified`,
        });
      } else {
        toast.success("Task assigned successfully!");
      }

      onTaskAssigned?.();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error assigning task:', error);
      toast.error(error.message || "Failed to assign task");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
    setSelectedMember("");
    setNotifyAssignee(true);
  };

  // Get today's date as minimum
  const minDate = new Date().toISOString().split('T')[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-purple-500">
            <ClipboardList className="w-6 h-6" />
            Assign Task
          </DialogTitle>
          <DialogDescription>
            Create and assign a task to a team member with optional notification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Task Title *</Label>
            <Input
              placeholder="E.g., Complete product packaging, Update website content"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Detailed task instructions and requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flag className="w-4 h-4" /> Priority
              </Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger className={getPriorityColor(formData.priority)}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-yellow-500" />
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Low Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Due Date
              </Label>
              <Input
                type="date"
                min={minDate}
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Assign To *
            </Label>
            <div className="max-h-[200px] overflow-y-auto space-y-2 p-3 bg-muted/50 rounded-lg border">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No team members available</p>
              ) : (
                members.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMember === member.id ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-background border border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignee"
                      className="sr-only"
                      checked={selectedMember === member.id}
                      onChange={() => setSelectedMember(member.id)}
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role} • {member.department}</p>
                    </div>
                    {selectedMember === member.id && (
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Checkbox
              id="notify-task"
              checked={notifyAssignee}
              onCheckedChange={(checked) => setNotifyAssignee(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="notify-task" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <Bell className="w-4 h-4 text-purple-500" />
                Notify assignee
              </label>
              <p className="text-xs text-muted-foreground">
                Send a notification to the team member about this task
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            className="bg-purple-500 hover:bg-purple-600 gap-2" 
            onClick={handleAssign}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ClipboardList className="w-4 h-4" />
            )}
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
