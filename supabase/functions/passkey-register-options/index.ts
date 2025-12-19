import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userName, userEmail } = await req.json();

    if (!userId || !userName || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get existing credentials for this user to exclude them
    const { data: existingCredentials } = await supabase
      .from('user_passkeys')
      .select('credential_id')
      .eq('user_id', userId);

    // Generate a random challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const challengeBase64 = btoa(String.fromCharCode(...challenge));

    // Store challenge temporarily (expires in 5 minutes)
    const challengeId = crypto.randomUUID();
    
    // WebAuthn registration options
    const registrationOptions = {
      challenge: challengeBase64,
      challengeId,
      rp: {
        name: "Asirex",
        id: new URL(req.headers.get('origin') || supabaseUrl).hostname,
      },
      user: {
        id: userId,
        name: userEmail,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "cross-platform",
        requireResidentKey: false,
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "none",
      excludeCredentials: existingCredentials?.map(cred => ({
        id: cred.credential_id,
        type: "public-key",
      })) || [],
    };

    console.log('Generated registration options for user:', userId);

    return new Response(
      JSON.stringify(registrationOptions),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error generating registration options:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
