import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationOTPRequest {
  order_id: string;
  user_id: string;
  reason: string;
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const { order_id, user_id, reason }: CancellationOTPRequest = await req.json();

    if (!order_id || !user_id || !reason) {
      return new Response(
        JSON.stringify({ error: "Order ID, user ID, and reason are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if order can be cancelled
    if (!["pending", "processing", "placed"].includes(order.order_status?.toLowerCase() || "")) {
      return new Response(
        JSON.stringify({ error: "This order cannot be cancelled. Only orders with 'Pending' or 'Processing' status can be cancelled." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete existing cancellation requests for this order
    await supabase
      .from("order_cancellations")
      .delete()
      .eq("order_id", order_id)
      .eq("status", "pending");

    // Create cancellation request
    const { error: insertError } = await supabase
      .from("order_cancellations")
      .insert({
        order_id,
        user_id,
        reason,
        otp_hash: otpHash,
        otp_expires_at: expiresAt.toISOString(),
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating cancellation request:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate cancellation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user details
    const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
    const { data: userPhone } = await supabase
      .from("user_phones")
      .select("phone_number")
      .eq("user_id", user_id)
      .single();

    // Send OTP via email
    if (authUser?.user?.email) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        
        await resend.emails.send({
          from: "ASIREX <onboarding@resend.dev>",
          to: [authUser.user.email],
          subject: "Order Cancellation OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff;">
              <h2 style="color: #ef4444;">Order Cancellation Request</h2>
              <p>You have requested to cancel your order. Please use the OTP below to confirm:</p>
              
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; font-family: monospace;">
                  ${otp}
                </div>
              </div>
              
              <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                <p style="margin: 0;"><strong>Order ID:</strong> ${order_id.slice(0, 8).toUpperCase()}</p>
                <p style="margin: 5px 0 0 0;"><strong>Reason:</strong> ${reason}</p>
              </div>
              
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.
              </p>
            </div>
          `,
        });
      }
    }

    // Log for SMS (mock mode)
    if (userPhone?.phone_number) {
      console.log(`[MOCK SMS] Cancellation OTP for ${userPhone.phone_number}: ${otp}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent to your email and registered phone number",
        email_sent: !!authUser?.user?.email,
        phone_sent: !!userPhone?.phone_number,
        // Development only
        ...(Deno.env.get("DENO_DEPLOYMENT_ID") ? {} : { test_otp: otp })
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-cancellation-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
