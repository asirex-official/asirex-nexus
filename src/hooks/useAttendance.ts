import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AttendanceRecord {
  id: string;
  team_member_id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  break_start: string | null;
  break_end: string | null;
  total_hours: number | null;
  status: "clocked_in" | "on_break" | "clocked_out";
  notes: string | null;
  created_at: string;
  team_member?: {
    name: string;
    department: string | null;
    profile_image: string | null;
  };
}

export function useAttendance(teamMemberId?: string) {
  return useQuery({
    queryKey: ["attendance", teamMemberId],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select(`
          *,
          team_member:team_members(name, department, profile_image)
        `)
        .order("clock_in", { ascending: false });

      if (teamMemberId) {
        query = query.eq("team_member_id", teamMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });
}

export function useTodayAttendance() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["attendance-today", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get team member for this user
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!teamMember) return null;

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("team_member_id", teamMember.id)
        .gte("clock_in", `${today}T00:00:00`)
        .lte("clock_in", `${today}T23:59:59`)
        .order("clock_in", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AttendanceRecord | null;
    },
    enabled: !!user?.id,
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get team member
      const { data: teamMember, error: tmError } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (tmError || !teamMember) throw new Error("Team member not found");

      const { data, error } = await supabase
        .from("attendance")
        .insert({
          team_member_id: teamMember.id,
          user_id: user.id,
          clock_in: new Date().toISOString(),
          status: "clocked_in",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const clockOut = new Date().toISOString();

      // Get the attendance record to calculate hours
      const { data: record } = await supabase
        .from("attendance")
        .select("clock_in, break_start, break_end")
        .eq("id", attendanceId)
        .single();

      let totalHours = 0;
      if (record) {
        const clockIn = new Date(record.clock_in);
        const clockOutDate = new Date(clockOut);
        totalHours = (clockOutDate.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

        // Subtract break time if applicable
        if (record.break_start && record.break_end) {
          const breakStart = new Date(record.break_start);
          const breakEnd = new Date(record.break_end);
          const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
          totalHours -= breakHours;
        }
      }

      const { data, error } = await supabase
        .from("attendance")
        .update({
          clock_out: clockOut,
          status: "clocked_out",
          total_hours: Math.round(totalHours * 100) / 100,
        })
        .eq("id", attendanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
}

export function useStartBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const { data, error } = await supabase
        .from("attendance")
        .update({
          break_start: new Date().toISOString(),
          status: "on_break",
        })
        .eq("id", attendanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
}

export function useEndBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const { data, error } = await supabase
        .from("attendance")
        .update({
          break_end: new Date().toISOString(),
          status: "clocked_in",
        })
        .eq("id", attendanceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
}

export function useAllTodayAttendance() {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["attendance-all-today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          team_member:team_members(name, department, profile_image, role)
        `)
        .gte("clock_in", `${today}T00:00:00`)
        .lte("clock_in", `${today}T23:59:59`)
        .order("clock_in", { ascending: false });

      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });
}
