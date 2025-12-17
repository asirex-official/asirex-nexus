import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Hook to update team member's last_seen status
export function useTeamMemberPresence() {
  const { user } = useAuth();

  const updateLastSeen = useCallback(async () => {
    if (!user?.email) return;

    try {
      await supabase
        .from("team_members")
        .update({ last_seen: new Date().toISOString() })
        .eq("email", user.email);
    } catch (error) {
      // Silently fail - presence update is not critical
      console.error("Error updating last_seen:", error);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    // Update immediately on mount
    updateLastSeen();

    // Update every minute while active
    const interval = setInterval(updateLastSeen, 60000);

    // Update on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateLastSeen();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Update on user activity
    const handleActivity = () => {
      updateLastSeen();
    };
    window.addEventListener("focus", handleActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleActivity);
    };
  }, [user?.email, updateLastSeen]);

  return { updateLastSeen };
}
