import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map ShipRocket status to internal status
function mapDeliveryStatus(srStatus: string): string {
  const statusMap: Record<string, string> = {
    'PICKUP SCHEDULED': 'pickup_scheduled',
    'PICKUP QUEUED': 'pickup_scheduled',
    'PICKED UP': 'picked_up',
    'IN TRANSIT': 'in_transit',
    'OUT FOR DELIVERY': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'RTO INITIATED': 'rto_initiated',
    'RTO IN TRANSIT': 'rto_in_transit',
    'RTO DELIVERED': 'rto_delivered',
    'CANCELLED': 'cancelled',
    'LOST': 'lost',
    'DAMAGED': 'damaged',
    'UNDELIVERED': 'undelivered',
    'PENDING': 'pending',
    'SHIPPED': 'shipped',
  };
  return statusMap[srStatus?.toUpperCase()] || srStatus?.toLowerCase() || 'unknown';
}

// Map to order status
function mapToOrderStatus(srStatus: string): string | null {
  const status = srStatus?.toUpperCase();
  if (status === 'DELIVERED') return 'delivered';
  if (status === 'CANCELLED' || status === 'RTO DELIVERED') return 'cancelled';
  if (['PICKED UP', 'IN TRANSIT', 'OUT FOR DELIVERY', 'SHIPPED'].includes(status)) return 'shipped';
  if (status === 'RTO INITIATED' || status === 'RTO IN TRANSIT' || status === 'UNDELIVERED') return 'shipped';
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('ShipRocket webhook received:', JSON.stringify(payload));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract data from webhook
    const orderId = payload.order_id?.toString();
    const awb = payload.awb?.toString();
    const currentStatus = payload.current_status || payload.status;
    const courierName = payload.courier_name;
    const etd = payload.etd;
    const shipmentId = payload.shipment_id?.toString();

    console.log('Processing status update:', { orderId, awb, currentStatus, shipmentId });

    if (!orderId && !awb && !shipmentId) {
      console.log('No identifiers in webhook');
      return new Response(
        JSON.stringify({ success: true, message: 'No order identifiers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find order by AWB, shipment ID, or order ID
    let order = null;
    
    // Try by tracking number (AWB)
    if (awb) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', awb)
        .single();
      order = data;
    }

    // Try by shipment ID in tracking_number
    if (!order && shipmentId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', shipmentId)
        .single();
      order = data;
    }

    // Try by order ID in notes
    if (!order && orderId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .ilike('notes', `%"shiprocket_order_id":${orderId}%`)
        .maybeSingle();
      order = data;
      
      if (!order) {
        const { data: data2 } = await supabase
          .from('orders')
          .select('*')
          .ilike('notes', `%"shiprocket_order_id":"${orderId}"%`)
          .maybeSingle();
        order = data2;
      }
    }

    // Try by order ID prefix
    if (!order && orderId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', `${orderId}%`)
        .maybeSingle();
      order = data;
    }

    if (!order) {
      console.log('Order not found for webhook:', { orderId, awb, shipmentId });
      return new Response(
        JSON.stringify({ success: false, message: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found order:', order.id, 'Current status:', order.order_status);

    // Map status
    const deliveryStatus = mapDeliveryStatus(currentStatus);
    const orderStatus = mapToOrderStatus(currentStatus);

    // Prepare update
    const updates: Record<string, any> = {
      delivery_status: deliveryStatus,
      updated_at: new Date().toISOString(),
    };

    if (awb && !order.tracking_number) {
      updates.tracking_number = awb;
    }

    if (courierName && (!order.tracking_provider || order.tracking_provider === 'ShipRocket')) {
      updates.tracking_provider = courierName;
    }

    // Handle DELIVERED
    if (currentStatus?.toUpperCase() === 'DELIVERED') {
      updates.order_status = 'delivered';
      updates.delivered_at = new Date().toISOString();
      
      // Send delivery notification
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
            trackingNumber: order.tracking_number || awb,
            trackingProvider: order.tracking_provider || courierName,
            items: order.items,
            totalAmount: order.total_amount,
            shippingAddress: order.shipping_address,
            status: 'delivered',
          }),
        });
        console.log('Delivery notification sent');
      } catch (e) {
        console.log('Delivery notification failed:', e);
      }

      // Create in-app notification
      if (order.user_id) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Order Delivered! 📦',
          message: `Your order has been delivered successfully. We hope you enjoy your purchase!`,
          type: 'order',
          link: '/track-order',
        });
      }
    }

    // Handle RTO (Return to Origin)
    if (['RTO INITIATED', 'RTO IN TRANSIT'].includes(currentStatus?.toUpperCase())) {
      updates.returning_to_provider = true;
      updates.return_reason = 'Delivery failed - returning to sender';
      
      if (order.user_id) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Delivery Issue ⚠️',
          message: `Your order could not be delivered and is being returned. Please contact support for assistance.`,
          type: 'order',
          link: '/track-order',
        });
      }
    }

    // Handle RTO Delivered (package returned to seller)
    if (currentStatus?.toUpperCase() === 'RTO DELIVERED') {
      updates.order_status = 'cancelled';
      updates.returning_to_provider = false;
      updates.return_reason = 'Returned to sender - delivery failed';

      // For prepaid orders, initiate refund
      if (order.payment_method !== 'cod' && order.payment_status === 'paid') {
        console.log('RTO Delivered for prepaid order - initiating refund');
        
        await supabase.from('order_complaints').insert({
          order_id: order.id,
          user_id: order.user_id,
          complaint_type: 'auto_rto_refund',
          description: 'Order returned to sender - automatic refund initiated',
          refund_status: 'pending',
          refund_method: 'original_method',
        });

        if (order.user_id) {
          await supabase.from('notifications').insert({
            user_id: order.user_id,
            title: 'Refund Initiated 💰',
            message: `Your order was returned to us. A refund of ₹${order.total_amount} has been initiated and will be processed within 5-7 business days.`,
            type: 'refund',
            link: '/track-order',
          });
        }
      } else if (order.payment_method === 'cod') {
        if (order.user_id) {
          await supabase.from('notifications').insert({
            user_id: order.user_id,
            title: 'Order Cancelled',
            message: `Your COD order was returned to us after delivery attempts failed. No charges were applied.`,
            type: 'order',
            link: '/track-order',
          });
        }
      }
    }

    // Handle UNDELIVERED - record failed attempt
    if (currentStatus?.toUpperCase() === 'UNDELIVERED') {
      const existingAttempts = await supabase
        .from('delivery_attempts')
        .select('attempt_number')
        .eq('order_id', order.id)
        .order('attempt_number', { ascending: false })
        .limit(1);

      const attemptNumber = (existingAttempts.data?.[0]?.attempt_number || 0) + 1;

      await supabase.from('delivery_attempts').insert({
        order_id: order.id,
        attempt_number: attemptNumber,
        scheduled_date: new Date().toISOString().split('T')[0],
        status: 'failed',
        failure_reason: payload.comment || payload.scans?.[0]?.location || 'Delivery attempt failed',
        attempted_at: new Date().toISOString(),
      });

      updates.delivery_status = 'failed';

      if (order.user_id) {
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: 'Delivery Attempt Failed',
          message: `Delivery attempt #${attemptNumber} was unsuccessful. The courier will try again.`,
          type: 'order',
          link: '/track-order',
        });
      }
    }

    // Update order status if mapped
    if (orderStatus && !updates.order_status) {
      updates.order_status = orderStatus;
    }

    // Merge with existing notes
    const existingNotes = order.notes ? JSON.parse(order.notes) : {};
    updates.notes = JSON.stringify({
      ...existingNotes,
      last_webhook_status: currentStatus,
      last_webhook_at: new Date().toISOString(),
      etd: etd || existingNotes.etd,
    });

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order updated successfully:', order.id, 'Status:', deliveryStatus);

    return new Response(
      JSON.stringify({ success: true, order_id: order.id, status: deliveryStatus }),
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
