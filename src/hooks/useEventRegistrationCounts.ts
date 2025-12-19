import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EventRegistrationCount {
  event_id: string;
  count: number;
}

export function useEventRegistrationCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("event_id");

      if (error) throw error;

      // Count registrations per event
      const countMap: Record<string, number> = {};
      data?.forEach((reg) => {
        countMap[reg.event_id] = (countMap[reg.event_id] || 0) + 1;
      });
      
      setCounts(countMap);
    } catch (error) {
      console.error("Error fetching registration counts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('event-registrations-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations'
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCounts]);

  const getCount = useCallback((eventId: string): number => {
    return counts[eventId] || 0;
  }, [counts]);

  return {
    counts,
    loading,
    getCount,
    refetch: fetchCounts
  };
}
