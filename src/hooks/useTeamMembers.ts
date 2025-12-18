import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  serial_number: string | null;
  is_core_pillar: boolean | null;
  profile_image: string | null;
  status: string | null;
  hired_at: string | null;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members_public")
        .select("*")
        .eq("status", "active")
        .order("hired_at", { ascending: true });

      if (error) throw error;
      return data as TeamMemberData[];
    },
  });
}

export function useCorePillars() {
  return useQuery({
    queryKey: ["core-pillars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members_public")
        .select("*")
        .eq("status", "active")
        .eq("is_core_pillar", true)
        .order("hired_at", { ascending: true });

      if (error) throw error;
      return data as TeamMemberData[];
    },
  });
}

// Helper to map team members to login card format
export function mapTeamMemberToLoginCard(member: TeamMemberData) {
  return {
    id: member.serial_number || `ASX-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    title: member.designation || member.role,
    name: member.name,
    email: member.email,
    coreType: member.is_core_pillar ? "Core Pillar" : "Team Member",
    department: member.department || "General",
    isHired: true,
    photoUrl: member.profile_image,
  };
}
