import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  totalAmount: number;
  paymentMethod: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderNotificationRequest = await req.json();
    
    console.log("Order notification received:", {
      orderId: data.orderId,
      customerName: data.customerName,
      totalAmount: data.totalAmount,
    });

    // For now, log the order - email sending will be enabled when RESEND_API_KEY is added
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      // Send notification to business email
      const businessEmail = "asirex.official@gmail.com";
      
      const itemsList = data.items.map(item => 
        `<tr><td style="padding:8px;border:1px solid #ddd;">${item.name}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${item.price.toLocaleString()}</td></tr>`
      ).join('');

      // Email to business
      await resend.emails.send({
        from: "ASIREX Orders <orders@resend.dev>",
        to: [businessEmail],
        subject: `New Order #${data.orderId.slice(0, 8)} - ₹${data.totalAmount.toLocaleString()}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#10b981;">🛒 New Order Received!</h2>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            <p><strong>Payment:</strong> ${data.paymentMethod.toUpperCase()}</p>
            
            <h3>Shipping Address</h3>
            <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${data.shippingAddress}</p>
            
            <h3>Order Items</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:#f0f0f0;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Item</th><th style="padding:8px;border:1px solid #ddd;">Qty</th><th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th></tr></thead>
              <tbody>${itemsList}</tbody>
            </table>
            
            <p style="font-size:18px;margin-top:16px;"><strong>Total: ₹${data.totalAmount.toLocaleString()}</strong></p>
          </div>
        `,
      });

      // Confirmation email to customer
      if (data.customerEmail) {
        await resend.emails.send({
          from: "ASIREX <orders@resend.dev>",
          to: [data.customerEmail],
          subject: `Order Confirmed - ASIREX #${data.orderId.slice(0, 8)}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#10b981;">✅ Order Confirmed!</h2>
              <p>Hi ${data.customerName},</p>
              <p>Thank you for your order! We've received your order and are preparing it for shipment.</p>
              
              <p><strong>Order ID:</strong> ${data.orderId.slice(0, 8)}</p>
              <p><strong>Total:</strong> ₹${data.totalAmount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : data.paymentMethod.toUpperCase()}</p>
              
              <h3>Shipping To</h3>
              <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${data.shippingAddress}</p>
              
              <p>We'll notify you once your order is shipped.</p>
              <p style="margin-top:24px;">Thanks for shopping with ASIREX!</p>
              <p style="color:#888;">Team ASIREX</p>
            </div>
          `,
        });
      }

      console.log("Order notification emails sent successfully");
      return new Response(JSON.stringify({ success: true, emailsSent: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If no API key, just log and return success
    console.log("RESEND_API_KEY not configured - email notifications disabled");
    return new Response(JSON.stringify({ success: true, emailsSent: false, message: "Email API key not configured" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-order-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);