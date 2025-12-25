import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ShipRocket API requires token-based authentication
// Token is valid for 10 days, so we cache it
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid (with 1 hour buffer)
  if (cachedToken && tokenExpiry > now + 3600000) {
    return cachedToken;
  }

  const email = Deno.env.get('SHIPROCKET_EMAIL');
  const password = Deno.env.get('SHIPROCKET_TOKEN');

  if (!email || !password) {
    throw new Error('ShipRocket credentials not configured');
  }

  console.log('Authenticating with ShipRocket...');

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('ShipRocket auth failed:', error);
    throw new Error(`ShipRocket authentication failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  // Token valid for 10 days, set expiry to 9 days
  tokenExpiry = now + (9 * 24 * 60 * 60 * 1000);

  console.log('ShipRocket authentication successful');
  return cachedToken!;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = await getShiprocketToken();
    
    return new Response(
      JSON.stringify({ success: true, token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
