import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveSaleCampaign {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  max_orders: number | null;
  current_orders: number;
  banner_message: string | null;
  banner_color: string | null;
  applies_to: string;
  target_categories: string[];
  target_product_ids: string[];
}

export function useActiveSalesCampaigns() {
  return useQuery({
    queryKey: ["active-sales-campaigns"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("sales_campaigns")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .or(`end_date.is.null,end_date.gt.${now}`)
        .order("discount_value", { ascending: false });
      
      if (error) throw error;
      
      // Filter out campaigns that hit max orders
      return (data || []).filter(campaign => 
        !campaign.max_orders || campaign.current_orders < campaign.max_orders
      ) as ActiveSaleCampaign[];
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function calculateSaleDiscount(
  campaigns: ActiveSaleCampaign[],
  orderAmount: number,
  productCategories?: string[],
  productIds?: string[]
): { campaign: ActiveSaleCampaign | null; discount: number } {
  if (!campaigns.length || orderAmount <= 0) {
    return { campaign: null, discount: 0 };
  }

  // Find the best applicable campaign
  for (const campaign of campaigns) {
    // Check minimum order amount
    if (campaign.min_order_amount && orderAmount < campaign.min_order_amount) {
      continue;
    }

    // Check if campaign applies to this order
    let applies = false;
    
    if (campaign.applies_to === "all") {
      applies = true;
    } else if (campaign.applies_to === "category" && productCategories?.length) {
      const targetCats = campaign.target_categories || [];
      applies = productCategories.some(cat => targetCats.includes(cat));
    } else if (campaign.applies_to === "products" && productIds?.length) {
      const targetIds = campaign.target_product_ids || [];
      applies = productIds.some(id => targetIds.includes(id));
    } else if (campaign.applies_to === "all") {
      applies = true;
    }

    if (!applies) continue;

    // Calculate discount
    let discount = 0;
    if (campaign.discount_type === "percentage") {
      discount = (orderAmount * campaign.discount_value) / 100;
    } else {
      discount = campaign.discount_value;
    }

    // Apply max discount cap
    if (campaign.max_discount_amount && discount > campaign.max_discount_amount) {
      discount = campaign.max_discount_amount;
    }

    // Don't discount more than order amount
    discount = Math.min(discount, orderAmount);

    return { campaign, discount: Math.round(discount * 100) / 100 };
  }

  return { campaign: null, discount: 0 };
}