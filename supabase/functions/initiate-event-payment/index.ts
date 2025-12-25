import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventPaymentRequest {
  registration_id: string;
  event_id: string;
  event_name: string;
  amount: number;
  email: string;
  phone: string;
  user_name: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registration_id, event_id, event_name, amount, email, phone, user_name }: EventPaymentRequest = await req.json();

    const PAYU_MERCHANT_KEY = Deno.env.get("PAYU_MERCHANT_KEY");
    const PAYU_MERCHANT_SALT = Deno.env.get("PAYU_MERCHANT_SALT");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!PAYU_MERCHANT_KEY || !PAYU_MERCHANT_SALT) {
      console.error("PayU credentials not configured");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Generate unique transaction ID
    const txnid = `EVT_${registration_id.slice(0, 8)}_${Date.now()}`;
    
    // Generate verification code for check-in
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Update registration with transaction ID and verification code
    const { error: updateError } = await supabase
      .from("event_registrations")
      .update({ 
        payment_id: txnid,
        verification_code: verificationCode,
        email: email
      })
      .eq("id", registration_id);

    if (updateError) {
      console.error("Failed to update registration:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update registration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Product info for PayU
    const productinfo = `Event Registration: ${event_name}`;

    // Build hash string: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount.toFixed(2)}|${productinfo}|${user_name}|${email}|||||||||||${PAYU_MERCHANT_SALT}`;

    // Generate SHA512 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    console.log("Generated PayU hash for event payment, txnid:", txnid);

    // Build success/failure URLs
    const baseUrl = req.headers.get("origin") || SUPABASE_URL;
    const successUrl = `${SUPABASE_URL}/functions/v1/verify-event-payment`;
    const failureUrl = `${SUPABASE_URL}/functions/v1/verify-event-payment`;

    return new Response(
      JSON.stringify({
        key: PAYU_MERCHANT_KEY,
        txnid,
        amount: amount.toFixed(2),
        productinfo,
        firstname: user_name,
        email,
        phone,
        surl: successUrl,
        furl: failureUrl,
        hash,
        registration_id,
        verification_code: verificationCode
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in initiate-event-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});