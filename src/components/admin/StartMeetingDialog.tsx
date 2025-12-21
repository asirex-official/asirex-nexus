import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Video, Users, Clock, Copy, ExternalLink } from "lucide-react";
import type { TeamMember } from "./AddTeamMemberDialog";

interface StartMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
}

export function StartMeetingDialog({ open, onOpenChange, members }: StartMeetingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    duration: "",
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [meetingCreated, setMeetingCreated] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  const handleCreateMeeting = () => {
    if (!formData.title || !formData.type) {
      toast.error("Please fill in meeting title and type");
      return;
    }

    // Generate Google Meet link format (users can replace with actual meeting)
    const meetingId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const meetLink = `https://meet.google.com/new?hs=180&authuser=0`;
    setMeetingLink(meetLink);
    setMeetingCreated(true);
    toast.success("Meeting created! Click 'Start Now' to open Google Meet.");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    toast.success("Meeting link copied!");
  };

  const startMeeting = () => {
    toast.success("Opening meeting...");
    // In real app, would open meeting platform
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: "", type: "", duration: "" });
    setSelectedMembers([]);
    setMeetingCreated(false);
    setMeetingLink("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-500">
            <Video className="w-6 h-6" />
            Start Meeting
          </DialogTitle>
          <DialogDescription>
            {meetingCreated ? "Your meeting is ready!" : "Create a new team meeting"}
          </DialogDescription>
        </DialogHeader>

        {!meetingCreated ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Meeting Title *</Label>
              <Input
                placeholder="E.g., Weekly Team Sync"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meeting Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team_meeting">Team Meeting</SelectItem>
                    <SelectItem value="one_on_one">1:1 Meeting</SelectItem>
                    <SelectItem value="standup">Daily Standup</SelectItem>
                    <SelectItem value="review">Review Meeting</SelectItem>
                    <SelectItem value="brainstorm">Brainstorming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Duration
                </Label>
                <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Invite Members
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                  {selectedMembers.length === members.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="max-h-[200px] overflow-y-auto space-y-2 p-3 bg-muted/50 rounded-lg">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <Video className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="font-semibold text-green-500">Meeting Ready!</p>
              <p className="text-sm text-muted-foreground mt-1">{formData.title}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Meeting Link</p>
              <div className="flex items-center gap-2">
                <Input value={meetingLink} readOnly className="text-sm" />
                <Button type="button" variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>{selectedMembers.length}</strong> members invited</p>
              {formData.duration && <p>Duration: {formData.duration} minutes</p>}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!meetingCreated ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" className="bg-blue-500 hover:bg-blue-600 gap-2" onClick={handleCreateMeeting}>
                <Video className="w-4 h-4" />
                Create Meeting
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={copyLink} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button type="button" className="bg-green-500 hover:bg-green-600 gap-2" onClick={startMeeting}>
                <ExternalLink className="w-4 h-4" />
                Start Now
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
