import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ClipboardList, Calendar, Bell, AlertCircle, CheckCircle, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";

interface DirectTaskAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  onTaskAssigned?: () => void;
}

export function DirectTaskAssignDialog({ 
  open, 
  onOpenChange, 
  memberId, 
  memberName,
  onTaskAssigned 
}: DirectTaskAssignDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const auditLog = useAuditLog();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  const handleAssign = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = (await supabase.auth.getUser()).data.user;

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          priority: formData.priority,
          status: 'pending',
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          assigned_to: memberId,
          assigned_by: currentUser?.id,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      if (notifyAssignee && taskData) {
        await supabase
          .from('notices')
          .insert({
            title: `New Task Assigned: ${formData.title}`,
            content: `You have been assigned a new task.\n\nTask: ${formData.title}\nPriority: ${formData.priority.toUpperCase()}\n${formData.dueDate ? `Due Date: ${new Date(formData.dueDate).toLocaleDateString()}\n` : ''}${formData.description ? `\nDescription:\n${formData.description}` : ''}`,
            priority: formData.priority === 'high' ? 'high' : formData.priority === 'medium' ? 'medium' : 'low',
            is_active: true,
            posted_by: currentUser?.id,
          });

        toast.success("Task assigned and notification sent!", {
          description: `${memberName} has been notified`,
        });
      } else {
        toast.success("Task assigned successfully!", {
          description: `Task assigned to ${memberName}`,
        });
      }

      await auditLog.logTaskAssigned(formData.title, taskData.id, memberName, memberId, formData.priority);
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
    setNotifyAssignee(true);
  };

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-500">
            <ClipboardList className="w-6 h-6" />
            Assign Task to {memberName}
          </DialogTitle>
          <DialogDescription>
            Create a task directly for this team member
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

          <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Checkbox
              id="notify-task-direct"
              checked={notifyAssignee}
              onCheckedChange={(checked) => setNotifyAssignee(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="notify-task-direct" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <Bell className="w-4 h-4 text-blue-500" />
                Notify {memberName}
              </label>
              <p className="text-xs text-muted-foreground">
                Send a notification about this task assignment
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
            className="bg-blue-500 hover:bg-blue-600 gap-2" 
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
