import { useState } from "react";
import { Bell, Send, Users, Calendar, ShoppingBag, Ticket, Megaphone, Sparkles, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const categories: NotificationCategory[] = [
  { 
    id: "all_users", 
    label: "All Users", 
    description: "Send to all registered users",
    icon: <Users className="w-4 h-4" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
  },
  { 
    id: "new_signups_today", 
    label: "Today's New Users", 
    description: "Users who signed up today",
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-green-500/10 text-green-500 border-green-500/20"
  },
  { 
    id: "new_signups_week", 
    label: "This Week's New Users", 
    description: "Users who signed up in last 7 days",
    icon: <Calendar className="w-4 h-4" />,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  },
  { 
    id: "first_100_users", 
    label: "First 100 Users", 
    description: "Your earliest registered users",
    icon: <Clock className="w-4 h-4" />,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  },
  { 
    id: "customers_with_orders", 
    label: "Paying Customers", 
    description: "Users who have placed orders",
    icon: <ShoppingBag className="w-4 h-4" />,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  },
  { 
    id: "event_attendees", 
    label: "Event Attendees", 
    description: "Users registered for events",
    icon: <Calendar className="w-4 h-4" />,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
  },
  { 
    id: "inactive_users", 
    label: "Inactive Users", 
    description: "Users with no orders in 30 days",
    icon: <Clock className="w-4 h-4" />,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
  },
  { 
    id: "staff_members", 
    label: "Staff Members", 
    description: "All team members with roles",
    icon: <Users className="w-4 h-4" />,
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  },
];

const notificationTypes = [
  { id: "promo", label: "Promotion / Sale", icon: <Megaphone className="w-4 h-4" /> },
  { id: "new_product", label: "New Product", icon: <ShoppingBag className="w-4 h-4" /> },
  { id: "new_event", label: "New Event", icon: <Calendar className="w-4 h-4" /> },
  { id: "new_coupon", label: "New Coupon Code", icon: <Ticket className="w-4 h-4" /> },
  { id: "announcement", label: "Announcement", icon: <Bell className="w-4 h-4" /> },
  { id: "update", label: "App Update", icon: <Sparkles className="w-4 h-4" /> },
];

export function BulkNotificationSender() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [notificationType, setNotificationType] = useState<string>("announcement");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [targetLimit, setTargetLimit] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<{ count: number; time: Date } | null>(null);

  const handleSend = async () => {
    if (!selectedCategory || !title || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login again");
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-bulk-notifications", {
        body: {
          title,
          message,
          type: notificationType,
          link: link || undefined,
          target_category: selectedCategory,
          target_limit: targetLimit ? parseInt(targetLimit) : undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Notification sent to ${data.sent_count} users!`);
        setLastSent({ count: data.sent_count, time: new Date() });
        // Reset form
        setTitle("");
        setMessage("");
        setLink("");
        setSelectedCategory("");
      } else {
        throw new Error(data?.error || "Failed to send notifications");
      }
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      toast.error(error.message || "Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Bulk Notifications
        </h2>
        <p className="text-muted-foreground">Send targeted notifications to user groups</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Target Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Target Audience</CardTitle>
            <CardDescription>Choose which users should receive this notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCategory === cat.id 
                    ? `${cat.color} border-current` 
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  {selectedCategory === cat.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Label className="text-sm text-muted-foreground">Limit (optional)</Label>
              <Input
                type="number"
                value={targetLimit}
                onChange={(e) => setTargetLimit(e.target.value)}
                placeholder="e.g. 100 (max users to notify)"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Content</CardTitle>
            <CardDescription>Compose your notification message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Flash Sale: 50% OFF Today!"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Don't miss out on our biggest sale of the year! Use code FLASH50 at checkout."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label>Link (optional)</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/shop or /events"
              />
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{title || "Notification title"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{message || "Your message here..."}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSend}
              disabled={sending || !selectedCategory || !title || !message}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>

            {lastSent && (
              <p className="text-center text-sm text-muted-foreground">
                ✓ Last sent to {lastSent.count} users at {lastSent.time.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
