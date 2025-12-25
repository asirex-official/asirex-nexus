import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map ShipRocket status to our delivery status
function mapDeliveryStatus(srStatus: string): string {
  const statusMap: Record<string, string> = {
    'PICKUP SCHEDULED': 'processing',
    'PICKUP QUEUED': 'processing',
    'PICKED UP': 'shipped',
    'IN TRANSIT': 'in_transit',
    'OUT FOR DELIVERY': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'UNDELIVERED': 'failed_delivery',
    'RTO INITIATED': 'returning',
    'RTO DELIVERED': 'returned',
    'CANCELLED': 'cancelled',
    'LOST': 'lost',
  };

  return statusMap[srStatus.toUpperCase()] || 'processing';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('ShipRocket webhook received:', JSON.stringify(payload, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract data from webhook
    const {
      order_id,
      awb,
      current_status,
      current_status_id,
      shipment_id,
      etd,
      courier_name,
    } = payload;

    if (!order_id && !shipment_id) {
      console.log('No order_id or shipment_id in webhook');
      return new Response(
        JSON.stringify({ success: true, message: 'No order to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deliveryStatus = mapDeliveryStatus(current_status || '');
    console.log(`Updating order ${order_id} to status: ${deliveryStatus}`);

    // Find the order by tracking number or order ID
    let query = supabase.from('orders').select('id, order_status, delivery_status');
    
    if (shipment_id) {
      query = query.eq('tracking_number', shipment_id.toString());
    } else if (order_id) {
      // Order ID in ShipRocket might be truncated, search by prefix
      query = query.ilike('id', `${order_id}%`);
    }

    const { data: orders, error: findError } = await query;

    if (findError) {
      console.error('Error finding order:', findError);
      throw findError;
    }

    if (!orders || orders.length === 0) {
      console.log('No matching order found');
      return new Response(
        JSON.stringify({ success: true, message: 'No matching order found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderToUpdate = orders[0];

    // Update order status
    const updateData: any = {
      delivery_status: deliveryStatus,
      updated_at: new Date().toISOString(),
    };

    if (awb) {
      updateData.tracking_number = awb;
    }

    if (deliveryStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
      updateData.order_status = 'completed';
    } else if (deliveryStatus === 'shipped' || deliveryStatus === 'in_transit') {
      updateData.order_status = 'shipped';
      if (!orderToUpdate.order_status || orderToUpdate.order_status === 'processing') {
        updateData.shipped_at = new Date().toISOString();
      }
    } else if (deliveryStatus === 'cancelled' || deliveryStatus === 'returned') {
      updateData.order_status = 'cancelled';
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderToUpdate.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log(`Order ${orderToUpdate.id} updated successfully to ${deliveryStatus}`);

    // Send notification to user about status update
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, customer_email')
        .eq('id', orderToUpdate.id)
        .single();

      if (order?.user_id) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Order Update',
          message: `Your order status: ${current_status}`,
          type: 'order',
          link: `/track-order?orderId=${orderToUpdate.id}`,
        });
      }
    } catch (e) {
      console.error('Failed to send notification:', e);
    }

    return new Response(
      JSON.stringify({ success: true, updated_order: orderToUpdate.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
