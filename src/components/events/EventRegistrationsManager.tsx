import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, X, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";

interface EventRegistration {
  id: string;
  event_id: string;
  status: string;
  registered_at: string;
  event: {
    name: string;
    event_date: string;
    location: string | null;
    ticket_price: number | null;
  } | null;
  verification_code?: string | null;
}

export function EventRegistrationsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          status,
          registered_at,
          events:event_id (
            name,
            event_date,
            location,
            ticket_price
          )
        `)
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });

      if (error) throw error;

      // Try to fetch verification codes
      const regIds = data?.map(r => r.id) || [];
      let codesMap: Record<string, string> = {};
      
      if (regIds.length > 0) {
        try {
          const { data: codesData } = await (supabase as any)
            .from("event_verification_codes")
            .select("registration_id, code")
            .in("registration_id", regIds);
          
          codesData?.forEach((c: any) => {
            codesMap[c.registration_id] = c.code;
          });
        } catch (e) {
          // Table might not exist, continue without codes
          console.log("Verification codes not available");
        }
      }

      const transformed = data?.map((reg: any) => ({
        id: reg.id,
        event_id: reg.event_id,
        status: reg.status,
        registered_at: reg.registered_at,
        event: reg.events,
        verification_code: codesMap[reg.id] || null,
      })) || [];

      setRegistrations(transformed);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const handleUnregister = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", registrationId);

      if (error) throw error;

      toast({
        title: "Unregistered",
        description: "You have been unregistered from the event.",
      });
      
      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unregister",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Event Registrations</h3>
        <p className="text-muted-foreground">
          You haven't registered for any events yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registrations.map((reg, index) => {
        const eventPast = reg.event?.event_date ? isPast(new Date(reg.event.event_date)) : false;
        
        return (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={eventPast ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{reg.event?.name || "Unknown Event"}</h4>
                      <Badge variant={eventPast ? "secondary" : "default"}>
                        {eventPast ? "Past" : "Upcoming"}
                      </Badge>
                      {reg.status === "registered" && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Registered
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      {reg.event?.event_date && (
                        <>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(reg.event.event_date), "MMMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(reg.event.event_date), "h:mm a")}
                          </span>
                        </>
                      )}
                      {reg.event?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {reg.event.location}
                        </span>
                      )}
                    </div>

                    {/* Verification Code */}
                    {reg.verification_code && !eventPast && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Ticket className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Your Entry Code:</span>
                          <code className="font-mono font-bold text-primary text-lg">
                            {reg.verification_code}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Show this code at the event entrance for verification.
                        </p>
                      </div>
                    )}
                  </div>

                  {!eventPast && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Unregister from Event?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to unregister from "{reg.event?.name}"? 
                            Your spot will be released and you'll need to register again if you change your mind.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleUnregister(reg.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Unregister
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
