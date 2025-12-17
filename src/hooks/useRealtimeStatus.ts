import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface TeamMemberStatus {
  id: string;
  name: string;
  status: string;
  last_seen: string | null;
  profile_image: string | null;
  department: string | null;
  role: string;
}

export function useRealtimeTeamStatus() {
  const [teamStatus, setTeamStatus] = useState<TeamMemberStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchTeamStatus = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, status, last_seen, profile_image, department, role")
        .eq("status", "active")
        .order("last_seen", { ascending: false, nullsFirst: false });

      if (!error && data) {
        setTeamStatus(data);
      }
      setIsLoading(false);
    };

    fetchTeamStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("team-status-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_members",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setTeamStatus((prev) =>
              prev.map((member) =>
                member.id === (payload.new as TeamMemberStatus).id
                  ? { ...member, ...(payload.new as TeamMemberStatus) }
                  : member
              )
            );
          } else if (payload.eventType === "INSERT") {
            const newMember = payload.new as TeamMemberStatus;
            if (newMember.status === "active") {
              setTeamStatus((prev) => [newMember, ...prev]);
            }
          } else if (payload.eventType === "DELETE") {
            setTeamStatus((prev) =>
              prev.filter((member) => member.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return { status: "offline", color: "bg-gray-400" };
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

    if (diffMinutes < 5) return { status: "online", color: "bg-green-500" };
    if (diffMinutes < 30) return { status: "away", color: "bg-yellow-500" };
    return { status: "offline", color: "bg-gray-400" };
  };

  const onlineCount = teamStatus.filter(
    (m) => getOnlineStatus(m.last_seen).status === "online"
  ).length;

  const awayCount = teamStatus.filter(
    (m) => getOnlineStatus(m.last_seen).status === "away"
  ).length;

  const offlineCount = teamStatus.filter(
    (m) => getOnlineStatus(m.last_seen).status === "offline"
  ).length;

  return {
    teamStatus,
    isLoading,
    getOnlineStatus,
    onlineCount,
    awayCount,
    offlineCount,
    totalCount: teamStatus.length,
  };
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as any, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recalculate unread
          setNotifications((prev) => {
            setUnreadCount(prev.filter((n) => !n.is_read).length);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (!error) {
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
