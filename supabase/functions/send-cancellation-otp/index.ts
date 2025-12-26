import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;

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

    // Check if order can be cancelled - ONLY "pending" (Order Placed) status
    // Once order moves to "processing" or beyond, cancellation is not allowed
    const status = order.order_status?.toLowerCase() || "";
    if (status !== "pending" && status !== "placed") {
      return new Response(
        JSON.stringify({ error: "Order cancellation is only available for orders in 'Order Placed' status. Once processing begins, cancellation is no longer available." }),
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

    // Get profile phone as fallback
    const { data: profilePhone } = await supabase
      .from("profiles")
      .select("phone")
      .eq("user_id", user_id)
      .single();

    const phoneToUse = userPhone?.phone_number || profilePhone?.phone;

    let smsSent = false;
    let emailSent = false;

    // Try to send SMS via MSG91
    if (phoneToUse) {
      const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY");
      const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID");
      const MSG91_SENDER_ID = Deno.env.get("MSG91_SENDER_ID") || "ASIREX";

      if (MSG91_AUTH_KEY && MSG91_TEMPLATE_ID) {
        let formattedPhone = phoneToUse.replace(/\D/g, '');
        if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
          formattedPhone = '91' + formattedPhone;
        }

        try {
          const smsResponse = await fetch(`https://control.msg91.com/api/v5/otp`, {
            method: 'POST',
            headers: {
              'authkey': MSG91_AUTH_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template_id: MSG91_TEMPLATE_ID,
              mobile: formattedPhone,
              otp: otp,
              sender: MSG91_SENDER_ID,
              otp_length: 6,
              otp_expiry: 5,
            }),
          });

          const smsResult = await smsResponse.json();
          console.log("MSG91 cancellation OTP response:", smsResult);
          smsSent = smsResult.type === 'success' || smsResponse.ok;
        } catch (smsError) {
          console.error("SMS sending failed:", smsError);
        }
      }

      // Log for mock mode if SMS not configured
      if (!smsSent) {
        console.log(`[MOCK SMS] Cancellation OTP for ${phoneToUse}: ${otp}`);
      }
    }

    // Send OTP via email
    if (authUser?.user?.email) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        
        try {
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
          emailSent = true;
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent to your registered contact methods",
        email_sent: emailSent,
        sms_sent: smsSent,
        phone_registered: !!phoneToUse,
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
