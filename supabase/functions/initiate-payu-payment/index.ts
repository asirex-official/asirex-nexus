import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayURequest {
  order_id: string;
  amount: number;
  product_info: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

// Generate SHA512 hash
async function generateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const merchantKey = Deno.env.get("PAYU_MERCHANT_KEY");
    const merchantSalt = Deno.env.get("PAYU_MERCHANT_SALT");

    if (!merchantKey || !merchantSalt) {
      console.error("PayU credentials not configured");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data: PayURequest = await req.json();
    console.log("PayU payment request:", data.order_id);

    // Validate amount
    if (!data.amount || data.amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate transaction ID (unique for each transaction)
    const txnid = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // PayU hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    const hashString = `${merchantKey}|${txnid}|${data.amount.toFixed(2)}|${data.product_info}|${data.customer_name}|${data.customer_email}|||||||||||${merchantSalt}`;
    const hash = await generateHash(hashString);

    console.log("PayU hash generated for txnid:", txnid);

    // Store transaction reference in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update order with transaction ID
    await supabase
      .from("orders")
      .update({ payment_id: txnid })
      .eq("id", data.order_id);

    // Return payment parameters for frontend
    return new Response(
      JSON.stringify({
        key: merchantKey,
        txnid: txnid,
        amount: data.amount.toFixed(2),
        productinfo: data.product_info,
        firstname: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone,
        hash: hash,
        surl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-payu-payment`,
        furl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/verify-payu-payment`,
        order_id: data.order_id,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error initiating PayU payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
