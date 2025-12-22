import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  fullName?: string;
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
    const { email, fullName }: OTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete any existing OTPs for this email
    await supabase.from("signup_otps").delete().eq("email", email.toLowerCase());

    // Insert new OTP
    const { error: insertError } = await supabase.from("signup_otps").insert({
      email: email.toLowerCase(),
      otp_hash: await hashOTP(otp),
      expires_at: expiresAt.toISOString(),
      full_name: fullName || null,
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send OTP email using Resend API directly
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
        from: "Welcome <noreply@asirex.in>",
        to: [email],
        subject: "Welcome to ASIREX - Your Verification Code",
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
              .welcome-banner { background: linear-gradient(135deg, #10b981, #059669); padding: 16px 24px; text-align: center; border-radius: 12px 12px 0 0; }
              .welcome-text { color: #ffffff; font-size: 18px; font-weight: 600; margin: 0; letter-spacing: 0.5px; }
              .welcome-emoji { font-size: 20px; margin-right: 8px; }
              .header { text-align: center; padding: 32px 0 24px; }
              .logo { font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #10b981, #22d3ee, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 3px; }
              .tagline { color: #94a3b8; font-size: 13px; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
              .content { background: linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(139, 92, 246, 0.08)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 0 0 16px 16px; padding: 40px 32px; text-align: center; }
              .greeting { color: #ffffff; font-size: 24px; font-weight: 600; margin-bottom: 8px; }
              .message { color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 16px 0; }
              .otp-container { margin: 32px 0; }
              .otp-label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
              .otp-code { font-size: 44px; font-weight: 700; letter-spacing: 12px; color: #10b981; padding: 24px 32px; background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05)); border: 2px dashed rgba(16, 185, 129, 0.4); border-radius: 16px; display: inline-block; font-family: 'Monaco', 'Consolas', monospace; }
              .timer { display: inline-flex; align-items: center; gap: 8px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 10px 20px; border-radius: 8px; margin-top: 24px; }
              .timer-icon { font-size: 16px; }
              .timer-text { color: #fbbf24; font-size: 14px; font-weight: 500; }
              .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent); margin: 32px 0; }
              .security-note { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px; padding: 16px 20px; margin-top: 24px; }
              .security-text { color: #f87171; font-size: 13px; margin: 0; }
              .footer { text-align: center; padding: 32px 20px; }
              .footer-logo { font-size: 20px; font-weight: 700; color: #475569; letter-spacing: 2px; margin-bottom: 12px; }
              .footer-text { color: #475569; font-size: 12px; line-height: 1.6; margin: 4px 0; }
              .social-links { margin-top: 20px; }
              .social-link { display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="welcome-banner">
                  <p class="welcome-text"><span class="welcome-emoji">🎉</span>Thank you for becoming part of the ASIREX family!</p>
                </div>
                <div class="header">
                  <div class="logo">ASIREX</div>
                  <div class="tagline">Innovating Tomorrow, Today</div>
                </div>
                <div class="content">
                  <h1 class="greeting">Hello${fullName ? `, ${fullName}` : ''}! 👋</h1>
                  <p class="message">We're thrilled to have you join us. To complete your registration and unlock your ASIREX account, please use the verification code below:</p>
                  
                  <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                  </div>
                  
                  <div class="timer">
                    <span class="timer-icon">⏱️</span>
                    <span class="timer-text">Code expires in 10 minutes</span>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="security-note">
                    <p class="security-text">🔒 If you didn't request this code, please ignore this email. Your account security is our priority.</p>
                  </div>
                </div>
                
                <div class="footer">
                  <div class="footer-logo">ASIREX</div>
                  <p class="footer-text">Building the future of technology</p>
                  <p class="footer-text">© ${new Date().getFullYear()} ASIREX. All rights reserved.</p>
                  <p class="footer-text" style="margin-top: 16px; color: #374151;">This is an automated message • Please do not reply</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("OTP email sent:", emailResult);

    if (!emailResponse.ok) {
      console.error("Email sending failed:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
