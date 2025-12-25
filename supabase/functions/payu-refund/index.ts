import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayU test/production URLs
const PAYU_REFUND_URL = "https://info.payu.in/merchant/postservice.php?form=2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, amount, refundRequestId } = await req.json();
    
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    console.log("Processing PayU refund for order:", orderId, "amount:", amount);

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

    // Get PayU credentials
    const merchantKey = Deno.env.get("PAYU_MERCHANT_KEY");
    const merchantSalt = Deno.env.get("PAYU_MERCHANT_SALT");

    if (!merchantKey || !merchantSalt) {
      throw new Error("PayU credentials not configured");
    }

    // Get the PayU transaction ID from payment_id
    const payuTxnId = order.payment_id;
    if (!payuTxnId) {
      throw new Error("No PayU transaction ID found for this order");
    }

    const refundAmount = amount || order.total_amount;

    // Generate hash for refund
    // Hash format: key|command|var1|salt
    const command = "cancel_refund_transaction";
    const var1 = payuTxnId;
    const hashString = `${merchantKey}|${command}|${var1}|${merchantSalt}`;
    
    // Create SHA512 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Prepare refund request
    const refundParams = new URLSearchParams({
      key: merchantKey,
      command: command,
      var1: payuTxnId,
      var2: refundAmount.toString(),
      var3: `Refund for order ${orderId}`,
      hash: hash,
    });

    console.log("Sending refund request to PayU...");

    // Send refund request to PayU
    const refundResponse = await fetch(PAYU_REFUND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: refundParams.toString(),
    });

    const refundResult = await refundResponse.text();
    console.log("PayU refund response:", refundResult);

    let parsedResult;
    try {
      parsedResult = JSON.parse(refundResult);
    } catch {
      parsedResult = { raw_response: refundResult };
    }

    // Check if refund was successful
    const isSuccess = parsedResult.status === 1 || 
                      parsedResult.msg?.toLowerCase().includes("success") ||
                      refundResult.toLowerCase().includes("success");

    // Update refund request status
    if (refundRequestId) {
      await supabase
        .from("refund_requests")
        .update({
          status: isSuccess ? "completed" : "failed",
          processed_at: new Date().toISOString(),
          admin_notes: `PayU Response: ${JSON.stringify(parsedResult)}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", refundRequestId);
    }

    // Update order with refund info
    await supabase
      .from("orders")
      .update({
        payment_status: isSuccess ? "refunded" : order.payment_status,
        notes: JSON.stringify({
          ...JSON.parse(order.notes || "{}"),
          refund_initiated_at: new Date().toISOString(),
          refund_amount: refundAmount,
          refund_status: isSuccess ? "completed" : "failed",
          payu_refund_response: parsedResult,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // Create notification for user
    if (order.user_id) {
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        title: isSuccess ? "Refund Processed" : "Refund Update",
        message: isSuccess 
          ? `Your refund of ₹${refundAmount.toLocaleString()} for order #${orderId.slice(0, 8).toUpperCase()} has been processed. It will reflect in your account within 5-7 business days.`
          : `There was an issue processing your refund. Our team will contact you shortly.`,
        type: "order",
        link: "/track-order",
      });
    }

    // Send email notification
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY && order.customer_email) {
      const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;
      const resend = new Resend(RESEND_API_KEY);

      await resend.emails.send({
        from: "ASIREX <onboarding@resend.dev>",
        to: [order.customer_email],
        subject: isSuccess ? "Refund Processed Successfully" : "Refund Status Update",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff;">
            <h2 style="color: ${isSuccess ? '#10b981' : '#f59e0b'};">
              ${isSuccess ? '✓ Refund Processed' : '⚠ Refund Update'}
            </h2>
            
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
              <p style="margin: 5px 0 0 0;"><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString()}</p>
            </div>
            
            ${isSuccess ? `
              <p>Your refund has been initiated and will be credited to your original payment method within 5-7 business days.</p>
            ` : `
              <p>There was an issue processing your refund. Our support team will contact you within 24 hours.</p>
            `}
          </div>
        `,
      });
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        message: isSuccess ? "Refund processed successfully" : "Refund request submitted",
        payu_response: parsedResult,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error processing PayU refund:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
