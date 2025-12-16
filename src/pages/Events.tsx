import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Filter, ArrowRight, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useEvents } from "@/hooks/useSiteData";
import { format } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const cities = ["All Locations", "Noida", "Delhi", "Gurugram", "Faridabad", "Mumbai", "Bangalore"];
const types = ["All Types", "Conference", "Workshop", "Meetup", "Launch", "Event"];

// Helper to extract type from event name
const getEventType = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("workshop")) return "Workshop";
  if (lowerName.includes("summit") || lowerName.includes("conference")) return "Conference";
  if (lowerName.includes("meetup")) return "Meetup";
  if (lowerName.includes("launch") || lowerName.includes("deployment") || lowerName.includes("first step")) return "Launch";
  return "Event";
};

// Helper to generate tags from event data
const getEventTags = (event: any): string[] => {
  const tags: string[] = [];
  if (event.ticket_price === 0) tags.push("Free Entry");
  if (event.is_featured) tags.push("Featured");
  return tags;
};

// Helper to get event icon based on type
const getEventIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("water") || lowerName.includes("aqua") || lowerName.includes("river")) return "🌊";
  if (lowerName.includes("air") || lowerName.includes("pollution")) return "💨";
  if (lowerName.includes("tech") || lowerName.includes("summit")) return "🎯";
  if (lowerName.includes("workshop") || lowerName.includes("developer")) return "💻";
  if (lowerName.includes("partner") || lowerName.includes("collaborate")) return "🤝";
  if (lowerName.includes("launch")) return "🚀";
  return "📅";
};

export default function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRegistered, registerForEvent, loading: registering } = useEventRegistration();
  const { data: dbEvents, isLoading } = useEvents();
  const [selectedCity, setSelectedCity] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Auto-register after login redirect
  useEffect(() => {
    const pendingEventId = sessionStorage.getItem("pendingEventRegistration");
    if (user && pendingEventId) {
      sessionStorage.removeItem("pendingEventRegistration");
      if (!isRegistered(pendingEventId)) {
        registerForEvent(pendingEventId);
      }
    }
  }, [user, isRegistered, registerForEvent]);

  const filteredEvents = (dbEvents || []).filter((event) => {
    const eventType = getEventType(event.name);
    const cityMatch = selectedCity === "All Locations" || (event.location && event.location.includes(selectedCity));
    const typeMatch = selectedType === "All Types" || eventType === selectedType;
    return cityMatch && typeMatch;
  });

  const handleRegister = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    
    if (!user) {
      sessionStorage.setItem("pendingEventRegistration", eventId);
      navigate("/auth");
      return;
    }

    if (isRegistered(eventId)) {
      return;
    }

    await registerForEvent(eventId);
  };

  const getAvailability = (event: any) => {
    const capacity = event.capacity || 100;
    const registered = 0; // We don't track registered count in DB yet
    const remaining = capacity - registered;
    return { text: `${remaining} spots available`, color: "text-accent" };
  };

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Events & <span className="gradient-text">Explore</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with the ASIREX community at conferences, workshops, and meetups 
              across India.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-44 bg-muted/50">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 bg-muted/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground text-lg">
                {dbEvents?.length === 0 
                  ? "Check back soon for upcoming events." 
                  : "Try adjusting your filters."}
              </p>
            </motion.div>
          )}

          {/* Events List */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const availability = getAvailability(event);
                const eventType = getEventType(event.name);
                const tags = getEventTags(event);
                const icon = getEventIcon(event.name);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`glass-card card-hover overflow-hidden ${event.is_featured ? "ring-1 ring-accent/30" : ""}`}>
                      {event.is_featured && (
                        <div className="bg-gradient-to-r from-accent to-primary px-4 py-1.5">
                          <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                            Featured Event
                          </span>
                        </div>
                      )}
                      <div className="p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Event Icon/Image */}
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                            ) : (
                              icon
                            )}
                          </div>

                          {/* Event Details */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary">
                                {eventType}
                              </span>
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <h3 className="font-display text-xl lg:text-2xl font-semibold mb-3 group-hover:text-accent transition-colors">
                              {event.name}
                            </h3>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(event.event_date), 'MMMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(event.event_date), 'h:mm a')}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </span>
                              )}
                            </div>

                            {event.description && (
                              <p className="text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>

                          {/* Price & CTA */}
                          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2 flex-shrink-0">
                            <div className="text-right">
                              <div className="font-display text-2xl font-bold">
                                {event.ticket_price === 0 ? "Free" : `₹${event.ticket_price?.toLocaleString()}`}
                              </div>
                              <div className={`text-sm ${availability.color}`}>
                                <Users className="w-3 h-3 inline mr-1" />
                                {availability.text}
                              </div>
                            </div>
                            {isRegistered(event.id) ? (
                              <Button 
                                variant="outline" 
                                className="whitespace-nowrap bg-accent/20 border-accent text-accent hover:bg-accent/30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Registered!
                              </Button>
                            ) : (
                              <Button 
                                variant="hero" 
                                className="whitespace-nowrap"
                                onClick={(e) => handleRegister(e, event.id)}
                                disabled={registering}
                              >
                                Register Now
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl glass-card border-border">
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl overflow-hidden">
                    {selectedEvent.image_url ? (
                      <img src={selectedEvent.image_url} alt={selectedEvent.name} className="w-full h-full object-cover" />
                    ) : (
                      getEventIcon(selectedEvent.name)
                    )}
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary">
                      {getEventType(selectedEvent.name)}
                    </span>
                    <DialogTitle className="font-display text-xl lg:text-2xl mt-2">
                      {selectedEvent.name}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Event Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="glass-card p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                    <div className="font-medium">{format(new Date(selectedEvent.event_date), 'MMMM d, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(selectedEvent.event_date), 'h:mm a')}</div>
                  </div>
                  <div className="glass-card p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{selectedEvent.location || "TBA"}</div>
                  </div>
                </div>

                {selectedEvent.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedEvent.description}
                  </p>
                )}

                {/* Capacity */}
                {selectedEvent.capacity && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{selectedEvent.capacity} attendees</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent w-1/4 rounded-full" />
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {getEventTags(selectedEvent).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-sm rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price & Register */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Ticket Price</div>
                    <div className="font-display text-3xl font-bold">
                      {selectedEvent.ticket_price === 0 ? "Free" : `₹${selectedEvent.ticket_price?.toLocaleString()}`}
                    </div>
                  </div>
                  {isRegistered(selectedEvent.id) ? (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-accent/20 border-accent text-accent hover:bg-accent/30"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      You're Registered!
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      size="lg"
                      onClick={(e) => handleRegister(e, selectedEvent.id)}
                      disabled={registering}
                    >
                      Register Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}