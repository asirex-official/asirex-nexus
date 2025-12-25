import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process completed return - handles both gift card and PayU refund
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, complaintId, refundMethod } = await req.json();
    console.log("Processing return complete:", { orderId, complaintId, refundMethod });

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Get or update complaint
    let complaint;
    if (complaintId) {
      const { data } = await supabase
        .from("order_complaints")
        .select("*")
        .eq("id", complaintId)
        .single();
      complaint = data;
    } else {
      const { data } = await supabase
        .from("order_complaints")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      complaint = data;
    }

    const finalRefundMethod = refundMethod || complaint?.refund_method;
    let result: any = { success: true };

    if (finalRefundMethod === "gift_card" || finalRefundMethod?.includes("gift_card")) {
      // Create gift card / store credit
      const couponCode = `GC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      const { data: giftCard, error: gcError } = await supabase
        .from("gift_cards")
        .insert({
          user_id: order.user_id,
          code: couponCode,
          amount: order.total_amount,
          balance: order.total_amount,
          source: "refund",
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (gcError) {
        console.error("Gift card creation error:", gcError);
        throw new Error("Failed to create gift card");
      }

      // Update complaint
      if (complaint) {
        await supabase
          .from("order_complaints")
          .update({
            investigation_status: "resolved",
            resolution_type: "refund",
            refund_status: "completed",
            refund_method: "gift_card",
            coupon_code: couponCode,
            admin_notes: `Return received. Store credit issued: ${couponCode}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", complaint.id);
      }

      // Update order
      await supabase
        .from("orders")
        .update({
          complaint_status: "refund_completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Notify user
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        title: "Store Credit Issued",
        message: `Your return has been processed. Store credit of ₹${order.total_amount.toLocaleString()} (Code: ${couponCode}) has been added to your account. Valid for 1 year.`,
        type: "order",
        link: "/track-order",
      });

      result = {
        success: true,
        refund_type: "gift_card",
        gift_card_code: couponCode,
        amount: order.total_amount,
      };

      console.log("Gift card created:", couponCode);

    } else if (finalRefundMethod === "original_payment" || finalRefundMethod?.includes("original")) {
      // Process PayU refund
      console.log("Initiating PayU refund for order:", orderId);

      const refundResponse = await fetch(`${supabaseUrl}/functions/v1/payu-refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: order.total_amount,
          paymentId: order.payment_id,
        }),
      });

      const refundResult = await refundResponse.json();
      console.log("PayU refund result:", refundResult);

      // Update complaint
      if (complaint) {
        await supabase
          .from("order_complaints")
          .update({
            investigation_status: "resolved",
            resolution_type: "refund",
            refund_status: refundResult.success ? "processing" : "failed",
            refund_method: "original_payment",
            admin_notes: refundResult.success 
              ? `Return received. PayU refund initiated. Reference: ${refundResult.refund_id || "N/A"}`
              : `Return received. Refund failed: ${refundResult.error || "Unknown error"}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", complaint.id);
      }

      // Update order
      await supabase
        .from("orders")
        .update({
          complaint_status: refundResult.success ? "refund_processing" : "refund_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Notify user
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        title: refundResult.success ? "Refund Initiated" : "Refund Issue",
        message: refundResult.success
          ? `Your return has been processed. A refund of ₹${order.total_amount.toLocaleString()} is being processed to your original payment method. This typically takes 3-7 business days.`
          : `There was an issue processing your refund. Our team will contact you shortly.`,
        type: "order",
        link: "/track-order",
      });

      result = {
        success: refundResult.success,
        refund_type: "original_payment",
        refund_id: refundResult.refund_id,
        amount: order.total_amount,
        status: refundResult.success ? "processing" : "failed",
      };

    } else {
      // No refund method selected - just mark return as complete
      if (complaint) {
        await supabase
          .from("order_complaints")
          .update({
            return_status: "return_received",
            pickup_status: "completed",
            pickup_completed_at: new Date().toISOString(),
            admin_notes: "Return received. Awaiting refund method selection.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", complaint.id);
      }

      await supabase
        .from("orders")
        .update({
          complaint_status: "return_received",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Notify user to select refund method
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        title: "Return Received - Select Refund Method",
        message: `Your return for order #${orderId.slice(0, 8).toUpperCase()} has been received. Please select how you'd like to receive your refund.`,
        type: "order",
        link: "/track-order",
      });

      result = {
        success: true,
        status: "awaiting_refund_selection",
        message: "Return received, awaiting refund method selection",
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing return complete:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
