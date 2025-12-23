import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderCancellationRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number; }[];
  totalAmount: number;
  cancellationReason?: string;
  refundStatus?: "pending" | "processing" | "completed";
}

const getEmailTemplate = (
  customerName: string,
  orderId: string,
  items: { name: string; quantity: number; price: number; }[],
  totalAmount: number,
  cancellationReason: string | undefined,
  refundStatus: string
) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #374151;">
        <span style="color: #F3F4F6; font-weight: 500;">${item.name}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #374151; text-align: center;">
        <span style="color: #9CA3AF;">×${item.quantity}</span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #374151; text-align: right;">
        <span style="color: #EF4444; font-weight: 600; text-decoration: line-through;">₹${(item.price * item.quantity).toLocaleString()}</span>
      </td>
    </tr>
  `).join('');

  const refundStatusBadge = refundStatus === "completed" 
    ? '<span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">REFUNDED</span>'
    : refundStatus === "processing"
    ? '<span style="background: #F59E0B; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PROCESSING</span>'
    : '<span style="background: #6B7280; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PENDING</span>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Status Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 20px; text-align: center; border-radius: 16px 16px 0 0;">
              <span style="color: white; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ORDER CANCELLED</span>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(180deg, #111827 0%, #0F172A 100%); padding: 40px 32px; border-left: 1px solid #1F2937; border-right: 1px solid #1F2937;">
              
              <!-- Icon & Title -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                <h1 style="color: #F3F4F6; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Order Cancelled</h1>
                <p style="color: #9CA3AF; font-size: 16px; margin: 0;">We've cancelled your order as requested</p>
              </div>
              
              <!-- Greeting -->
              <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hi <strong style="color: #F3F4F6;">${customerName}</strong>,
              </p>
              <p style="color: #9CA3AF; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
                Your order <strong style="color: #EF4444;">#${orderId.slice(0, 8).toUpperCase()}</strong> has been successfully cancelled. 
                ${cancellationReason ? `<br><br><strong style="color: #9CA3AF;">Reason:</strong> <span style="color: #D1D5DB;">${cancellationReason}</span>` : ''}
              </p>
              
              <!-- Refund Status Box -->
              <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #374151;">
                <div style="text-align: center; margin-bottom: 16px;">
                  <span style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Refund Status</span>
                </div>
                <div style="text-align: center; margin-bottom: 16px;">
                  ${refundStatusBadge}
                </div>
                <div style="background: #111827; border-radius: 8px; padding: 16px; border: 1px solid #374151;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #9CA3AF; font-size: 14px;">Refund Amount</span>
                    <span style="color: #10B981; font-size: 24px; font-weight: 700;">₹${totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 12px; margin-bottom: 0;">
                  ${refundStatus === "completed" 
                    ? "Your refund has been processed successfully" 
                    : "Refund will be processed within 5-7 business days"}
                </p>
              </div>
              
              <!-- Cancelled Items Table -->
              <div style="background: #1F2937; border-radius: 12px; overflow: hidden; margin: 24px 0; border: 1px solid #374151;">
                <div style="padding: 16px; background: #111827; border-bottom: 1px solid #374151;">
                  <span style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Cancelled Items</span>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #111827;">
                      <th style="padding: 12px 16px; text-align: left; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                      <th style="padding: 12px 16px; text-align: center; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                      <th style="padding: 12px 16px; text-align: right; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                  <tfoot>
                    <tr style="background: #111827;">
                      <td colspan="2" style="padding: 16px; text-align: right; color: #9CA3AF; font-weight: 600;">Total Refund:</td>
                      <td style="padding: 16px; text-align: right; color: #10B981; font-size: 18px; font-weight: 700;">₹${totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <!-- Support Section -->
              <div style="background: linear-gradient(135deg, #1E3A5F 0%, #1E293B 100%); border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #3B82F6; text-align: center;">
                <p style="color: #93C5FD; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">Need Help?</p>
                <p style="color: #9CA3AF; font-size: 13px; margin: 0;">
                  If you have any questions about your cancellation or refund, please contact our support team.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0F172A; padding: 24px 32px; border-radius: 0 0 16px 16px; border: 1px solid #1F2937; border-top: none;">
              <table style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #4B5563; font-size: 12px; margin: 0 0 8px 0;">
                      This is an automated message from Asirex Technologies
                    </p>
                    <p style="color: #374151; font-size: 11px; margin: 0;">
                      © ${new Date().getFullYear()} Asirex Technologies. All rights reserved.
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
  console.log("Order cancellation notification function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);

    const { 
      orderId, 
      customerName, 
      customerEmail, 
      items, 
      totalAmount,
      cancellationReason,
      refundStatus = "pending"
    }: OrderCancellationRequest = await req.json();

    console.log(`Processing cancellation notification for order ${orderId} to ${customerEmail}`);

    // Validate required fields
    if (!orderId || !customerName || !customerEmail || !items || !totalAmount) {
      throw new Error("Missing required fields: orderId, customerName, customerEmail, items, and totalAmount are required");
    }

    const emailHtml = getEmailTemplate(
      customerName,
      orderId,
      items,
      totalAmount,
      cancellationReason,
      refundStatus
    );

    const emailResponse = await resend.emails.send({
      from: "Asirex Technologies <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Cancelled - #${orderId.slice(0, 8).toUpperCase()}`,
      html: emailHtml,
    });

    console.log("Cancellation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cancellation notification sent successfully",
        emailResponse
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-cancellation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
