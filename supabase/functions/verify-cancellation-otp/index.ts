import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyCancellationRequest {
  order_id: string;
  user_id: string;
  otp: string;
}

// Hash OTP
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, user_id, otp }: VerifyCancellationRequest = await req.json();

    if (!order_id || !user_id || !otp) {
      return new Response(
        JSON.stringify({ error: "Order ID, user ID, and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get cancellation request
    const { data: cancellation, error: fetchError } = await supabase
      .from("order_cancellations")
      .select("*")
      .eq("order_id", order_id)
      .eq("user_id", user_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !cancellation) {
      return new Response(
        JSON.stringify({ error: "No pending cancellation request found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if expired
    if (new Date(cancellation.otp_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Hash provided OTP and compare
    const otpHash = await hashOTP(otp);

    if (otpHash !== cancellation.otp_hash) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get order details
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    // Update cancellation status
    await supabase
      .from("order_cancellations")
      .update({
        status: "verified",
        phone_otp_verified: true,
        email_otp_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", cancellation.id);

    // Update order status
    await supabase
      .from("orders")
      .update({
        order_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    // Determine if refund is needed
    const needsRefund = order?.payment_method?.toLowerCase() !== "cod" && 
                        order?.payment_status === "paid";

    if (needsRefund) {
      // Update cancellation to indicate refund needed
      await supabase
        .from("order_cancellations")
        .update({ status: "refund_initiated" })
        .eq("id", cancellation.id);

      // Create refund request for user to select payment method
      await supabase.from("refund_requests").insert({
        order_id: order_id,
        user_id: user_id,
        amount: order?.total_amount || 0,
        payment_method: order?.payment_method || "unknown",
        refund_method: "pending_selection",
        reason: `Order cancelled: ${cancellation.reason}`,
        status: "pending_user_selection",
      });
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id,
      title: "Order Cancelled",
      message: `Your order #${order_id.slice(0, 8).toUpperCase()} has been cancelled successfully.${needsRefund ? " Refund will be processed shortly." : ""}`,
      type: "order",
      link: "/track-order",
    });

    // Send cancellation email
    const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
    
    if (authUser?.user?.email) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        
        await resend.emails.send({
          from: "ASIREX <onboarding@resend.dev>",
          to: [authUser.user.email],
          subject: "Order Cancelled Successfully",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff;">
              <h2 style="color: #ef4444;">Order Cancelled</h2>
              <p>Your order has been cancelled successfully.</p>
              
              <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${order_id.slice(0, 8).toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Reason:</strong> ${cancellation.reason}</p>
                <p style="margin: 5px 0 0 0;"><strong>Amount:</strong> ₹${order?.total_amount?.toLocaleString()}</p>
              </div>
              
              ${needsRefund ? `
                <div style="background: #10b981; padding: 15px; border-radius: 8px;">
                  <p style="margin: 0; font-weight: bold;">Refund Information</p>
                  <p style="margin: 5px 0 0 0;">A refund of ₹${order?.total_amount?.toLocaleString()} will be initiated. You will be contacted to select your preferred refund method.</p>
                </div>
              ` : `
                <p style="color: #888;">No refund is required as this was a Cash on Delivery order.</p>
              `}
            </div>
          `,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order cancelled successfully",
        needs_refund: needsRefund,
        order_amount: order?.total_amount,
        payment_method: order?.payment_method,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-cancellation-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
