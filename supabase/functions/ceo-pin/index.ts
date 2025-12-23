import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Security constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const BCRYPT_ROUNDS = 10;

// Helper function to hash with bcrypt (bcryptjs is pure JS and works in edge runtime)
async function hashPin(pin: string): Promise<string> {
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS);
  return bcrypt.hashSync(pin, salt);
}

// Helper function to compare with bcrypt
function comparePin(pin: string, hash: string): boolean {
  return bcrypt.compareSync(pin, hash);
}

interface PinRequest {
  action: 'setup' | 'verify' | 'change';
  pin?: string;
  newPin?: string;
  currentPin?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[CEO-PIN] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('[CEO-PIN] User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`[CEO-PIN] Processing request for user: ${userId}`);

    // Create admin client for database operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user has super_admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (roleError) {
      console.error('[CEO-PIN] Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Authorization check failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.error('[CEO-PIN] User is not super_admin');
      return new Response(
        JSON.stringify({ error: 'Access denied. Super admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PinRequest = await req.json();
    const { action } = body;

    console.log(`[CEO-PIN] Action: ${action}`);

    // Get current security record
    const { data: securityData, error: securityError } = await supabaseAdmin
      .from('ceo_security')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (securityError) {
      console.error('[CEO-PIN] Security record fetch error:', securityError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check lockout status
    if (securityData?.locked_until) {
      const lockedUntil = new Date(securityData.locked_until);
      if (lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60));
        console.log(`[CEO-PIN] Account locked. ${remainingMinutes} minutes remaining`);
        return new Response(
          JSON.stringify({ 
            error: `Account locked. Try again in ${remainingMinutes} minutes.`,
            locked: true,
            remainingMinutes
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Clear lockout if expired
        await supabaseAdmin
          .from('ceo_security')
          .update({ locked_until: null, failed_attempts: 0 })
          .eq('user_id', userId);
      }
    }

    switch (action) {
      case 'setup': {
        const { pin } = body;
        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
          return new Response(
            JSON.stringify({ error: 'PIN must be exactly 6 digits' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if PIN already exists
        if (securityData?.pin_hash) {
          return new Response(
            JSON.stringify({ error: 'PIN already set. Use change action instead.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash the PIN with bcrypt
        const hashedPin = await hashPin(pin);
        console.log('[CEO-PIN] PIN hashed with bcrypt');

        const { error: insertError } = await supabaseAdmin
          .from('ceo_security')
          .upsert({
            user_id: userId,
            pin_hash: hashedPin,
            is_verified: true,
            last_verified_at: new Date().toISOString(),
            failed_attempts: 0,
            locked_until: null,
          });

        if (insertError) {
          console.error('[CEO-PIN] PIN setup error:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to set up PIN' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Log security event
        await supabaseAdmin.rpc('log_security_event', {
          p_user_id: userId,
          p_action_type: 'ceo_pin_setup',
          p_action_category: 'authentication',
          p_risk_level: 'low',
          p_details: { method: 'bcrypt' }
        });

        console.log('[CEO-PIN] PIN setup successful');
        return new Response(
          JSON.stringify({ success: true, message: 'PIN created successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify': {
        const { pin } = body;
        if (!pin || pin.length !== 6) {
          return new Response(
            JSON.stringify({ error: 'PIN must be exactly 6 digits' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!securityData?.pin_hash) {
          return new Response(
            JSON.stringify({ error: 'PIN not set up', needsSetup: true }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify PIN
        let isValid = false;
        try {
          // Check if it's a bcrypt hash (starts with $2)
          if (securityData.pin_hash.startsWith('$2')) {
            isValid = comparePin(pin, securityData.pin_hash);
            console.log('[CEO-PIN] Verified with bcrypt');
          } else {
            // Legacy SHA-256 hash - verify and upgrade
            const encoder = new TextEncoder();
            const data = encoder.encode(pin + userId);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const legacyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
            
            if (legacyHash === securityData.pin_hash) {
              isValid = true;
              // Upgrade to bcrypt
              const newHash = await hashPin(pin);
              await supabaseAdmin
                .from('ceo_security')
                .update({ pin_hash: newHash })
                .eq('user_id', userId);
              console.log('[CEO-PIN] Upgraded legacy hash to bcrypt');
            }
          }
        } catch (e) {
          console.error('[CEO-PIN] Hash verification error:', e);
          return new Response(
            JSON.stringify({ error: 'Verification failed' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!isValid) {
          // Increment failed attempts
          const newFailedAttempts = (securityData.failed_attempts || 0) + 1;
          const updateData: Record<string, unknown> = {
            failed_attempts: newFailedAttempts,
            last_failed_at: new Date().toISOString(),
          };

          // Lock account if max attempts reached
          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
            updateData.locked_until = lockUntil.toISOString();
            console.log(`[CEO-PIN] Account locked until ${lockUntil.toISOString()}`);
          }

          await supabaseAdmin
            .from('ceo_security')
            .update(updateData)
            .eq('user_id', userId);

          // Log failed attempt
          await supabaseAdmin.rpc('log_security_event', {
            p_user_id: userId,
            p_action_type: 'ceo_pin_failed',
            p_action_category: 'authentication',
            p_risk_level: newFailedAttempts >= MAX_FAILED_ATTEMPTS ? 'high' : 'medium',
            p_details: { attempts: newFailedAttempts, locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS }
          });

          const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
          return new Response(
            JSON.stringify({ 
              error: remainingAttempts > 0 
                ? `Invalid PIN. ${remainingAttempts} attempts remaining.`
                : `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
              remainingAttempts: Math.max(0, remainingAttempts),
              locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Success - reset failed attempts
        await supabaseAdmin
          .from('ceo_security')
          .update({
            is_verified: true,
            last_verified_at: new Date().toISOString(),
            failed_attempts: 0,
            locked_until: null,
          })
          .eq('user_id', userId);

        // Log successful verification
        await supabaseAdmin.rpc('log_security_event', {
          p_user_id: userId,
          p_action_type: 'ceo_pin_verified',
          p_action_category: 'authentication',
          p_risk_level: 'low',
          p_details: {}
        });

        console.log('[CEO-PIN] Verification successful');
        return new Response(
          JSON.stringify({ success: true, message: 'PIN verified successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'change': {
        const { currentPin, newPin } = body;
        
        if (!currentPin || currentPin.length !== 6 || !/^\d{6}$/.test(currentPin)) {
          return new Response(
            JSON.stringify({ error: 'Current PIN must be exactly 6 digits' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
          return new Response(
            JSON.stringify({ error: 'New PIN must be exactly 6 digits' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!securityData?.pin_hash) {
          return new Response(
            JSON.stringify({ error: 'PIN not set up' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify current PIN
        let isValid = false;
        if (securityData.pin_hash.startsWith('$2')) {
          isValid = comparePin(currentPin, securityData.pin_hash);
        } else {
          // Legacy hash check
          const encoder = new TextEncoder();
          const data = encoder.encode(currentPin + userId);
          const hashBuffer = await crypto.subtle.digest("SHA-256", data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const legacyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
          isValid = legacyHash === securityData.pin_hash;
        }

        if (!isValid) {
          // Increment failed attempts
          const newFailedAttempts = (securityData.failed_attempts || 0) + 1;
          const updateData: Record<string, unknown> = {
            failed_attempts: newFailedAttempts,
            last_failed_at: new Date().toISOString(),
          };

          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
            updateData.locked_until = lockUntil.toISOString();
          }

          await supabaseAdmin
            .from('ceo_security')
            .update(updateData)
            .eq('user_id', userId);

          const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts;
          return new Response(
            JSON.stringify({ 
              error: remainingAttempts > 0 
                ? `Current PIN is incorrect. ${remainingAttempts} attempts remaining.`
                : `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
              remainingAttempts: Math.max(0, remainingAttempts),
              locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Hash new PIN with bcrypt
        const hashedNewPin = await hashPin(newPin);

        const { error: updateError } = await supabaseAdmin
          .from('ceo_security')
          .update({
            pin_hash: hashedNewPin,
            updated_at: new Date().toISOString(),
            failed_attempts: 0,
            locked_until: null,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[CEO-PIN] PIN change error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update PIN' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Log PIN change
        await supabaseAdmin.rpc('log_security_event', {
          p_user_id: userId,
          p_action_type: 'ceo_pin_changed',
          p_action_category: 'authentication',
          p_risk_level: 'medium',
          p_details: { method: 'bcrypt' }
        });

        console.log('[CEO-PIN] PIN changed successfully');
        return new Response(
          JSON.stringify({ success: true, message: 'PIN changed successfully' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[CEO-PIN] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
