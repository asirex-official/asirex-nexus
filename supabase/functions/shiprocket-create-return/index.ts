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
    const { orderId, complaintId, isReplacement = false } = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('Creating ShipRocket return pickup for:', orderId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Get ShipRocket token
    const token = await getShiprocketToken();

    // Parse shipping address
    const addressParts = order.shipping_address?.split(',').map((p: string) => p.trim()) || [];
    const items = Array.isArray(order.items) ? order.items : [];

    // Prepare return order items
    const returnItems = items.map((item: any) => ({
      name: item.name || 'Product',
      sku: item.id || `SKU-${Date.now()}`,
      units: item.quantity || 1,
      selling_price: item.price || 0,
      discount: 0,
      tax: 0,
      hsn: '',
    }));

    // Create return order payload
    const returnOrder = {
      order_id: `RET-${order.id.substring(0, 15)}`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      channel_id: '',
      billing_customer_name: order.customer_name?.split(' ')[0] || 'Customer',
      billing_last_name: order.customer_name?.split(' ').slice(1).join(' ') || '',
      billing_address: addressParts[0] || 'Address',
      billing_address_2: addressParts[1] || '',
      billing_city: addressParts[2] || 'City',
      billing_pincode: addressParts.find((p: string) => /^\d{6}$/.test(p)) || '110001',
      billing_state: addressParts[3] || 'Delhi',
      billing_country: 'India',
      billing_email: order.customer_email || 'customer@example.com',
      billing_phone: order.customer_phone?.replace(/\D/g, '').slice(-10) || '9999999999',
      shipping_is_billing: true,
      order_items: returnItems,
      payment_method: 'PREPAID', // Return pickups are always prepaid
      sub_total: order.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    console.log('ShipRocket return payload:', JSON.stringify(returnOrder, null, 2));

    // Create return order in ShipRocket
    const createResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(returnOrder),
    });

    const createResult = await createResponse.json();
    console.log('ShipRocket return create response:', createResult);

    if (!createResponse.ok || createResult.status_code === 0) {
      throw new Error(createResult.message || 'Failed to create ShipRocket return order');
    }

    // Update complaint with pickup info
    if (complaintId) {
      await supabase
        .from('order_complaints')
        .update({
          pickup_status: 'scheduled',
          pickup_scheduled_at: new Date().toISOString(),
          pickup_attempt_number: 1,
          admin_notes: `ShipRocket return created. Return Order ID: ${createResult.order_id || createResult.shipment_id}`,
          return_status: 'pickup_scheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);
    }

    // Update order status
    await supabase
      .from('orders')
      .update({
        returning_to_provider: true,
        notes: JSON.stringify({
          ...JSON.parse(order.notes || '{}'),
          return_order_id: createResult.order_id,
          return_shipment_id: createResult.shipment_id,
          return_created_at: new Date().toISOString(),
          is_replacement: isReplacement,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        return_order_id: createResult.order_id,
        return_shipment_id: createResult.shipment_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating ShipRocket return:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
