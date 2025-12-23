import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PhoneOTPRequest {
  phone_number: string;
  user_id: string;
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
    const { phone_number, user_id }: PhoneOTPRequest = await req.json();

    if (!phone_number || !user_id) {
      return new Response(
        JSON.stringify({ error: "Phone number and user ID are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limiting - max 3 requests per 30 seconds
    const { data: recentAttempts } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("user_id", user_id)
      .eq("phone_number", phone_number)
      .gte("last_sent_at", new Date(Date.now() - 30000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentAttempts && recentAttempts.length > 0) {
      const lastSent = new Date(recentAttempts[0].last_sent_at).getTime();
      const waitTime = Math.ceil((30000 - (Date.now() - lastSent)) / 1000);
      if (waitTime > 0) {
        return new Response(
          JSON.stringify({ error: `Please wait ${waitTime} seconds before requesting a new OTP` }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete existing OTPs for this user/phone
    await supabase
      .from("phone_verifications")
      .delete()
      .eq("user_id", user_id)
      .eq("phone_number", phone_number);

    // Store new OTP
    const { error: insertError } = await supabase
      .from("phone_verifications")
      .insert({
        user_id,
        phone_number,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified: false,
        last_sent_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // In production, integrate with Twilio/MSG91 here
    // For now, we'll use a mock mode where OTP is logged (for testing)
    console.log(`[MOCK SMS] OTP for ${phone_number}: ${otp}`);

    // For development/testing - also send via email if user has email
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
    
    if (authUser?.user?.email) {
      // Send OTP via email as fallback (for testing)
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        
        await resend.emails.send({
          from: "ASIREX <onboarding@resend.dev>",
          to: [authUser.user.email],
          subject: "Your Phone Verification OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a2e;">Phone Verification OTP</h2>
              <p>Your OTP for phone number verification (${phone_number}) is:</p>
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; margin: 20px 0;">
                ${otp}
              </div>
              <p style="color: #666;">This OTP is valid for 5 minutes. Do not share it with anyone.</p>
              <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`OTP also sent via email to ${authUser.user.email}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        // In development, return OTP for testing (remove in production!)
        ...(Deno.env.get("DENO_DEPLOYMENT_ID") ? {} : { test_otp: otp })
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-phone-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
