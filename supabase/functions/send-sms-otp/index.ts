import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSOTPRequest {
  phone_number: string;
  purpose: 'signup' | 'login' | 'password_reset' | 'order_cancel' | 'verification';
  email?: string;
  full_name?: string;
  user_id?: string;
  order_id?: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Send SMS via MSG91
async function sendSMS(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY");
  const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID");
  const MSG91_SENDER_ID = Deno.env.get("MSG91_SENDER_ID") || "ASIREX";

  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    console.error("MSG91 credentials not configured");
    return { success: false, error: "SMS service not configured" };
  }

  // Format phone number - add country code if not present
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }

  try {
    // MSG91 Send OTP API
    const response = await fetch(`https://control.msg91.com/api/v5/otp`, {
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
        otp_expiry: 10, // 10 minutes
      }),
    });

    const result = await response.json();
    console.log("MSG91 response:", result);

    if (result.type === 'success' || response.ok) {
      return { success: true };
    } else {
      return { success: false, error: result.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error("MSG91 API error:", error);
    return { success: false, error: error instanceof Error ? error.message : 'SMS sending failed' };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, purpose, email, full_name, user_id, order_id }: SMSOTPRequest = await req.json();

    if (!phone_number) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate phone number format
    const cleanPhone = phone_number.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting - check for recent OTPs
    const { data: recentOTP } = await supabase
      .from("signup_otps")
      .select("created_at")
      .eq("phone_number", cleanPhone)
      .gte("created_at", new Date(Date.now() - 30000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentOTP && recentOTP.length > 0) {
      return new Response(
        JSON.stringify({ error: "Please wait 30 seconds before requesting another OTP" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete existing OTPs for this phone
    await supabase.from("signup_otps").delete().eq("phone_number", cleanPhone);

    // Store OTP in database
    const { error: insertError } = await supabase.from("signup_otps").insert({
      phone_number: cleanPhone,
      email: email?.toLowerCase() || null,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
      full_name: full_name || null,
      otp_method: 'sms',
      attempts: 0,
      verified: false,
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send SMS via MSG91
    const smsResult = await sendSMS(cleanPhone, otp);
    
    if (!smsResult.success) {
      console.log(`SMS failed, OTP for testing: ${otp}`);
      // Still return success for development, but log the OTP
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          sms_sent: false,
          // Development only - remove in production
          ...(Deno.env.get("DENO_DEPLOYMENT_ID") ? {} : { test_otp: otp })
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`SMS OTP sent successfully to ${cleanPhone}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent to your phone number",
        sms_sent: true
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-sms-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
