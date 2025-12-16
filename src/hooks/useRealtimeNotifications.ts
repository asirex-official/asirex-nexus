import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "order" | "task" | "meeting" | "notice";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    const [ordersRes, tasksRes, meetingsRes, noticesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("meetings").select("*").eq("status", "scheduled").order("meeting_date", { ascending: true }).limit(10),
      supabase.from("notices").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(10),
    ]);

    if (!ordersRes.error) setOrders(ordersRes.data || []);
    if (!tasksRes.error) setTasks(tasksRes.data || []);
    if (!meetingsRes.error) setMeetings(meetingsRes.data || []);
    if (!noticesRes.error) setNotices(noticesRes.data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchInitialData();

    // Real-time subscription for orders
    const ordersChannel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;
          setOrders((prev) => [newOrder, ...prev].slice(0, 20));
          
          const notification: Notification = {
            id: `order-${newOrder.id}`,
            type: "order",
            title: "New Order Received!",
            message: `Order from ${newOrder.customer_name} - ₹${newOrder.total_amount}`,
            timestamp: new Date(),
            read: false,
            data: newOrder,
          };
          setNotifications((prev) => [notification, ...prev]);
          
          toast.success("New Order!", {
            description: `${newOrder.customer_name} placed an order for ₹${newOrder.total_amount}`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? payload.new : o))
          );
        }
      )
      .subscribe();

    // Real-time subscription for tasks
    const tasksChannel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const newTask = payload.new as any;
          setTasks((prev) => [newTask, ...prev].slice(0, 20));
          
          const notification: Notification = {
            id: `task-${newTask.id}`,
            type: "task",
            title: "New Task Assigned!",
            message: newTask.title,
            timestamp: new Date(),
            read: false,
            data: newTask,
          };
          setNotifications((prev) => [notification, ...prev]);
          
          toast.info("New Task Assigned!", {
            description: newTask.title,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === payload.new.id ? payload.new : t))
          );
        }
      )
      .subscribe();

    // Real-time subscription for meetings
    const meetingsChannel = supabase
      .channel("meetings-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "meetings" },
        (payload) => {
          const newMeeting = payload.new as any;
          setMeetings((prev) => [newMeeting, ...prev].slice(0, 10));
          
          const notification: Notification = {
            id: `meeting-${newMeeting.id}`,
            type: "meeting",
            title: "New Meeting Scheduled!",
            message: `${newMeeting.title} on ${new Date(newMeeting.meeting_date).toLocaleDateString()}`,
            timestamp: new Date(),
            read: false,
            data: newMeeting,
          };
          setNotifications((prev) => [notification, ...prev]);
          
          toast.info("New Meeting!", {
            description: newMeeting.title,
          });
        }
      )
      .subscribe();

    // Real-time subscription for notices
    const noticesChannel = supabase
      .channel("notices-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notices" },
        (payload) => {
          const newNotice = payload.new as any;
          setNotices((prev) => [newNotice, ...prev].slice(0, 10));
          
          const notification: Notification = {
            id: `notice-${newNotice.id}`,
            type: "notice",
            title: "New Notice!",
            message: newNotice.title,
            timestamp: new Date(),
            read: false,
            data: newNotice,
          };
          setNotifications((prev) => [notification, ...prev]);
          
          toast.warning("New Notice!", {
            description: newNotice.title,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(meetingsChannel);
      supabase.removeChannel(noticesChannel);
    };
  }, [fetchInitialData]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    orders,
    tasks,
    meetings,
    notices,
    isLoading,
    unreadCount,
    markAsRead,
    clearNotifications,
    refetch: fetchInitialData,
  };
};
