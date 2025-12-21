import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base32ToBytes(base32: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanedInput = base32.toUpperCase().replace(/=+$/, "");
  
  let bits = "";
  for (const char of cleanedInput) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

async function verifyTOTP(secret: string, code: string, window = 1): Promise<boolean> {
  for (let i = -window; i <= window; i++) {
    const timeStep = 30;
    const counter = Math.floor(Date.now() / 1000 / timeStep) + i;
    
    const counterBytes = new ArrayBuffer(8);
    const view = new DataView(counterBytes);
    view.setBigUint64(0, BigInt(counter), false);
    
    try {
      const secretBytes = base32ToBytes(secret);
      const key = await crypto.subtle.importKey(
        "raw",
        secretBytes.buffer as ArrayBuffer,
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
      );
      
      const signature = await crypto.subtle.sign("HMAC", key, counterBytes);
      const signatureBytes = new Uint8Array(signature);
      
      const offset = signatureBytes[signatureBytes.length - 1] & 0x0f;
      const expectedCode = (
        ((signatureBytes[offset] & 0x7f) << 24) |
        ((signatureBytes[offset + 1] & 0xff) << 16) |
        ((signatureBytes[offset + 2] & 0xff) << 8) |
        (signatureBytes[offset + 3] & 0xff)
      ) % 1000000;
      
      if (expectedCode.toString().padStart(6, "0") === code) {
        return true;
      }
    } catch (error) {
      console.error("TOTP verification error:", error);
      continue;
    }
  }
  return false;
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code, isBackupCode } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limiting
    const { data: rateLimitOk } = await supabaseClient.rpc("check_rate_limit", {
      p_identifier: email,
      p_attempt_type: "2fa",
      p_max_attempts: 5,
      p_window_minutes: 15,
    });

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Too many failed attempts. Please try again in 15 minutes." 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user by email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
    const user = userData?.users.find(u => u.email === email);

    if (!user) {
      // Log failed attempt
      await supabaseClient.rpc("log_auth_attempt", {
        p_identifier: email,
        p_attempt_type: "2fa",
        p_success: false,
      });

      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get 2FA settings
    const { data: twoFaData, error: twoFaError } = await supabaseClient
      .from("user_2fa")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_enabled", true)
      .single();

    if (twoFaError || !twoFaData) {
      return new Response(
        JSON.stringify({ success: false, error: "2FA not enabled for this user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let isValid = false;

    if (isBackupCode) {
      // Check backup codes
      const codeHash = await hashCode(code.toUpperCase().replace(/[^A-Z0-9]/g, ""));
      const backupCodes = twoFaData.backup_codes_hash || [];
      const codeIndex = backupCodes.indexOf(codeHash);

      if (codeIndex !== -1) {
        isValid = true;
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        await supabaseClient
          .from("user_2fa")
          .update({ backup_codes_hash: backupCodes })
          .eq("user_id", user.id);
      }
    } else {
      // Verify TOTP
      const decryptedSecret = atob(twoFaData.totp_secret_encrypted);
      isValid = await verifyTOTP(decryptedSecret, code);
    }

    // Log the attempt
    await supabaseClient.rpc("log_auth_attempt", {
      p_identifier: email,
      p_attempt_type: "2fa",
      p_success: isValid,
    });

    if (isValid) {
      // Log successful 2FA verification
      await supabaseClient.from("activity_logs").insert({
        user_id: user.id,
        action_type: "2fa_verified",
        action_details: { method: isBackupCode ? "backup_code" : "totp" },
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid code" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("2FA verification error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
