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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "RESEND_API_KEY not configured" }), 
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const resend = new Resend(RESEND_API_KEY);
    const { orderId, customerName, customerEmail, trackingNumber, trackingProvider, items, totalAmount, shippingAddress, status }: ShippingNotificationRequest = await req.json();

    console.log(`Sending ${status} notification for order ${orderId}`);

    const isDelivered = status === "delivered";
    const itemsList = items.map(i => `${i.name} x${i.quantity}: ₹${i.price * i.quantity}`).join("<br>");

    const result = await resend.emails.send({
      from: "Asirex <onboarding@resend.dev>",
      to: [customerEmail],
      subject: isDelivered ? `Order Delivered! #${orderId.slice(0,8)}` : `Order Shipped! #${orderId.slice(0,8)}`,
      html: `<h1>${isDelivered ? "Order Delivered!" : "Order Shipped!"}</h1><p>Hi ${customerName},</p>${trackingNumber ? `<p>Tracking: ${trackingProvider} - ${trackingNumber}</p>` : ""}<p>Items:<br>${itemsList}</p><p><strong>Total: ₹${totalAmount}</strong></p><p>Address: ${shippingAddress}</p>`,
    });

    return new Response(JSON.stringify({ success: true, result }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
