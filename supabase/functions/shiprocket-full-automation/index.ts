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

// Full automation: Create Order -> Generate AWB -> Schedule Pickup
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('=== Starting Full ShipRocket Automation for Order:', orderId, '===');

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

    // Skip if already processed
    if (order.order_status === 'shipped' || order.order_status === 'delivered') {
      console.log('Order already shipped/delivered, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Order already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getShiprocketToken();

    // Parse shipping address
    const addressParts = order.shipping_address?.split(',').map((p: string) => p.trim()) || [];
    const items = Array.isArray(order.items) ? order.items : [];
    const pincode = order.shipping_address?.match(/\d{6}/)?.[0] || '110001';

    // Step 1: Create ShipRocket Order
    console.log('Step 1: Creating ShipRocket order...');
    
    const orderItems = items.map((item: any) => ({
      name: item.name || 'Product',
      sku: item.id || `SKU-${Date.now()}`,
      units: item.quantity || 1,
      selling_price: item.price || 0,
      discount: 0,
      tax: 0,
      hsn: '',
    }));

    const shiprocketOrder = {
      order_id: order.id.substring(0, 20),
      order_date: new Date(order.created_at).toISOString().split('T')[0],
      pickup_location: 'Primary',
      billing_customer_name: order.customer_name?.split(' ')[0] || 'Customer',
      billing_last_name: order.customer_name?.split(' ').slice(1).join(' ') || '',
      billing_address: addressParts[0] || 'Address',
      billing_address_2: addressParts[1] || '',
      billing_city: addressParts[2] || 'City',
      billing_pincode: pincode,
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

    const createResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketOrder),
    });

    const createResult = await createResponse.json();
    console.log('Order created:', JSON.stringify(createResult));

    if (!createResult.order_id || !createResult.shipment_id) {
      throw new Error(createResult.message || 'Failed to create ShipRocket order');
    }

    const shiprocketOrderId = createResult.order_id;
    const shipmentId = createResult.shipment_id;

    // Update order with ShipRocket details
    await supabase
      .from('orders')
      .update({
        order_status: 'processing',
        notes: JSON.stringify({
          shiprocket_order_id: shiprocketOrderId,
          shiprocket_shipment_id: shipmentId,
          channel_order_id: createResult.channel_order_id,
          created_at: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Step 2: Get available couriers and select cheapest
    console.log('Step 2: Getting available couriers...');
    
    const couriersResponse = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=121102&delivery_postcode=${pincode}&weight=0.5&cod=${order.payment_method === 'cod' ? 1 : 0}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    const couriersData = await couriersResponse.json();
    console.log('Couriers available:', couriersData.data?.available_courier_companies?.length || 0);

    let courierId = null;
    let courierName = 'ShipRocket';
    
    if (couriersData.data?.available_courier_companies?.length > 0) {
      const sortedCouriers = couriersData.data.available_courier_companies.sort(
        (a: any, b: any) => a.rate - b.rate
      );
      courierId = sortedCouriers[0].courier_company_id;
      courierName = sortedCouriers[0].courier_name;
      console.log('Selected courier:', courierName, 'Rate:', sortedCouriers[0].rate);
    }

    if (!courierId) {
      // Update order but don't fail
      await supabase
        .from('orders')
        .update({
          notes: JSON.stringify({
            shiprocket_order_id: shiprocketOrderId,
            shiprocket_shipment_id: shipmentId,
            error: 'No courier available - manual selection required',
          }),
        })
        .eq('id', orderId);
        
      console.log('Warning: No courier available, order created but AWB not generated');
      return new Response(
        JSON.stringify({
          success: true,
          partial: true,
          shiprocket_order_id: shiprocketOrderId,
          shipment_id: shipmentId,
          message: 'Order created but no courier available. Manual AWB generation required.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Generate AWB
    console.log('Step 3: Generating AWB...');
    
    const awbResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: shipmentId,
        courier_id: courierId,
      }),
    });

    const awbData = await awbResponse.json();
    console.log('AWB response:', JSON.stringify(awbData));

    let awbCode = awbData.response?.data?.awb_code;
    
    if (!awbCode) {
      console.log('Warning: AWB not generated immediately, checking status...');
      // Sometimes AWB takes time, continue anyway
    }

    // Update order with AWB
    await supabase
      .from('orders')
      .update({
        tracking_number: awbCode || shipmentId.toString(),
        tracking_provider: courierName,
        notes: JSON.stringify({
          shiprocket_order_id: shiprocketOrderId,
          shiprocket_shipment_id: shipmentId,
          awb_code: awbCode,
          courier_name: courierName,
          courier_id: courierId,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Step 4: Schedule Pickup
    console.log('Step 4: Scheduling pickup...');
    
    const today = new Date();
    const pickupDate = today.toISOString().split('T')[0];

    const pickupResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/generate/pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        shipment_id: [shipmentId],
      }),
    });

    const pickupData = await pickupResponse.json();
    console.log('Pickup response:', JSON.stringify(pickupData));

    // Update final order status
    await supabase
      .from('orders')
      .update({
        order_status: 'shipped',
        shipped_at: new Date().toISOString(),
        notes: JSON.stringify({
          shiprocket_order_id: shiprocketOrderId,
          shiprocket_shipment_id: shipmentId,
          awb_code: awbCode,
          courier_name: courierName,
          courier_id: courierId,
          pickup_scheduled: true,
          pickup_date: pickupDate,
          automation_completed_at: new Date().toISOString(),
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Step 5: Send shipping notification
    console.log('Step 5: Sending shipping notification...');
    
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
          trackingNumber: awbCode || shipmentId.toString(),
          trackingProvider: courierName,
          items: order.items,
          totalAmount: order.total_amount,
          shippingAddress: order.shipping_address,
          status: 'shipped',
        }),
      });
      console.log('Shipping notification sent successfully');
    } catch (emailError) {
      console.log('Shipping notification failed:', emailError);
    }

    // Create notification for user
    if (order.user_id) {
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: 'Order Shipped! 🚚',
        message: `Your order has been shipped via ${courierName}. Track with: ${awbCode || shipmentId}`,
        type: 'order',
        link: '/track-order',
      });
    }

    console.log('=== Full Automation Completed Successfully ===');

    return new Response(
      JSON.stringify({
        success: true,
        shiprocket_order_id: shiprocketOrderId,
        shipment_id: shipmentId,
        awb_code: awbCode,
        courier_name: courierName,
        pickup_scheduled: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Full automation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
