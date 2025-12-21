import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Calendar, Users, Clock, Video, Bell, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TeamMember } from "./AddTeamMemberDialog";
import { useAuditLog } from "@/hooks/useAuditLog";

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  onMeetingScheduled?: () => void;
}

export function ScheduleMeetingDialog({ open, onOpenChange, members, onMeetingScheduled }: ScheduleMeetingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const auditLog = useAuditLog();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingDate: "",
    meetingTime: "",
    duration: "60",
    meetingLink: "",
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [notifyAttendees, setNotifyAttendees] = useState(true);

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

  const handleSchedule = async () => {
    if (!formData.title || !formData.meetingDate || !formData.meetingTime) {
      toast.error("Please fill in meeting title, date and time");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one attendee");
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time into ISO format
      const meetingDateTime = new Date(`${formData.meetingDate}T${formData.meetingTime}`);
      
      // Get attendee details
      const attendeeDetails = members
        .filter(m => selectedMembers.includes(m.id))
        .map(m => ({ id: m.id, name: m.name, email: m.email, role: m.role }));

      // Insert meeting into database
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: formData.title,
          description: formData.description || null,
          meeting_date: meetingDateTime.toISOString(),
          duration_minutes: parseInt(formData.duration),
          meeting_link: formData.meetingLink || `https://meet.google.com/new`,
          attendees: attendeeDetails,
          status: 'scheduled',
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // If notify is enabled, create a notice for all attendees and send emails
      if (notifyAttendees && meetingData) {
        const attendeeNames = attendeeDetails.map(a => a.name).join(', ');
        const currentUser = (await supabase.auth.getUser()).data.user;
        
        // Create notice
        await supabase
          .from('notices')
          .insert({
            title: `Meeting Scheduled: ${formData.title}`,
            content: `You have been invited to a meeting.\n\nDate: ${meetingDateTime.toLocaleString()}\nDuration: ${formData.duration} minutes\nAttendees: ${attendeeNames}\n\n${formData.description || 'No additional details.'}`,
            priority: 'high',
            is_active: true,
            posted_by: currentUser?.id,
          });

        // Send email invites
        try {
          await supabase.functions.invoke('send-meeting-invite', {
            body: {
              meetingTitle: formData.title,
              meetingDescription: formData.description || undefined,
              meetingDate: formData.meetingDate,
              meetingTime: formData.meetingTime,
              durationMinutes: parseInt(formData.duration),
              meetingLink: formData.meetingLink || meetingData.meeting_link,
              attendees: attendeeDetails.map(a => ({ email: a.email, name: a.name })),
              organizerName: currentUser?.email || 'ASIREX Admin'
            }
          });
        } catch (emailError) {
          console.error('Failed to send meeting invite emails:', emailError);
        }

        toast.success("Meeting scheduled and notifications sent!", {
          description: `${selectedMembers.length} attendees will be notified via email`,
        });
      } else {
        toast.success("Meeting scheduled successfully!");
      }

      await auditLog.logMeetingScheduled(formData.title, meetingData.id, selectedMembers.length, meetingDateTime.toISOString());
      onMeetingScheduled?.();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error scheduling meeting:', error);
      toast.error(error.message || "Failed to schedule meeting");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      meetingDate: "",
      meetingTime: "",
      duration: "60",
      meetingLink: "",
    });
    setSelectedMembers([]);
    setNotifyAttendees(true);
  };

  // Get tomorrow's date as minimum
  const minDate = new Date();
  minDate.setDate(minDate.getDate());
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-500">
            <Calendar className="w-6 h-6" />
            Schedule Meeting
          </DialogTitle>
          <DialogDescription>
            Schedule a meeting and notify all attendees automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Meeting Title *</Label>
            <Input
              placeholder="E.g., Weekly Team Sync, Product Review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Meeting agenda and details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date *
              </Label>
              <Input
                type="date"
                min={minDateStr}
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time *
              </Label>
              <Input
                type="time"
                value={formData.meetingTime}
                onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4" /> Meeting Link (optional)
              </Label>
              <Input
                placeholder="https://meet.google.com/..."
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Select Attendees *
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                {selectedMembers.length === members.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2 p-3 bg-muted/50 rounded-lg border">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No team members available</p>
              ) : (
                members.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMembers.includes(member.id) ? 'bg-primary/10 border border-primary/30' : 'hover:bg-background'
                    }`}
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
                      <p className="text-xs text-muted-foreground">{member.role} • {member.department}</p>
                    </div>
                    {selectedMembers.includes(member.id) && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMembers.length} attendee{selectedMembers.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Checkbox
              id="notify"
              checked={notifyAttendees}
              onCheckedChange={(checked) => setNotifyAttendees(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="notify" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <Bell className="w-4 h-4 text-yellow-500" />
                Notify all attendees
              </label>
              <p className="text-xs text-muted-foreground">
                Send a notification to all selected team members about this meeting
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
            onClick={handleSchedule}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Schedule Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
