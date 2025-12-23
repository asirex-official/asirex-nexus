import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingNotificationRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  trackingProvider?: string;
  items: { name: string; quantity: number; price: number; }[];
  totalAmount: number;
  shippingAddress: string;
  status: "shipped" | "delivered";
}

const getEmailTemplate = (
  customerName: string,
  orderId: string,
  trackingNumber: string | undefined,
  trackingProvider: string | undefined,
  items: { name: string; quantity: number; price: number; }[],
  totalAmount: number,
  shippingAddress: string,
  isDelivered: boolean
) => {
  const statusIcon = isDelivered ? "📦✅" : "🚚";
  const statusTitle = isDelivered ? "Order Delivered!" : "Your Order is On Its Way!";
  const statusMessage = isDelivered 
    ? "Great news! Your order has been successfully delivered."
    : "Great news! Your order has been shipped and is on its way to you.";
  const bannerColor = isDelivered ? "#10B981" : "#3B82F6";
  const bannerText = isDelivered ? "DELIVERY CONFIRMED" : "ORDER SHIPPED";

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #374151;">
        <span style="color: #F3F4F6; font-weight: 500;">${item.name}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #374151; text-align: center;">
        <span style="color: #9CA3AF;">×${item.quantity}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #374151; text-align: right;">
        <span style="color: #10B981; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</span>
      </td>
    </tr>
  `).join('');

  const trackingSection = trackingNumber ? `
    <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #374151;">
      <div style="text-align: center; margin-bottom: 16px;">
        <span style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tracking Information</span>
      </div>
      <div style="background: #111827; border-radius: 8px; padding: 16px; border: 2px dashed #4B5563;">
        <div style="text-align: center;">
          <span style="color: #9CA3AF; font-size: 14px;">${trackingProvider || 'Carrier'}</span>
          <div style="margin-top: 8px;">
            <span style="color: #10B981; font-size: 20px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">${trackingNumber}</span>
          </div>
        </div>
      </div>
      <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 12px; margin-bottom: 0;">
        Use this tracking number to monitor your shipment status
      </p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #111827 0%, #0F172A 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          
          <!-- Status Banner -->
          <tr>
            <td style="background: ${bannerColor}; padding: 16px 24px; text-align: center;">
              <span style="color: white; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">${bannerText}</span>
            </td>
          </tr>
          
          <!-- Logo Section -->
          <tr>
            <td style="padding: 32px 24px 16px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                <span style="color: white; font-size: 28px; font-weight: 800; letter-spacing: 3px;">ASIREX</span>
              </div>
            </td>
          </tr>
          
          <!-- Status Icon & Title -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${statusIcon}</div>
              <h1 style="color: #F3F4F6; font-size: 28px; font-weight: 700; margin: 0 0 12px 0;">${statusTitle}</h1>
              <p style="color: #9CA3AF; font-size: 16px; margin: 0; line-height: 1.6;">${statusMessage}</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="color: #D1D5DB; font-size: 16px; margin: 0;">
                Hi <strong style="color: #10B981;">${customerName}</strong>,
              </p>
            </td>
          </tr>
          
          <!-- Order ID -->
          <tr>
            <td style="padding: 24px 40px;">
              <div style="background: #1F2937; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #374151;">
                <span style="color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</span>
                <div style="color: #F3F4F6; font-size: 18px; font-weight: 600; margin-top: 4px; font-family: 'Courier New', monospace;">#${orderId.slice(0, 8).toUpperCase()}</div>
              </div>
            </td>
          </tr>
          
          <!-- Tracking Section -->
          <tr>
            <td style="padding: 0 40px;">
              ${trackingSection}
            </td>
          </tr>
          
          <!-- Order Items -->
          <tr>
            <td style="padding: 24px 40px;">
              <div style="background: #1F2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151;">
                <div style="background: #111827; padding: 16px; border-bottom: 1px solid #374151;">
                  <span style="color: #F3F4F6; font-weight: 600; font-size: 16px;">📦 Order Items</span>
                </div>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #111827;">
                      <th style="padding: 12px 16px; text-align: left; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                      <th style="padding: 12px 16px; text-align: center; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                      <th style="padding: 12px 16px; text-align: right; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr style="background: #111827;">
                      <td colspan="2" style="padding: 16px; text-align: right;">
                        <span style="color: #F3F4F6; font-weight: 600; font-size: 16px;">Total Amount:</span>
                      </td>
                      <td style="padding: 16px; text-align: right;">
                        <span style="color: #10B981; font-weight: 700; font-size: 20px;">₹${totalAmount.toLocaleString()}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="background: #1F2937; border-radius: 12px; padding: 20px; border: 1px solid #374151;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 20px; margin-right: 8px;">📍</span>
                  <span style="color: #F3F4F6; font-weight: 600; font-size: 16px;">Shipping Address</span>
                </div>
                <p style="color: #9CA3AF; font-size: 14px; margin: 0; line-height: 1.6;">${shippingAddress}</p>
              </div>
            </td>
          </tr>
          
          <!-- Help Section -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #374151;">
                <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 16px 0;">
                  Need help with your order?
                </p>
                <a href="mailto:support@asirex.com" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
                  Contact Support
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0F172A; padding: 24px 40px; border-top: 1px solid #1F2937;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #4B5563; font-size: 12px; margin: 0 0 8px 0;">
                      © 2024 ASIREX. All rights reserved.
                    </p>
                    <p style="color: #374151; font-size: 11px; margin: 0;">
                      This is an automated message. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ success: false, message: "RESEND_API_KEY not configured" }), 
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const resend = new Resend(RESEND_API_KEY);
    const { 
      orderId, 
      customerName, 
      customerEmail, 
      trackingNumber, 
      trackingProvider, 
      items, 
      totalAmount, 
      shippingAddress, 
      status 
    }: ShippingNotificationRequest = await req.json();

    console.log(`Sending ${status} notification for order ${orderId} to ${customerEmail}`);

    const isDelivered = status === "delivered";
    const subject = isDelivered 
      ? `✅ Order Delivered! #${orderId.slice(0, 8).toUpperCase()}` 
      : `🚚 Your Order Has Been Shipped! #${orderId.slice(0, 8).toUpperCase()}`;

    const html = getEmailTemplate(
      customerName,
      orderId,
      trackingNumber,
      trackingProvider,
      items,
      totalAmount,
      shippingAddress,
      isDelivered
    );

    const result = await resend.emails.send({
      from: "ASIREX <onboarding@resend.dev>",
      to: [customerEmail],
      subject,
      html,
    });

    console.log("Shipping notification sent successfully:", result);

    return new Response(JSON.stringify({ success: true, result }), { 
      status: 200, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  } catch (error: any) {
    console.error("Error sending shipping notification:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }
};

serve(handler);
