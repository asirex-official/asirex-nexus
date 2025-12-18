import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface PageContent {
  id: string;
  page_key: string;
  page_title: string;
  page_subtitle: string | null;
  hero_icon: string | null;
  content: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePageContent(pageKey?: string) {
  return useQuery({
    queryKey: ["page-content", pageKey],
    queryFn: async () => {
      if (pageKey) {
        const { data, error } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_key", pageKey)
          .maybeSingle();
        if (error) throw error;
        return data as PageContent | null;
      } else {
        const { data, error } = await supabase
          .from("page_content")
          .select("*")
          .order("page_key");
        if (error) throw error;
        return data as PageContent[];
      }
    },
  });
}

export function useAllPageContent() {
  return useQuery({
    queryKey: ["page-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("page_key");
      if (error) throw error;
      return data as PageContent[];
    },
  });
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      page_title, 
      page_subtitle, 
      hero_icon, 
      content,
      is_active 
    }: { 
      id: string; 
      page_title?: string;
      page_subtitle?: string;
      hero_icon?: string;
      content?: Record<string, unknown>;
      is_active?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (page_title !== undefined) updates.page_title = page_title;
      if (page_subtitle !== undefined) updates.page_subtitle = page_subtitle;
      if (hero_icon !== undefined) updates.hero_icon = hero_icon;
      if (content !== undefined) updates.content = content;
      if (is_active !== undefined) updates.is_active = is_active;
      
      const { error } = await supabase
        .from("page_content")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
  });
}

export function useCreatePageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      page_key: string;
      page_title: string;
      page_subtitle?: string;
      hero_icon?: string;
      content?: Json;
    }) => {
      const { error } = await supabase
        .from("page_content")
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
  });
}

export function useDeletePageContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("page_content")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
    },
  });
}
