import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EventForm {
  name: string;
  description: string;
  event_date: string;
  location: string;
  ticket_price: number;
  image_url: string;
  capacity: number;
  is_featured: boolean;
}

const defaultForm: EventForm = {
  name: "",
  description: "",
  event_date: "",
  location: "",
  ticket_price: 0,
  image_url: "",
  capacity: 100,
  is_featured: false,
};

export default function EventsManager() {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);

  const openCreateDialog = () => {
    setForm(defaultForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: any) => {
    setForm({
      name: event.name,
      description: event.description || "",
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      ticket_price: event.ticket_price || 0,
      image_url: event.image_url || "",
      capacity: event.capacity || 100,
      is_featured: event.is_featured || false,
    });
    setEditingId(event.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...form,
        event_date: new Date(form.event_date).toISOString(),
      };
      
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, ...eventData });
        toast({ title: "Event updated successfully" });
      } else {
        await createEvent.mutateAsync(eventData);
        toast({ title: "Event created successfully" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save event", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await deleteEvent.mutateAsync(id);
      toast({ title: "Event deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">Manage your upcoming events</p>
        </div>
        <Button variant="hero" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : events?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first event to get started.
          </p>
          <Button variant="hero" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events?.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4"
            >
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <h3 className="font-semibold mb-2">{event.name}</h3>
              
              <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}
                </p>
                {event.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </p>
                )}
                {event.capacity && (
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Capacity: {event.capacity}
                  </p>
                )}
              </div>
              
              <p className="text-lg font-bold mb-4">
                {event.ticket_price > 0 ? `₹${event.ticket_price?.toLocaleString()}` : 'Free'}
              </p>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(event)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Venue or Online"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ticket Price (₹)</Label>
                <Input
                  type="number"
                  value={form.ticket_price}
                  onChange={(e) => setForm({ ...form, ticket_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0 for free events"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <Label>Featured Event</Label>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                {editingId ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
