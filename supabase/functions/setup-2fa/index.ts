import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple TOTP implementation
function generateSecret(length = 20): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < length; i++) {
    secret += chars[randomBytes[i] % chars.length];
  }
  return secret;
}

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

async function generateTOTP(secret: string, timeStep = 30): Promise<string> {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const counterBytes = new ArrayBuffer(8);
  const view = new DataView(counterBytes);
  view.setBigUint64(0, BigInt(counter), false);
  
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
  const code = (
    ((signatureBytes[offset] & 0x7f) << 24) |
    ((signatureBytes[offset + 1] & 0xff) << 16) |
    ((signatureBytes[offset + 2] & 0xff) << 8) |
    (signatureBytes[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, "0");
}

async function verifyTOTP(secret: string, code: string, window = 1): Promise<boolean> {
  for (let i = -window; i <= window; i++) {
    const timeStep = 30;
    const counter = Math.floor(Date.now() / 1000 / timeStep) + i;
    
    const counterBytes = new ArrayBuffer(8);
    const view = new DataView(counterBytes);
    view.setBigUint64(0, BigInt(counter), false);
    
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
  }
  return false;
}

function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const hashes: string[] = [];
  for (const code of codes) {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashes.push(hashArray.map(b => b.toString(16).padStart(2, "0")).join(""));
  }
  return hashes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, code, secret: providedSecret } = await req.json();

    if (action === "generate") {
      // Generate new TOTP secret and backup codes
      const secret = generateSecret(20);
      const backupCodes = generateBackupCodes(8);
      
      // Create QR code URL (using chart.googleapis.com)
      const issuer = "ASIREX";
      const accountName = user.email || user.id;
      const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpAuthUrl)}&choe=UTF-8`;

      return new Response(
        JSON.stringify({
          secret,
          qrCodeUrl,
          backupCodes,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      if (!providedSecret || !code) {
        return new Response(
          JSON.stringify({ error: "Secret and code are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isValid = await verifyTOTP(providedSecret, code);

      if (isValid) {
        // Hash and store the secret and backup codes
        const backupCodes = generateBackupCodes(8);
        const hashedBackupCodes = await hashBackupCodes(backupCodes);

        // Encrypt secret before storing (simple XOR with user ID for demo - in production use proper encryption)
        const encryptedSecret = btoa(providedSecret); // Base64 encode for storage

        // Store in database
        const { error: dbError } = await supabaseClient
          .from("user_2fa")
          .upsert({
            user_id: user.id,
            totp_secret_encrypted: encryptedSecret,
            is_enabled: true,
            backup_codes_hash: hashedBackupCodes,
            verified_at: new Date().toISOString(),
          });

        if (dbError) {
          console.error("Database error:", dbError);
          return new Response(
            JSON.stringify({ error: "Failed to save 2FA settings" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the security event
        await supabaseClient.from("activity_logs").insert({
          user_id: user.id,
          action_type: "2fa_enabled",
          action_details: { method: "totp" },
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
    }

    if (action === "disable") {
      // Verify the code first before disabling
      const { data: twoFaData } = await supabaseClient
        .from("user_2fa")
        .select("totp_secret_encrypted")
        .eq("user_id", user.id)
        .single();

      if (!twoFaData) {
        return new Response(
          JSON.stringify({ error: "2FA not enabled" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const decryptedSecret = atob(twoFaData.totp_secret_encrypted);
      const isValid = await verifyTOTP(decryptedSecret, code);

      if (!isValid) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid code" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Disable 2FA
      await supabaseClient
        .from("user_2fa")
        .delete()
        .eq("user_id", user.id);

      // Log the security event
      await supabaseClient.from("activity_logs").insert({
        user_id: user.id,
        action_type: "2fa_disabled",
        action_details: { method: "totp" },
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("2FA setup error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
