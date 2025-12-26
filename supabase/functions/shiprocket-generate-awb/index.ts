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
    const { orderId, shipmentId } = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('Generating AWB for order:', orderId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order to get shipment details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Parse notes to get ShipRocket shipment ID
    let shiprocketShipmentId = shipmentId;
    if (!shiprocketShipmentId && order.notes) {
      try {
        const notesData = JSON.parse(order.notes);
        shiprocketShipmentId = notesData.shiprocket_shipment_id;
      } catch {
        console.log('Could not parse notes for shipment ID');
      }
    }

    if (!shiprocketShipmentId) {
      throw new Error('ShipRocket shipment ID not found. Create order first.');
    }

    const token = await getShiprocketToken();

    // Step 1: Get available couriers for the shipment
    console.log('Getting available couriers...');
    const couriersResponse = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=121102&delivery_postcode=${order.shipping_address?.match(/\d{6}/)?.[0] || '110001'}&weight=0.5&cod=${order.payment_method === 'cod' ? 1 : 0}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const couriersData = await couriersResponse.json();
    console.log('Couriers response:', JSON.stringify(couriersData));

    // Select cheapest available courier
    let courierId = null;
    if (couriersData.data?.available_courier_companies?.length > 0) {
      const sortedCouriers = couriersData.data.available_courier_companies.sort(
        (a: any, b: any) => a.rate - b.rate
      );
      courierId = sortedCouriers[0].courier_company_id;
      console.log('Selected courier:', sortedCouriers[0].courier_name, 'ID:', courierId);
    }

    if (!courierId) {
      throw new Error('No courier available for this shipment');
    }

    // Step 2: Generate AWB
    console.log('Generating AWB...');
    const awbResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: shiprocketShipmentId,
        courier_id: courierId,
      }),
    });

    const awbData = await awbResponse.json();
    console.log('AWB response:', JSON.stringify(awbData));

    if (!awbData.response?.data?.awb_code) {
      throw new Error(awbData.message || 'Failed to generate AWB');
    }

    const awbCode = awbData.response.data.awb_code;
    const courierName = awbData.response.data.courier_name;

    // Update order with AWB details
    const existingNotes = order.notes ? JSON.parse(order.notes) : {};
    await supabase
      .from('orders')
      .update({
        tracking_number: awbCode,
        tracking_provider: courierName || 'ShipRocket',
        order_status: 'processing',
        notes: JSON.stringify({
          ...existingNotes,
          awb_code: awbCode,
          courier_name: courierName,
          courier_id: courierId,
          awb_generated_at: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    console.log('AWB generated successfully:', awbCode);

    return new Response(
      JSON.stringify({
        success: true,
        awb_code: awbCode,
        courier_name: courierName,
        courier_id: courierId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error generating AWB:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
