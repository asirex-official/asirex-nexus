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
    const { userEmail } = await req.json();

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email in team_members
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('email', userEmail)
      .maybeSingle();

    if (teamError || !teamMember?.user_id) {
      return new Response(
        JSON.stringify({ error: 'No passkey registered for this user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get registered passkeys for this user
    const { data: passkeys, error: passkeysError } = await supabase
      .from('user_passkeys')
      .select('credential_id')
      .eq('user_id', teamMember.user_id);

    if (passkeysError || !passkeys || passkeys.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No passkey registered for this user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a random challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const challengeBase64 = btoa(String.fromCharCode(...challenge));

    // WebAuthn authentication options
    const authenticationOptions = {
      challenge: challengeBase64,
      rpId: new URL(req.headers.get('origin') || supabaseUrl).hostname,
      allowCredentials: passkeys.map(pk => ({
        id: pk.credential_id,
        type: "public-key",
        transports: ["usb", "nfc", "ble"],
      })),
      userVerification: "preferred",
      timeout: 60000,
    };

    console.log('Generated authentication options for user:', userEmail);

    return new Response(
      JSON.stringify(authenticationOptions),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error generating auth options:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
