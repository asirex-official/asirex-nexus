import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const PAYU_MERCHANT_KEY = Deno.env.get("PAYU_MERCHANT_KEY");
    const PAYU_MERCHANT_SALT = Deno.env.get("PAYU_MERCHANT_SALT");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse form data from PayU callback
    const formData = await req.formData();
    const status = formData.get("status") as string;
    const txnid = formData.get("txnid") as string;
    const amount = formData.get("amount") as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname = formData.get("firstname") as string;
    const email = formData.get("email") as string;
    const hash = formData.get("hash") as string;
    const mihpayid = formData.get("mihpayid") as string;
    const additionalCharges = formData.get("additionalCharges") as string || "";

    console.log("Event PayU callback received:", { status, txnid, mihpayid });

    // Verify hash (reverse hash for response)
    let reverseHashString: string;
    if (additionalCharges) {
      reverseHashString = `${additionalCharges}|${PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    } else {
      reverseHashString = `${PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(reverseHashString);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const isValidHash = calculatedHash.toLowerCase() === hash?.toLowerCase();
    console.log("Hash verification:", isValidHash ? "VALID" : "INVALID");

    // Find registration by payment_id (txnid)
    const { data: registration, error: findError } = await supabase
      .from("event_registrations")
      .select("*, events(name)")
      .eq("payment_id", txnid)
      .single();

    if (findError || !registration) {
      console.error("Registration not found for txnid:", txnid);
      const frontendUrl = SUPABASE_URL?.replace('.supabase.co', '.lovable.app') || 'https://hdvjxlirfexofomkmwqc.lovable.app';
      return Response.redirect(`${frontendUrl}/events?status=error&message=Registration not found`, 302);
    }

    // Determine frontend URL
    const frontendUrl = SUPABASE_URL?.replace('.supabase.co', '.lovable.app') || 'https://hdvjxlirfexofomkmwqc.lovable.app';

    if (status === "success" && isValidHash) {
      // Update registration as paid
      const { error: updateError } = await supabase
        .from("event_registrations")
        .update({
          payment_status: "paid",
          amount_paid: parseFloat(amount),
          status: "registered"
        })
        .eq("id", registration.id);

      if (updateError) {
        console.error("Failed to update registration:", updateError);
        return Response.redirect(`${frontendUrl}/events?status=error&message=Failed to update registration`, 302);
      }

      console.log("Event registration payment successful:", registration.id);

      // Send confirmation notification
      try {
        await supabase.from("notifications").insert({
          user_id: registration.user_id,
          title: "Event Registration Confirmed! 🎉",
          message: `Your registration for the event is confirmed. Your verification code is: ${registration.verification_code}. You'll receive event details via email before the event.`,
          type: "event",
          link: "/events"
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      return Response.redirect(`${frontendUrl}/events?status=success&event_id=${registration.event_id}&verification_code=${registration.verification_code}`, 302);
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from("event_registrations")
        .update({
          payment_status: "failed",
          status: "payment_failed"
        })
        .eq("id", registration.id);

      if (updateError) {
        console.error("Failed to update registration:", updateError);
      }

      console.log("Event payment failed:", registration.id);
      return Response.redirect(`${frontendUrl}/events?status=failed&event_id=${registration.event_id}&message=Payment failed`, 302);
    }
  } catch (error: any) {
    console.error("Error in verify-event-payment:", error);
    const frontendUrl = 'https://hdvjxlirfexofomkmwqc.lovable.app';
    return Response.redirect(`${frontendUrl}/events?status=error&message=${encodeURIComponent(error.message)}`, 302);
  }
});