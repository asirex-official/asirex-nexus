import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveFestivalCampaign {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  banner_message: string | null;
  banner_color: string | null;
  festival_theme: string | null;
  notify_users: boolean;
  notify_email: boolean;
  applies_to: string;
  target_categories: string[];
  target_product_ids: string[];
}

export function useActiveFestival() {
  return useQuery({
    queryKey: ["active-festival-campaign"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      // First try to get a festival-themed campaign
      const { data: festivalData, error: festivalError } = await supabase
        .from("sales_campaigns")
        .select("*")
        .eq("is_active", true)
        .not("festival_theme", "is", null)
        .lte("start_date", now)
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("discount_value", { ascending: false })
        .limit(1);
      
      if (festivalError) throw festivalError;
      
      // If we have a festival campaign, return it
      if (festivalData && festivalData.length > 0) {
        const campaign = festivalData[0];
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          discount_type: campaign.discount_type,
          discount_value: campaign.discount_value,
          max_discount_amount: campaign.max_discount_amount,
          banner_message: campaign.banner_message,
          banner_color: campaign.banner_color,
          festival_theme: campaign.festival_theme,
          notify_users: campaign.notify_users || false,
          notify_email: campaign.notify_email || false,
          applies_to: campaign.applies_to || "all",
          target_categories: (campaign.target_categories as string[]) || [],
          target_product_ids: (campaign.target_product_ids as string[]) || [],
        } as ActiveFestivalCampaign;
      }
      
      // Otherwise get any active sale campaign
      const { data: saleData, error: saleError } = await supabase
        .from("sales_campaigns")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("discount_value", { ascending: false })
        .limit(1);
      
      if (saleError) throw saleError;
      
      if (saleData && saleData.length > 0) {
        const campaign = saleData[0];
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          discount_type: campaign.discount_type,
          discount_value: campaign.discount_value,
          max_discount_amount: campaign.max_discount_amount,
          banner_message: campaign.banner_message,
          banner_color: campaign.banner_color,
          festival_theme: campaign.festival_theme,
          notify_users: campaign.notify_users || false,
          notify_email: campaign.notify_email || false,
          applies_to: campaign.applies_to || "all",
          target_categories: (campaign.target_categories as string[]) || [],
          target_product_ids: (campaign.target_product_ids as string[]) || [],
        } as ActiveFestivalCampaign;
      }
      
      return null;
    },
    staleTime: 60000, // Cache for 1 minute
  });
}
