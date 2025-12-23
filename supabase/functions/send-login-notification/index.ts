import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginNotificationRequest {
  userId: string;
  email: string;
  deviceInfo: {
    userAgent?: string;
    ipAddress?: string;
    deviceFingerprint?: string;
    isNewDevice: boolean;
  };
}

function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Unknown Device";

  // Detect browser
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browser = "Opera";
  }

  // Detect OS
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
  }

  // Detect device type
  if (userAgent.includes("Mobile")) {
    device = "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    device = "Tablet";
  } else {
    device = "Desktop";
  }

  return { browser, os, device };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, deviceInfo }: LoginNotificationRequest = await req.json();

    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "User ID and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Checking login notification settings for user: ${userId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has login notifications enabled
    const { data: securitySettings, error: settingsError } = await supabase
      .from("user_security_settings")
      .select("notify_new_login")
      .eq("user_id", userId)
      .maybeSingle();

    if (settingsError) {
      console.error("Error fetching security settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch security settings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If notifications are not enabled, skip sending
    if (!securitySettings?.notify_new_login) {
      console.log(`Login notifications not enabled for user: ${userId}`);
      return new Response(
        JSON.stringify({ success: true, message: "Notifications not enabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    const loginTime = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const { browser, os, device } = parseUserAgent(deviceInfo.userAgent || "");
    const userName = profile?.full_name || "User";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Login Detected</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none;">
          <p style="font-size: 16px;">Hello ${userName},</p>
          
          <p style="font-size: 16px;">We detected a ${deviceInfo.isNewDevice ? "new device" : ""} login to your ASIREX account.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              <strong>📅 Time:</strong> ${loginTime}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              <strong>🌐 Browser:</strong> ${browser}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              <strong>💻 Operating System:</strong> ${os}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              <strong>📱 Device Type:</strong> ${device}
            </p>
            ${deviceInfo.ipAddress ? `<p style="margin: 0; font-size: 14px; color: #666;"><strong>🌍 IP Address:</strong> ${deviceInfo.ipAddress}</p>` : ""}
          </div>
          
          <div style="background: ${deviceInfo.isNewDevice ? "#fff3cd" : "#d4edda"}; padding: 15px; border-radius: 8px; border: 1px solid ${deviceInfo.isNewDevice ? "#ffc107" : "#28a745"}; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: ${deviceInfo.isNewDevice ? "#856404" : "#155724"};">
              ${deviceInfo.isNewDevice 
                ? "⚠️ <strong>New Device Alert:</strong> This login is from a device we haven't seen before. If this wasn't you, please secure your account immediately."
                : "✅ This login was from a recognized device."}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If you did not perform this login, we recommend:
          </p>
          <ul style="font-size: 14px; color: #666;">
            <li>Change your password immediately</li>
            <li>Enable two-factor authentication</li>
            <li>Review your recent account activity</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
            You're receiving this because you enabled login notifications.<br>
            Manage this in Settings → Security.
          </p>
        </div>
      </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "ASIREX Security <security@asirex.in>",
      to: [email],
      subject: deviceInfo.isNewDevice ? "⚠️ New Device Login - ASIREX" : "Login Notification - ASIREX",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Failed to send login notification email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Login notification sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-login-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
