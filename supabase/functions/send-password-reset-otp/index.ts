import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetOTPRequest {
  email: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetOTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending password reset OTP to ${email}`);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists using listUsers with filter
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    
    const user = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (userError || !user) {
      // Don't reveal if user exists or not for security
      console.log("User not found, but returning success for security");
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset code has been sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const fullName = user.user_metadata?.full_name || "User";

    // Delete any existing OTPs for this email
    await supabase.from("signup_otps").delete().eq("email", email.toLowerCase());

    // Insert new OTP (reusing signup_otps table with a flag)
    const { error: insertError } = await supabase.from("signup_otps").insert({
      email: email.toLowerCase(),
      otp_hash: await hashOTP(otp),
      expires_at: expiresAt.toISOString(),
      full_name: fullName,
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send OTP email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Security <noreply@asirex.in>",
        to: [email],
        subject: "🔐 ASIREX Password Reset Code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #ffffff; margin: 0; padding: 0; }
              .wrapper { background: linear-gradient(180deg, #030712 0%, #0f172a 100%); min-height: 100%; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .security-banner { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px 24px; text-align: center; border-radius: 16px 16px 0 0; }
              .security-icon { font-size: 36px; display: block; margin-bottom: 8px; }
              .security-text { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
              .header { text-align: center; padding: 32px 0 24px; }
              .logo { font-size: 38px; font-weight: 800; background: linear-gradient(135deg, #10b981, #22d3ee, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; }
              .tagline { color: #94a3b8; font-size: 13px; margin-top: 10px; letter-spacing: 2px; text-transform: uppercase; }
              .content { background: linear-gradient(145deg, rgba(245, 158, 11, 0.08), rgba(139, 92, 246, 0.08)); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 0 0 16px 16px; padding: 40px 32px; text-align: center; }
              .greeting { color: #ffffff; font-size: 26px; font-weight: 700; margin-bottom: 12px; }
              .greeting-name { color: #f59e0b; }
              .message { color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 20px 0; }
              .otp-container { margin: 36px 0; }
              .otp-label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; }
              .otp-code { font-size: 48px; font-weight: 700; letter-spacing: 14px; color: #f59e0b; padding: 28px 36px; background: linear-gradient(145deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)); border: 2px dashed rgba(245, 158, 11, 0.5); border-radius: 16px; display: inline-block; font-family: 'Monaco', 'Consolas', monospace; }
              .timer { display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px 24px; border-radius: 10px; margin-top: 28px; }
              .timer-icon { font-size: 18px; }
              .timer-text { color: #f87171; font-size: 14px; font-weight: 500; }
              .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent); margin: 32px 0; }
              .warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left; }
              .warning-title { color: #f87171; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px; }
              .warning-text { color: #fca5a5; font-size: 13px; margin: 0; line-height: 1.6; }
              .info-box { background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 18px; text-align: center; }
              .info-text { color: #93c5fd; font-size: 13px; margin: 0; }
              .footer { text-align: center; padding: 36px 20px; }
              .footer-logo { font-size: 22px; font-weight: 700; color: #475569; letter-spacing: 3px; margin-bottom: 14px; }
              .footer-text { color: #475569; font-size: 12px; line-height: 1.8; margin: 4px 0; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="security-banner">
                  <span class="security-icon">🔐</span>
                  <p class="security-text">Password Reset Request</p>
                </div>
                
                <div class="header">
                  <div class="logo">ASIREX</div>
                  <div class="tagline">Account Security</div>
                </div>
                
                <div class="content">
                  <h1 class="greeting">Hello, <span class="greeting-name">${fullName}</span>!</h1>
                  
                  <p class="message">
                    We received a request to reset your ASIREX account password. 
                    Use the verification code below to proceed with resetting your password.
                  </p>
                  
                  <div class="otp-container">
                    <div class="otp-label">Your Reset Code</div>
                    <div class="otp-code">${otp}</div>
                  </div>
                  
                  <div class="timer">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text">This code expires in 10 minutes</span>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="warning-box">
                    <p class="warning-title">⚠️ Security Notice</p>
                    <p class="warning-text">
                      If you didn't request this password reset, please ignore this email and your password will remain unchanged. 
                      Someone may have entered your email by mistake. If you're concerned about your account security, 
                      please contact our support team immediately.
                    </p>
                  </div>
                  
                  <div class="info-box">
                    <p class="info-text">
                      Need help? Contact us at <a href="mailto:support@asirex.in" style="color: #60a5fa; text-decoration: underline;">support@asirex.in</a>
                    </p>
                  </div>
                </div>
                
                <div class="footer">
                  <div class="footer-logo">ASIREX</div>
                  <p class="footer-text">Building the future of technology</p>
                  <p class="footer-text">© ${new Date().getFullYear()} ASIREX. All rights reserved.</p>
                  <p class="footer-text" style="margin-top: 16px; color: #374151;">
                    This is an automated security message • Please do not reply
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Password reset OTP email response:", emailResult);

    if (!emailResponse.ok) {
      console.error("Password reset email sending failed:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send reset code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Reset code sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
