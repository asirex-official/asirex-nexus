import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string; // Our database order ID
}

// Rate limiting: track requests per user/order
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max verification attempts per order
const RATE_WINDOW = 300000; // 5 minutes (ms)

// Track failed verification attempts per order
const failedAttemptsMap = new Map<string, number>();
const MAX_FAILED_ATTEMPTS = 5;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

function trackFailedAttempt(orderId: string): number {
  const current = failedAttemptsMap.get(orderId) || 0;
  const newCount = current + 1;
  failedAttemptsMap.set(orderId, newCount);
  return newCount;
}

function isOrderLocked(orderId: string): boolean {
  return (failedAttemptsMap.get(orderId) || 0) >= MAX_FAILED_ATTEMPTS;
}

// HMAC SHA256 verification
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signature;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Payment verification not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data: VerifyPaymentRequest = await req.json();

    // Check if order is locked due to too many failed attempts
    if (isOrderLocked(data.order_id)) {
      console.error("Order locked due to too many failed verification attempts:", data.order_id);
      return new Response(
        JSON.stringify({ 
          error: "Verification locked", 
          message: "Too many failed attempts. Please contact support." 
        }),
        { status: 423, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limit per order
    if (!checkRateLimit(`order:${data.order_id}`)) {
      console.log("Rate limit exceeded for order:", data.order_id);
      return new Response(
        JSON.stringify({ 
          error: "Too many attempts", 
          message: "Please wait before trying again." 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the payment signature
    const isValid = await verifySignature(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      const failedCount = trackFailedAttempt(data.order_id);
      console.error(`Payment signature verification failed for order ${data.order_id} (attempt ${failedCount})`);
      
      return new Response(
        JSON.stringify({ 
          error: "Payment verification failed", 
          verified: false,
          attemptsRemaining: MAX_FAILED_ATTEMPTS - failedCount
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Clear failed attempts on successful verification
    failedAttemptsMap.delete(data.order_id);

    // Update order status in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_id: data.razorpay_payment_id,
        order_status: "confirmed",
      })
      .eq("id", data.order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw updateError;
    }

    // Log activity
    const { data: order } = await supabase
      .from("orders")
      .select("user_id, total_amount")
      .eq("id", data.order_id)
      .single();

    if (order?.user_id) {
      await supabase.from("activity_logs").insert({
        user_id: order.user_id,
        action_type: "payment_completed",
        action_details: {
          order_id: data.order_id,
          payment_id: data.razorpay_payment_id,
          amount: order.total_amount,
        },
      });
    }

    console.log("Payment verified successfully:", data.razorpay_payment_id);

    return new Response(
      JSON.stringify({ verified: true, paymentId: data.razorpay_payment_id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);