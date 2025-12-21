import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateCouponRequest {
  code: string;
  order_amount: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ valid: false, error: "Please login to use coupons" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { code, order_amount }: ValidateCouponRequest = await req.json();
    
    if (!code || !order_amount) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing code or order amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Validating coupon: ${code} for user: ${user.id}, amount: ${order_amount}`);

    // Fetch coupon
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (couponError) {
      console.error("Coupon fetch error:", couponError);
      return new Response(
        JSON.stringify({ valid: false, error: "Error fetching coupon" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!coupon) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid coupon code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(
        JSON.stringify({ valid: false, error: "Coupon is not yet active" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(
        JSON.stringify({ valid: false, error: "Coupon has expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check minimum order amount
    if (coupon.min_order_amount && order_amount < coupon.min_order_amount) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Minimum order amount is ₹${coupon.min_order_amount}` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check global usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return new Response(
        JSON.stringify({ valid: false, error: "Coupon usage limit reached" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check per-user usage limit
    const { count: userUsageCount } = await supabase
      .from("coupon_usages")
      .select("*", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", user.id);

    if (coupon.per_user_limit && (userUsageCount || 0) >= coupon.per_user_limit) {
      return new Response(
        JSON.stringify({ valid: false, error: "You have already used this coupon" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if new users only
    if (coupon.new_users_only) {
      // Check if user has any previous orders
      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("payment_status", "paid");

      if ((orderCount || 0) > 0) {
        return new Response(
          JSON.stringify({ valid: false, error: "This coupon is only for new users" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (order_amount * coupon.discount_value) / 100;
      // Apply max discount cap if set
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      // Fixed amount discount
      discount = Math.min(coupon.discount_value, order_amount);
    }

    const finalAmount = Math.max(0, order_amount - discount);

    console.log(`Coupon valid! Discount: ${discount}, Final: ${finalAmount}`);

    return new Response(
      JSON.stringify({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          max_discount_amount: coupon.max_discount_amount,
        },
        discount_amount: discount,
        original_amount: order_amount,
        final_amount: finalAmount,
        savings_text: coupon.discount_type === "percentage" 
          ? `${coupon.discount_value}% off` 
          : `₹${coupon.discount_value} off`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in validate-coupon:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
