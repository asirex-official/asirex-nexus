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

    console.log('Creating ShipRocket order for:', order.id);

    // Get ShipRocket token
    const token = await getShiprocketToken();

    // Parse shipping address
    const addressParts = order.shipping_address?.split(',').map((p: string) => p.trim()) || [];
    const items = Array.isArray(order.items) ? order.items : [];

    // Prepare order items for ShipRocket
    const orderItems = items.map((item: any) => ({
      name: item.name || 'Product',
      sku: item.id || `SKU-${Date.now()}`,
      units: item.quantity || 1,
      selling_price: item.price || 0,
      discount: 0,
      tax: 0,
      hsn: '',
    }));

    // Create ShipRocket order payload
    const shiprocketOrder = {
      order_id: order.id.substring(0, 20), // ShipRocket has 20 char limit
      order_date: new Date(order.created_at).toISOString().split('T')[0],
      pickup_location: 'Primary', // Configure this in ShipRocket dashboard
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
      order_items: orderItems,
      payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    console.log('ShipRocket payload:', JSON.stringify(shiprocketOrder, null, 2));

    // Create order in ShipRocket
    const createResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketOrder),
    });

    const createResult = await createResponse.json();
    console.log('ShipRocket create response:', createResult);

    if (!createResponse.ok || createResult.status_code === 0) {
      throw new Error(createResult.message || 'Failed to create ShipRocket order');
    }

    // Update order with ShipRocket details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number: createResult.shipment_id?.toString() || createResult.order_id?.toString(),
        tracking_provider: 'ShipRocket',
        order_status: 'processing',
        notes: JSON.stringify({
          shiprocket_order_id: createResult.order_id,
          shiprocket_shipment_id: createResult.shipment_id,
          channel_order_id: createResult.channel_order_id,
        }),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        shiprocket_order_id: createResult.order_id,
        shipment_id: createResult.shipment_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating ShipRocket order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
