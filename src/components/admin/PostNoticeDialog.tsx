import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Megaphone, Send, Users, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: "high" | "medium" | "low";
  to: string;
  date: string;
  author: string;
}

interface PostNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (notice: Notice) => void;
}

const recipients = [
  { value: "all", label: "All Team", icon: Users },
  { value: "production", label: "Production Team", icon: Users },
  { value: "sales", label: "Sales Team", icon: Users },
  { value: "development", label: "Development Team", icon: Users },
  { value: "core_pillars", label: "Core Pillars Only", icon: Users },
];

export function PostNoticeDialog({ open, onOpenChange, onPost }: PostNoticeDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "",
    to: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.priority || !formData.to) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('notices')
        .insert({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          posted_by: userData?.user?.id || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newNotice: Notice = {
        id: data.id,
        title: data.title,
        content: data.content,
        priority: data.priority as "high" | "medium" | "low",
        to: recipients.find(r => r.value === formData.to)?.label || formData.to,
        date: "Just now",
        author: "Kapeesh Sorout",
      };

      onPost(newNotice);
      toast.success("Notice posted successfully!");
      
      setFormData({ title: "", content: "", priority: "", to: "" });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error posting notice:", error);
      toast.error(error.message || "Failed to post notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Info className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="w-6 h-6 text-yellow-500" />
            Post Notice
          </DialogTitle>
          <DialogDescription>
            Create and send a notice to your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notice Title</Label>
            <Input
              id="title"
              placeholder="Enter notice title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your notice content..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-yellow-500" />
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
              <Label>Send To</Label>
              <Select value={formData.to} onValueChange={(value) => setFormData({ ...formData, to: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((recipient) => (
                    <SelectItem key={recipient.value} value={recipient.value}>
                      <div className="flex items-center gap-2">
                        <recipient.icon className="w-4 h-4" />
                        {recipient.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {formData.title && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="flex items-start gap-2">
                {getPriorityIcon(formData.priority)}
                <div>
                  <p className="font-medium">{formData.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{formData.content}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 gap-2" disabled={isSubmitting}>
              <Send className="w-4 h-4" />
              {isSubmitting ? "Posting..." : "Post Notice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
