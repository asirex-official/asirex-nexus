import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getShiprocketToken(): Promise<string> {
  const email = Deno.env.get('SHIPROCKET_EMAIL');
  const password = Deno.env.get('SHIPROCKET_TOKEN');

  if (!email || !password) {
    throw new Error('ShipRocket credentials not configured');
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`ShipRocket authentication failed: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('Cancelling ShipRocket order for:', orderId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details to get ShipRocket order ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Parse notes to get ShipRocket order ID
    let shiprocketOrderId: string | null = null;
    if (order.notes) {
      try {
        const notesData = JSON.parse(order.notes);
        shiprocketOrderId = notesData.shiprocket_order_id?.toString();
      } catch {
        console.log('Could not parse notes for ShipRocket ID');
      }
    }

    // If no ShipRocket order ID in notes, try tracking_number
    if (!shiprocketOrderId && order.tracking_number) {
      shiprocketOrderId = order.tracking_number;
    }

    if (!shiprocketOrderId) {
      console.log('No ShipRocket order ID found, skipping cancellation');
      return new Response(
        JSON.stringify({ success: true, message: 'No ShipRocket order to cancel' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ShipRocket token
    const token = await getShiprocketToken();

    // Cancel order in ShipRocket
    // First, try to cancel the shipment
    const cancelResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids: [shiprocketOrderId],
      }),
    });

    const cancelResult = await cancelResponse.json();
    console.log('ShipRocket cancel response:', cancelResult);

    // Update order in database
    await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        notes: JSON.stringify({
          ...JSON.parse(order.notes || '{}'),
          shiprocket_cancelled: true,
          cancelled_at: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order cancelled in ShipRocket',
        shiprocket_response: cancelResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error cancelling ShipRocket order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
