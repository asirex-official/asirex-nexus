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
    const url = new URL(req.url);
    const shipmentId = url.searchParams.get('shipment_id');
    const orderId = url.searchParams.get('order_id');

    if (!shipmentId && !orderId) {
      throw new Error('Either shipment_id or order_id is required');
    }

    const token = await getShiprocketToken();

    let trackingData;

    if (shipmentId) {
      // Track by shipment ID
      const response = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tracking info');
      }

      trackingData = await response.json();
    } else {
      // Track by order ID (channel order ID)
      const response = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tracking info');
      }

      trackingData = await response.json();
    }

    console.log('Tracking data:', trackingData);

    // Parse tracking activities
    const activities = trackingData?.tracking_data?.shipment_track_activities || [];
    const currentStatus = trackingData?.tracking_data?.shipment_track?.[0] || {};

    return new Response(
      JSON.stringify({
        success: true,
        tracking: {
          current_status: currentStatus.current_status,
          delivered_date: currentStatus.delivered_date,
          edd: currentStatus.edd,
          courier_name: currentStatus.courier_name,
          awb_code: currentStatus.awb_code,
          activities: activities.map((a: any) => ({
            date: a.date,
            status: a['sr-status'],
            activity: a.activity,
            location: a.location,
          })),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error tracking shipment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
