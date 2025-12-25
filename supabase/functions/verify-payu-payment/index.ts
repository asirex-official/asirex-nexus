import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const merchantSalt = Deno.env.get("PAYU_MERCHANT_SALT");
    const merchantKey = Deno.env.get("PAYU_MERCHANT_KEY");

    if (!merchantSalt || !merchantKey) {
      console.error("PayU credentials not configured");
      return new Response(
        JSON.stringify({ error: "Payment verification not configured" }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // PayU sends data as form-urlencoded for both success and failure
    const formData = await req.formData();
    
    const status = formData.get("status") as string;
    const txnid = formData.get("txnid") as string;
    const amount = formData.get("amount") as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname = formData.get("firstname") as string;
    const email = formData.get("email") as string;
    const hash = formData.get("hash") as string;
    const mihpayid = formData.get("mihpayid") as string;
    const udf1 = formData.get("udf1") as string || "";
    const udf2 = formData.get("udf2") as string || "";
    const udf3 = formData.get("udf3") as string || "";
    const udf4 = formData.get("udf4") as string || "";
    const udf5 = formData.get("udf5") as string || "";
    const additionalCharges = formData.get("additionalCharges") as string || "";

    console.log("PayU callback received:", { status, txnid, mihpayid });

    // Verify hash for response
    // Response hash: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    let hashString = "";
    if (additionalCharges) {
      hashString = `${additionalCharges}|${merchantSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
    } else {
      hashString = `${merchantSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
    }
    
    const calculatedHash = await generateHash(hashString);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find order by transaction ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, total_amount")
      .eq("payment_id", txnid)
      .single();

    if (orderError || !order) {
      console.error("Order not found for txnid:", txnid);
      // Redirect to failure page
      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/checkout?status=failed&message=Order not found`,
          ...corsHeaders,
        },
      });
    }

    // Verify hash
    if (hash !== calculatedHash) {
      console.error("Hash verification failed for txnid:", txnid);
      await supabase
        .from("orders")
        .update({ payment_status: "failed", order_status: "cancelled" })
        .eq("id", order.id);

      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/checkout?status=failed&message=Payment verification failed`,
          ...corsHeaders,
        },
      });
    }

    // Check payment status
    if (status === "success") {
      // Update order as paid
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_id: mihpayid || txnid,
          order_status: "confirmed",
        })
        .eq("id", order.id);

      // Log activity
      if (order.user_id) {
        await supabase.from("activity_logs").insert({
          user_id: order.user_id,
          action_type: "payment_completed",
          action_details: {
            order_id: order.id,
            payment_id: mihpayid || txnid,
            amount: order.total_amount,
            gateway: "payu",
          },
        });
      }

      console.log("Payment successful for order:", order.id);

      // Redirect to success page
      // Get the frontend URL from the Supabase URL
      const frontendUrl = Deno.env.get("SUPABASE_URL")?.replace('hdvjxlirfexofomkmwqc.supabase.co', 'id-preview--6ec7cecf-99b2-4494-be54-317bf746f953.lovable.app') || '';
      
      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${frontendUrl}/checkout?status=success&order_id=${order.id}`,
          ...corsHeaders,
        },
      });
    } else {
      // Payment failed or pending
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);

      console.log("Payment failed for order:", order.id, "Status:", status);

      const frontendUrl = Deno.env.get("SUPABASE_URL")?.replace('hdvjxlirfexofomkmwqc.supabase.co', 'id-preview--6ec7cecf-99b2-4494-be54-317bf746f953.lovable.app') || '';

      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${frontendUrl}/checkout?status=failed&message=Payment was not successful`,
          ...corsHeaders,
        },
      });
    }

  } catch (error: any) {
    console.error("Error verifying PayU payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
