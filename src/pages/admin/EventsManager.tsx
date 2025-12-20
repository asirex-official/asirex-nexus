import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Star, Ticket, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MediaUploader } from "@/components/admin/MediaUploader";

const eventTypes = ["Launch", "Conference", "Workshop", "Summit", "Meetup", "Event"];

interface EventForm {
  name: string;
  description: string;
  event_date: string;
  location: string;
  ticket_price: number;
  image_url: string;
  capacity: number;
  is_featured: boolean;
  type: string;
  gallery_images: string[];
  gallery_videos: string[];
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
  type: "Event",
  gallery_images: [],
  gallery_videos: [],
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreateDialog = () => {
    setForm(defaultForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: any) => {
    const galleryImages = Array.isArray(event.gallery_images) ? event.gallery_images : [];
    const galleryVideos = Array.isArray(event.gallery_videos) ? event.gallery_videos : [];
    setForm({
      name: event.name,
      description: event.description || "",
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      ticket_price: event.ticket_price || 0,
      image_url: event.image_url || "",
      capacity: event.capacity || 100,
      is_featured: event.is_featured || false,
      type: event.type || "Event",
      gallery_images: galleryImages,
      gallery_videos: galleryVideos,
    });
    setEditingId(event.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use first gallery image as main image if not set
      const image_url = form.image_url || form.gallery_images[0] || "";
      
      const eventData = {
        ...form,
        event_date: new Date(form.event_date).toISOString(),
        image_url,
        gallery_images: form.gallery_images,
        gallery_videos: form.gallery_videos,
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

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteEvent.mutateAsync(deleteId);
      toast({ title: "Event deleted successfully" });
      setDeleteId(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Launch": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Conference": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Workshop": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Summit": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Meetup": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default: return "bg-muted text-muted-foreground";
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
              className="glass-card p-4 relative"
            >
              {/* Featured Badge */}
              {event.is_featured && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Event Image/Icon */}
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

              {/* Type Badge */}
              <Badge className={`mb-2 ${getTypeColor((event as any).type || 'Event')}`}>
                {(event as any).type || 'Event'}
              </Badge>
              
              <h3 className="font-semibold mb-2 line-clamp-2">{event.name}</h3>
              
              <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}
                </p>
                {event.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </p>
                )}
                {event.capacity && (
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    Capacity: {event.capacity}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="w-4 h-4 text-accent" />
                <span className="text-lg font-bold">
                  {event.ticket_price > 0 ? `₹${event.ticket_price?.toLocaleString()}` : 'Free'}
                </span>
              </div>
              
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
                  onClick={() => setDeleteId(event.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Event Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select 
                  value={form.type} 
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Event Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe your event..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City, Venue or Online"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 100 })}
                  placeholder="Number of attendees"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ticket Price (₹)</Label>
              <Input
                type="number"
                value={form.ticket_price}
                onChange={(e) => setForm({ ...form, ticket_price: parseFloat(e.target.value) || 0 })}
                placeholder="0 for free events"
              />
            </div>

            {/* Media Upload Section */}
            <div className="space-y-3 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Event Media</h3>
              </div>
              <MediaUploader
                images={form.gallery_images}
                videos={form.gallery_videos}
                onImagesChange={(images) => setForm({ ...form, gallery_images: images })}
                onVideosChange={(videos) => setForm({ ...form, gallery_videos: videos })}
                maxImages={10}
                maxVideos={2}
                folder="events"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-base">Featured Event</Label>
                <p className="text-sm text-muted-foreground">Show this event prominently on the events page</p>
              </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event and remove it from the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}