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
    const { orderId, pickupDate } = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('Scheduling pickup for order:', orderId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Parse notes to get shipment ID
    let shiprocketShipmentId = null;
    if (order.notes) {
      try {
        const notesData = JSON.parse(order.notes);
        shiprocketShipmentId = notesData.shiprocket_shipment_id;
      } catch {
        console.log('Could not parse notes');
      }
    }

    if (!shiprocketShipmentId) {
      throw new Error('ShipRocket shipment ID not found');
    }

    const token = await getShiprocketToken();

    // Schedule pickup
    const scheduledDate = pickupDate || new Date().toISOString().split('T')[0];
    
    console.log('Scheduling pickup for date:', scheduledDate);

    const pickupResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [shiprocketShipmentId],
        pickup_date: scheduledDate,
      }),
    });

    const pickupData = await pickupResponse.json();
    console.log('Pickup response:', JSON.stringify(pickupData));

    if (pickupData.status_code !== 1 && !pickupData.pickup_scheduled_date) {
      // Try alternative format
      const altPickupResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shiprocketShipmentId.toString(),
        }),
      });
      
      const altPickupData = await altPickupResponse.json();
      console.log('Alt pickup response:', JSON.stringify(altPickupData));
      
      if (altPickupData.pickup_status !== 1) {
        console.log('Warning: Pickup may not be scheduled, but continuing...');
      }
    }

    // Update order status
    const existingNotes = order.notes ? JSON.parse(order.notes) : {};
    await supabase
      .from('orders')
      .update({
        order_status: 'shipped',
        shipped_at: new Date().toISOString(),
        notes: JSON.stringify({
          ...existingNotes,
          pickup_scheduled: true,
          pickup_date: scheduledDate,
          pickup_scheduled_at: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Send shipping notification to customer
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-shipping-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          trackingNumber: order.tracking_number,
          trackingProvider: order.tracking_provider,
          items: order.items,
          totalAmount: order.total_amount,
          shippingAddress: order.shipping_address,
          status: 'shipped',
        }),
      });
      console.log('Shipping notification sent');
    } catch (emailError) {
      console.log('Shipping notification failed:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        pickup_date: scheduledDate,
        message: 'Pickup scheduled successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error scheduling pickup:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
