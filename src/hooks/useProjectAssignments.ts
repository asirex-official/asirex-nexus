import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface ProjectAssignment {
  id: string;
  project_id: string;
  team_member_id: string;
  role: string | null;
  assigned_at: string;
  assigned_by: string | null;
  team_member?: {
    id: string;
    name: string;
    email: string;
    role: string;
    designation: string | null;
    profile_image: string | null;
  };
  project?: {
    id: string;
    title: string;
    status: string | null;
    progress_percentage: number | null;
  };
}

// Get all assignments for a specific project
export function useProjectAssignments(projectId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["project-assignments", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          id,
          project_id,
          team_member_id,
          role,
          assigned_at,
          assigned_by,
          team_members!project_assignments_team_member_id_fkey (
            id,
            name,
            email,
            role,
            designation,
            profile_image
          )
        `)
        .eq("project_id", projectId)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        team_member: item.team_members,
      })) as ProjectAssignment[];
    },
    enabled: !!projectId,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-assignments-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_assignments",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project-assignments", projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return query;
}

// Get all assignments for a specific team member
export function useMemberAssignments(memberId: string | null) {
  return useQuery({
    queryKey: ["member-assignments", memberId],
    queryFn: async () => {
      if (!memberId) return [];
      
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          id,
          project_id,
          team_member_id,
          role,
          assigned_at,
          assigned_by,
          projects!project_assignments_project_id_fkey (
            id,
            title,
            status,
            progress_percentage
          )
        `)
        .eq("team_member_id", memberId)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        project: item.projects,
      })) as ProjectAssignment[];
    },
    enabled: !!memberId,
  });
}

// Assign team member to project
export function useAssignToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      teamMemberId,
      role = "member",
    }: {
      projectId: string;
      teamMemberId: string;
      role?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("project_assignments")
        .insert({
          project_id: projectId,
          team_member_id: teamMemberId,
          role,
          assigned_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["member-assignments", variables.teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["project-assignments-all"] });
    },
  });
}

// Remove team member from project
export function useUnassignFromProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      teamMemberId,
    }: {
      projectId: string;
      teamMemberId: string;
    }) => {
      const { error } = await supabase
        .from("project_assignments")
        .delete()
        .eq("project_id", projectId)
        .eq("team_member_id", teamMemberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["member-assignments", variables.teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["project-assignments-all"] });
    },
  });
}

// Update team member role in project (promote/demote lead)
export function useUpdateProjectRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      teamMemberId,
      role,
    }: {
      projectId: string;
      teamMemberId: string;
      role: string;
    }) => {
      const { error } = await supabase
        .from("project_assignments")
        .update({ role })
        .eq("project_id", projectId)
        .eq("team_member_id", teamMemberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-assignments", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["member-assignments", variables.teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["project-assignments-all"] });
    },
  });
}

// Get all project assignments (for overview)
export function useAllProjectAssignments() {
  return useQuery({
    queryKey: ["project-assignments-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          id,
          project_id,
          team_member_id,
          role,
          assigned_at,
          team_members!project_assignments_team_member_id_fkey (
            id,
            name,
            profile_image
          ),
          projects!project_assignments_project_id_fkey (
            id,
            title,
            status
          )
        `)
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
