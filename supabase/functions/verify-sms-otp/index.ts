import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifySMSOTPRequest {
  phone_number: string;
  otp: string;
}

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
    const { phone_number, otp }: VerifySMSOTPRequest = await req.json();

    if (!phone_number || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const cleanPhone = phone_number.replace(/\D/g, '');

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("signup_otps")
      .select("*")
      .eq("phone_number", cleanPhone)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "No OTP found for this phone number. Please request a new code." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabase.from("signup_otps").delete().eq("phone_number", cleanPhone);
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new code." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check attempt count
    if (otpRecord.attempts >= 5) {
      await supabase.from("signup_otps").delete().eq("phone_number", cleanPhone);
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify OTP
    const hashedOTP = await hashOTP(otp);
    if (hashedOTP !== otpRecord.otp_hash) {
      // Increment attempts
      await supabase
        .from("signup_otps")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("phone_number", cleanPhone);

      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      return new Response(
        JSON.stringify({ 
          error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          remainingAttempts 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // OTP is valid - mark as verified
    await supabase
      .from("signup_otps")
      .update({ verified: true })
      .eq("phone_number", cleanPhone);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP verified successfully",
        fullName: otpRecord.full_name,
        email: otpRecord.email
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-sms-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
