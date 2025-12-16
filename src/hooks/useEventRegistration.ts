import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface EventRegistration {
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
}

export function useEventRegistration() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    if (!user) {
      setRegistrations([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const isRegistered = useCallback((eventId: string): boolean => {
    return registrations.some(reg => reg.event_id === eventId);
  }, [registrations]);

  const registerForEvent = async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: "registered"
        });

      if (error) throw error;

      toast.success("Successfully registered for the event!");
      await fetchRegistrations();
      return true;
    } catch (error: any) {
      console.error("Error registering:", error);
      toast.error(error.message || "Failed to register");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unregisterFromEvent = async (eventId: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Successfully unregistered from the event");
      await fetchRegistrations();
      return true;
    } catch (error: any) {
      console.error("Error unregistering:", error);
      toast.error(error.message || "Failed to unregister");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registrations,
    loading,
    isRegistered,
    registerForEvent,
    unregisterFromEvent,
    refetch: fetchRegistrations
  };
}
