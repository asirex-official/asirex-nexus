import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  phone_number: string;
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
    const { phone_number, user_id, otp }: VerifyOTPRequest = await req.json();

    if (!phone_number || !user_id || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number, user ID, and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get verification record
    const { data: verification, error: fetchError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("user_id", user_id)
      .eq("phone_number", phone_number)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      return new Response(
        JSON.stringify({ error: "No pending verification found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check attempts (max 3)
    if (verification.attempts >= 3) {
      return new Response(
        JSON.stringify({ error: "Maximum attempts exceeded. Please request a new OTP." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Hash provided OTP and compare
    const otpHash = await hashOTP(otp);

    if (otpHash !== verification.otp_hash) {
      // Increment attempts
      await supabase
        .from("phone_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("id", verification.id);

      const remainingAttempts = 2 - verification.attempts;
      return new Response(
        JSON.stringify({ 
          error: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : "No attempts remaining."}` 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // OTP is valid - mark as verified
    await supabase
      .from("phone_verifications")
      .update({ 
        verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq("id", verification.id);

    // Upsert to user_phones
    const { error: upsertError } = await supabase
      .from("user_phones")
      .upsert({
        user_id,
        phone_number,
        verified_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("Error upserting user phone:", upsertError);
    }

    // Also update profile phone if exists
    await supabase
      .from("profiles")
      .update({ phone: phone_number })
      .eq("user_id", user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Phone number verified successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-phone-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
