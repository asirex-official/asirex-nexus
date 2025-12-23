import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  estimatedDelivery: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(resendApiKey);
    const {
      orderId,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      estimatedDelivery,
    }: OrderConfirmationRequest = await req.json();

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Thank you for your order, ${customerName}</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0; color: #666;">Order ID</p>
              <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #333;">#${orderId.slice(0, 8).toUpperCase()}</p>
            </div>

            <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left;">Item</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background-color: #6366f1;">
                  <td colspan="2" style="padding: 15px; color: #fff; font-weight: bold;">Total</td>
                  <td style="padding: 15px; text-align: right; color: #fff; font-weight: bold; font-size: 18px;">₹${totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 30px;">
              <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Shipping Address</h3>
              <p style="color: #666; margin: 0; line-height: 1.6;">${shippingAddress}</p>
            </div>

            <div style="margin-top: 20px;">
              <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Payment Method</h3>
              <p style="color: #666; margin: 0; text-transform: capitalize;">${paymentMethod}</p>
            </div>

            <div style="margin-top: 20px; background-color: #e8f5e9; border-radius: 8px; padding: 15px;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">📦 Estimated Delivery</p>
              <p style="margin: 5px 0 0; color: #388e3c;">${estimatedDelivery}</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/track-order" 
                 style="display: inline-block; background-color: #6366f1; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Track Your Order
              </a>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Questions? Contact our support team anytime.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ASIREX <orders@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmed! #${orderId.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
