import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Public team member data (no email - for public display)
export interface TeamMemberPublicData {
  id: string;
  name: string;
  role: string;
  department: string | null;
  designation: string | null;
  serial_number: string | null;
  is_core_pillar: boolean | null;
  profile_image: string | null;
  status: string | null;
  hired_at: string | null;
  created_at: string | null;
}

// Full team member data (with email - for admin use)
export interface TeamMemberData extends TeamMemberPublicData {
  email: string;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members_public")
        .select("*")
        .eq("status", "active")
        .order("hired_at", { ascending: true });

      if (error) throw error;
      return data as TeamMemberPublicData[];
    },
  });
}

export function useCorePillars() {
  return useQuery({
    queryKey: ["core-pillars-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members_public")
        .select("*")
        .eq("status", "active")
        .eq("is_core_pillar", true)
        .order("hired_at", { ascending: true });

      if (error) throw error;
      return data as TeamMemberPublicData[];
    },
  });
}

// Admin-only: fetch team members with emails
export function useTeamMembersAdmin() {
  return useQuery({
    queryKey: ["team-members-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, email, role, department, designation, serial_number, is_core_pillar, profile_image, status, hired_at, created_at")
        .eq("status", "active")
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
