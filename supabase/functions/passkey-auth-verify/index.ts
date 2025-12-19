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
    const { userEmail, credential } = await req.json();

    if (!userEmail || !credential) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { id: credentialId } = credential;

    // Find the passkey
    const { data: passkey, error: passkeyError } = await supabase
      .from('user_passkeys')
      .select('*, user_id')
      .eq('credential_id', credentialId)
      .maybeSingle();

    if (passkeyError || !passkey) {
      return new Response(
        JSON.stringify({ error: 'Passkey not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user matches
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('user_id, name, designation, department, serial_number, role')
      .eq('email', userEmail)
      .maybeSingle();

    if (teamError || !teamMember || teamMember.user_id !== passkey.user_id) {
      return new Response(
        JSON.stringify({ error: 'Passkey does not belong to this user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last used timestamp and increment counter
    await supabase
      .from('user_passkeys')
      .update({ 
        last_used_at: new Date().toISOString(),
        counter: passkey.counter + 1 
      })
      .eq('id', passkey.id);

    // Get user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', passkey.user_id);

    console.log('Passkey authentication successful for user:', userEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: passkey.user_id,
        userInfo: {
          name: teamMember.name,
          title: teamMember.designation,
          department: teamMember.department,
          serialNumber: teamMember.serial_number,
          role: teamMember.role,
        },
        roles: roles?.map(r => r.role) || [],
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error verifying authentication:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
