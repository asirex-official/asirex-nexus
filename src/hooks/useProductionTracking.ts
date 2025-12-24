import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductionRecord {
  id: string;
  date: string;
  team_member_id: string | null;
  products_in_production: number;
  products_completed: number;
  products_shipped: number;
  unit_price: number;
  total_earnings: number;
  pending_earnings: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionStats {
  totalInProduction: number;
  totalCompleted: number;
  totalShipped: number;
  totalEarnings: number;
  pendingEarnings: number;
  todayCompleted: number;
  todayShipped: number;
}

export function useProductionTracking(teamMemberId?: string) {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ["production-tracking", teamMemberId],
    queryFn: async () => {
      let query = supabase
        .from("production_tracking")
        .select("*")
        .order("date", { ascending: false });

      if (teamMemberId) {
        query = query.eq("team_member_id", teamMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ProductionRecord[];
    },
  });

  const stats: ProductionStats = records.reduce((acc, record) => {
    const isToday = new Date(record.date).toDateString() === new Date().toDateString();
    return {
      totalInProduction: acc.totalInProduction + record.products_in_production,
      totalCompleted: acc.totalCompleted + record.products_completed,
      totalShipped: acc.totalShipped + record.products_shipped,
      totalEarnings: acc.totalEarnings + record.total_earnings,
      pendingEarnings: acc.pendingEarnings + record.pending_earnings,
      todayCompleted: isToday ? acc.todayCompleted + record.products_completed : acc.todayCompleted,
      todayShipped: isToday ? acc.todayShipped + record.products_shipped : acc.todayShipped,
    };
  }, {
    totalInProduction: 0,
    totalCompleted: 0,
    totalShipped: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    todayCompleted: 0,
    todayShipped: 0,
  });

  const addRecord = useMutation({
    mutationFn: async (data: Partial<ProductionRecord>) => {
      const { error } = await supabase
        .from("production_tracking")
        .insert({
          team_member_id: data.team_member_id,
          products_in_production: data.products_in_production || 0,
          products_completed: data.products_completed || 0,
          products_shipped: data.products_shipped || 0,
          unit_price: data.unit_price || 50,
          notes: data.notes,
          date: data.date || new Date().toISOString().split("T")[0],
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-tracking"] });
      toast.success("Production record added");
    },
    onError: (error: Error) => {
      toast.error("Failed to add record: " + error.message);
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProductionRecord> & { id: string }) => {
      const { error } = await supabase
        .from("production_tracking")
        .update({
          products_in_production: data.products_in_production,
          products_completed: data.products_completed,
          products_shipped: data.products_shipped,
          unit_price: data.unit_price,
          notes: data.notes,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-tracking"] });
      toast.success("Production record updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update record: " + error.message);
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("production_tracking")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-tracking"] });
      toast.success("Record deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  return {
    records,
    stats,
    isLoading,
    refetch,
    addRecord,
    updateRecord,
    deleteRecord,
  };
}

export function useAllProductionStats() {
  return useQuery({
    queryKey: ["all-production-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_tracking")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      const records = (data || []) as ProductionRecord[];
      const today = new Date().toDateString();
      
      return {
        records,
        stats: records.reduce((acc, record) => {
          const isToday = new Date(record.date).toDateString() === today;
          return {
            totalInProduction: acc.totalInProduction + record.products_in_production,
            totalCompleted: acc.totalCompleted + record.products_completed,
            totalShipped: acc.totalShipped + record.products_shipped,
            totalEarnings: acc.totalEarnings + record.total_earnings,
            pendingEarnings: acc.pendingEarnings + record.pending_earnings,
            todayCompleted: isToday ? acc.todayCompleted + record.products_completed : acc.todayCompleted,
            todayShipped: isToday ? acc.todayShipped + record.products_shipped : acc.todayShipped,
          };
        }, {
          totalInProduction: 0,
          totalCompleted: 0,
          totalShipped: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          todayCompleted: 0,
          todayShipped: 0,
        } as ProductionStats),
      };
    },
  });
}
