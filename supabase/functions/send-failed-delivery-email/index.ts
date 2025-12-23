import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const Resend = (await import("https://esm.sh/resend@2.0.0")).Resend;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FailedDeliveryRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  refundToken: string;
  failureReason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerName, customerEmail, totalAmount, refundToken, failureReason } =
      (await req.json()) as FailedDeliveryRequest;

    console.log("Sending failed delivery email to:", customerEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ success: true, message: "Email skipped - no API key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    // Get the site URL from environment or use a default
    const siteUrl = Deno.env.get("SITE_URL") || "https://asirex.in";
    const refundLink = `${siteUrl}/refund-selection?token=${refundToken}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Failed - Refund Options</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0;">
        <span style="color: #f97316;">ASIREX</span>
      </h1>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; padding: 32px; border: 1px solid #333;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background-color: rgba(239, 68, 68, 0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">📦</span>
        </div>
        <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 8px; color: #ef4444;">
          Delivery Unsuccessful
        </h2>
        <p style="color: #888; margin: 0;">
          After 3 attempts, we couldn't complete your delivery
        </p>
      </div>

      <!-- Order Details -->
      <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; color: #888; font-size: 14px;">Order Details</p>
        <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${orderId.slice(0, 8)}...</p>
        <p style="margin: 0 0 8px;"><strong>Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
        <p style="margin: 0; color: #ef4444;"><strong>Reason:</strong> ${failureReason}</p>
      </div>

      <!-- Refund CTA -->
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="color: #888; margin: 0 0 16px;">
          Don't worry! You can choose how to receive your refund:
        </p>
        <a href="${refundLink}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
          Choose Refund Method →
        </a>
      </div>

      <!-- Refund Options -->
      <div style="margin-bottom: 24px;">
        <p style="color: #888; font-size: 14px; margin: 0 0 12px;">Available refund options:</p>
        <div style="display: grid; gap: 12px;">
          <div style="background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 12px;">
            <p style="margin: 0; font-weight: bold; color: #22c55e;">🎁 Website Gift Card</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #888;">Instant credit • Valid for 1 year</p>
          </div>
          <div style="background-color: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 12px;">
            <p style="margin: 0; font-weight: bold; color: #6366f1;">📱 UPI Refund</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #888;">2-3 business days</p>
          </div>
          <div style="background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 12px;">
            <p style="margin: 0; font-weight: bold; color: #3b82f6;">🏦 Bank Transfer</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #888;">5-7 business days</p>
          </div>
        </div>
      </div>

      <!-- Link Expiry Notice -->
      <div style="background-color: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; padding: 12px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #fbbf24;">
          ⏰ This refund link expires in 7 days
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #666; font-size: 14px;">
      <p style="margin: 0 0 8px;">Need help? Contact our support team</p>
      <p style="margin: 0;">
        <a href="mailto:support@asirex.in" style="color: #f97316; text-decoration: none;">support@asirex.in</a>
      </p>
      <p style="margin: 16px 0 0; font-size: 12px; color: #444;">
        © ${new Date().getFullYear()} ASIREX. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ASIREX <orders@asirex.in>",
      to: [customerEmail],
      subject: `Delivery Failed - Choose Your Refund Method | Order #${orderId.slice(0, 8)}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
