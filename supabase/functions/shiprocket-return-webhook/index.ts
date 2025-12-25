import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This webhook handles ShipRocket status updates including return completion
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("ShipRocket return webhook received:", JSON.stringify(payload));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract status from webhook
    const { order_id, status, awb } = payload;

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "Order ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find order by tracking number or notes
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .or(`tracking_number.eq.${order_id},id.ilike.%${order_id}%`);

    let order = orders?.[0];

    // If not found, try searching in notes
    if (!order) {
      const { data: allOrders } = await supabase
        .from("orders")
        .select("*")
        .not("notes", "is", null);

      order = allOrders?.find((o) => {
        try {
          const notes = JSON.parse(o.notes);
          return notes.return_order_id?.toString() === order_id.toString() ||
                 notes.return_shipment_id?.toString() === order_id.toString() ||
                 notes.shiprocket_order_id?.toString() === order_id.toString();
        } catch {
          return false;
        }
      });
    }

    if (!order) {
      console.log("Order not found for:", order_id);
      return new Response(
        JSON.stringify({ success: true, message: "Order not found, ignoring" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found order:", order.id, "Status:", status);

    // Check if this is a return completion
    const returnStatuses = ["RETURN DELIVERED", "RTO DELIVERED", "RTO_DELIVERED", "DELIVERED_BACK"];
    const isReturnComplete = returnStatuses.some(s => 
      status?.toUpperCase().includes(s.toUpperCase().replace("_", " ")) ||
      status?.toUpperCase().includes(s.toUpperCase())
    );

    if (isReturnComplete) {
      console.log("Return complete detected for order:", order.id);

      // Get the complaint
      const { data: complaint } = await supabase
        .from("order_complaints")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Check if this is a replacement request
      let isReplacement = false;
      try {
        const notes = JSON.parse(order.notes || "{}");
        isReplacement = notes.is_replacement === true;
      } catch {}

      if (isReplacement && complaint) {
        // Create replacement order on ShipRocket
        console.log("Creating replacement order for:", order.id);
        
        await fetch(`${supabaseUrl}/functions/v1/shiprocket-create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ 
            orderId: order.id,
            isReplacement: true,
          }),
        });

        // Update complaint
        await supabase
          .from("order_complaints")
          .update({
            pickup_status: "completed",
            pickup_completed_at: new Date().toISOString(),
            return_status: "return_received",
            investigation_status: "resolved",
            resolution_type: "replacement",
            admin_notes: `Return received. Replacement order created automatically.`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", complaint.id);

        // Update order
        await supabase
          .from("orders")
          .update({
            complaint_status: "replacement_shipped",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        // Notify user
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          title: "Replacement Order Shipped",
          message: `Your return has been received and a replacement order is being prepared for order #${order.id.slice(0, 8).toUpperCase()}.`,
          type: "order",
          link: "/track-order",
        });

      } else {
        // This is a refund case - use process-return-complete function
        console.log("Processing refund for return:", order.id);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/process-return-complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ 
            orderId: order.id,
            complaintId: complaint?.id,
            refundMethod: complaint?.refund_method,
          }),
        });

        const result = await response.json();
        console.log("Process return complete result:", result);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error processing return webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
