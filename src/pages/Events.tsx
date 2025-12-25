import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Filter, ArrowRight, CheckCircle, XCircle, PartyPopper } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useEventRegistrationCounts } from "@/hooks/useEventRegistrationCounts";
import { useEvents } from "@/hooks/useSiteData";
import { format } from "date-fns";
import { toast } from "sonner";
import { PaidEventRegistrationDialog } from "@/components/events/PaidEventRegistrationDialog";

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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isRegistered, registerForEvent, unregisterFromEvent, loading: registering, refetch } = useEventRegistration();
  const { getCount } = useEventRegistrationCounts();
  const { data: dbEvents, isLoading, refetch: refetchEvents } = useEvents();
  const [selectedCity, setSelectedCity] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [paidEventDialog, setPaidEventDialog] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successVerificationCode, setSuccessVerificationCode] = useState<string | null>(null);

  // Handle payment callback
  useEffect(() => {
    const status = searchParams.get("status");
    const eventId = searchParams.get("event_id");
    const verificationCode = searchParams.get("verification_code");
    const message = searchParams.get("message");

    if (status === "success" && eventId) {
      setSuccessVerificationCode(verificationCode);
      setShowSuccessModal(true);
      refetch();
      refetchEvents();
      // Clear URL params
      window.history.replaceState({}, "", "/events");
    } else if (status === "failed" && eventId) {
      toast.error(message || "Payment failed. Please try again.");
      window.history.replaceState({}, "", "/events");
    } else if (status === "error") {
      toast.error(message || "Something went wrong. Please try again.");
      window.history.replaceState({}, "", "/events");
    }
  }, [searchParams, refetch, refetchEvents]);

  // Auto-register after login redirect (only for free events)
  useEffect(() => {
    const pendingEventId = sessionStorage.getItem("pendingEventRegistration");
    if (user && pendingEventId) {
      sessionStorage.removeItem("pendingEventRegistration");
      // Find the event to check if it's paid
      const event = dbEvents?.find((e: any) => e.id === pendingEventId);
      if (event && event.ticket_price > 0) {
        // Open paid registration dialog
        setPaidEventDialog(event);
      } else if (!isRegistered(pendingEventId)) {
        registerForEvent(pendingEventId);
      }
    }
  }, [user, isRegistered, registerForEvent, dbEvents]);

  const filteredEvents = (dbEvents || []).filter((event: any) => {
    const eventType = event.type || getEventType(event.name);
    const cityMatch = selectedCity === "All Locations" || (event.location && event.location.includes(selectedCity));
    const typeMatch = selectedType === "All Types" || eventType === selectedType;
    return cityMatch && typeMatch;
  });

  const handleRegister = async (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    
    if (!user) {
      sessionStorage.setItem("pendingEventRegistration", event.id);
      navigate("/auth");
      return;
    }

    if (isRegistered(event.id)) {
      return;
    }

    // Check if it's a paid event
    if (event.ticket_price > 0) {
      setPaidEventDialog(event);
      setSelectedEvent(null); // Close the detail modal if open
      return;
    }

    // Free event - register directly
    await registerForEvent(event.id);
  };

  const getAvailability = (event: any) => {
    const capacity = event.capacity || 100;
    const registered = getCount(event.id);
    const remaining = Math.max(0, capacity - registered);
    const percentFull = Math.min(100, (registered / capacity) * 100);
    
    if (remaining === 0) {
      return { text: "Sold Out!", color: "text-destructive", remaining: 0, percentFull, isFull: true };
    } else if (remaining <= 10) {
      return { text: `Only ${remaining} spots left!`, color: "text-orange-500", remaining, percentFull, isFull: false };
    } else if (remaining <= 25) {
      return { text: `${remaining} spots left`, color: "text-yellow-500", remaining, percentFull, isFull: false };
    }
    return { text: `${remaining} spots available`, color: "text-accent", remaining, percentFull, isFull: false };
  };

  const handleUnregister = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    await unregisterFromEvent(eventId);
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
              {filteredEvents.map((event: any, index) => {
                const availability = getAvailability(event);
                const eventType = event.type || getEventType(event.name);
                const tags = getEventTags(event);
                const icon = getEventIcon(event.name);
                const isPaidEvent = event.ticket_price > 0;
                
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
                              {isPaidEvent && (
                                <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary font-medium">
                                  Paid Event
                                </span>
                              )}
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
                          <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[140px]">
                            <div className="text-right">
                              <div className="font-display text-xl sm:text-2xl font-bold">
                                {event.ticket_price === 0 ? "Free" : `₹${event.ticket_price?.toLocaleString()}`}
                              </div>
                              <div className={`text-xs sm:text-sm ${availability.color} flex items-center justify-end gap-1`}>
                                <Users className="w-3 h-3" />
                                {availability.text}
                              </div>
                            </div>
                            
                            {/* Capacity Progress Bar */}
                            {event.capacity && (
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    availability.isFull 
                                      ? "bg-destructive" 
                                      : availability.percentFull > 75 
                                        ? "bg-orange-500" 
                                        : "bg-accent"
                                  }`}
                                  style={{ width: `${availability.percentFull}%` }}
                                />
                              </div>
                            )}
                            
                            {isRegistered(event.id) ? (
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="bg-accent/20 border-accent text-accent hover:bg-accent/30 text-xs sm:text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Registered
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs sm:text-sm"
                                  onClick={(e) => handleUnregister(e, event.id)}
                                  disabled={registering}
                                >
                                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            ) : availability.isFull ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive border-destructive/50 cursor-not-allowed text-xs sm:text-sm"
                                disabled
                              >
                                Sold Out
                              </Button>
                            ) : (
                              <Button 
                                variant="hero" 
                                size="sm"
                                className="text-xs sm:text-sm"
                                onClick={(e) => handleRegister(e, event)}
                                disabled={registering}
                              >
                                {isPaidEvent ? "Buy Ticket" : "Register"}
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
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
                    <div className="flex gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/20 text-secondary">
                        {selectedEvent.type || getEventType(selectedEvent.name)}
                      </span>
                      {selectedEvent.ticket_price > 0 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                          Paid Event
                        </span>
                      )}
                    </div>
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
                {selectedEvent.capacity && (() => {
                  const modalAvailability = getAvailability(selectedEvent);
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className={`font-medium ${modalAvailability.color}`}>
                          {getCount(selectedEvent.id)}/{selectedEvent.capacity} registered
                          {modalAvailability.isFull && " (Sold Out!)"}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            modalAvailability.isFull 
                              ? "bg-destructive" 
                              : modalAvailability.percentFull > 75 
                                ? "bg-orange-500" 
                                : "bg-gradient-to-r from-primary to-accent"
                          }`}
                          style={{ width: `${modalAvailability.percentFull}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {modalAvailability.remaining} spots remaining
                      </div>
                    </div>
                  );
                })()}

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
                  {(() => {
                    const modalAvailability = getAvailability(selectedEvent);
                    const isPaidEvent = selectedEvent.ticket_price > 0;
                    
                    if (isRegistered(selectedEvent.id)) {
                      return (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className="bg-accent/20 border-accent text-accent hover:bg-accent/30"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Registered!
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="lg"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleUnregister(e, selectedEvent.id)}
                            disabled={registering}
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      );
                    } else if (modalAvailability.isFull) {
                      return (
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="text-destructive border-destructive/50 cursor-not-allowed"
                          disabled
                        >
                          Sold Out
                        </Button>
                      );
                    } else {
                      return (
                        <Button 
                          variant="hero" 
                          size="lg"
                          onClick={(e) => handleRegister(e, selectedEvent)}
                          disabled={registering}
                        >
                          {isPaidEvent ? "Buy Ticket" : "Register Now"}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      );
                    }
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Paid Event Registration Dialog */}
      {paidEventDialog && (
        <PaidEventRegistrationDialog
          open={!!paidEventDialog}
          onOpenChange={(open) => !open && setPaidEventDialog(null)}
          event={paidEventDialog}
          onSuccess={() => {
            refetch();
            refetchEvents();
          }}
        />
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md glass-card border-border text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-accent" />
            </div>
            <DialogTitle className="font-display text-2xl mb-4">
              Registration Successful! 🎉
            </DialogTitle>
            <p className="text-muted-foreground mb-4">
              You're all set! We'll send you event details via email and call you a day before the event.
            </p>
            {successVerificationCode && (
              <div className="glass-card p-4 bg-accent/10 border border-accent/20 mb-6">
                <div className="text-sm text-muted-foreground mb-1">Your Verification Code</div>
                <div className="font-mono text-2xl font-bold text-accent tracking-widest">
                  {successVerificationCode}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Show this code at the event entrance
                </p>
              </div>
            )}
            <Button variant="hero" className="w-full" onClick={() => setShowSuccessModal(false)}>
              Got it!
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}