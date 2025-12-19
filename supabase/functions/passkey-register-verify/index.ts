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
    const { userId, credential, deviceName } = await req.json();

    if (!userId || !credential) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract credential data
    const { id: credentialId, response: credentialResponse } = credential;

    if (!credentialId || !credentialResponse) {
      return new Response(
        JSON.stringify({ error: 'Invalid credential format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the public key credential
    const { error: insertError } = await supabase
      .from('user_passkeys')
      .insert({
        user_id: userId,
        credential_id: credentialId,
        public_key: JSON.stringify(credentialResponse),
        device_name: deviceName || 'USB Security Key',
        counter: 0,
      });

    if (insertError) {
      console.error('Error storing passkey:', insertError);
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'This passkey is already registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw insertError;
    }

    console.log('Passkey registered successfully for user:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Passkey registered successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error verifying registration:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
