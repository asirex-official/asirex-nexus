import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  dateOfBirth?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, dateOfBirth }: WelcomeEmailRequest = await req.json();

    if (!email || !fullName) {
      return new Response(
        JSON.stringify({ error: "Email and fullName are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending welcome email to ${email}`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const currentDate = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Welcome <noreply@asirex.in>",
        to: [email],
        subject: "🎉 Welcome to ASIREX - Your Account is Ready!",
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
              .welcome-banner { background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center; border-radius: 16px 16px 0 0; }
              .welcome-text { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
              .welcome-emoji { font-size: 32px; display: block; margin-bottom: 8px; }
              .header { text-align: center; padding: 32px 0 24px; }
              .logo { font-size: 42px; font-weight: 800; background: linear-gradient(135deg, #10b981, #22d3ee, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 4px; }
              .tagline { color: #94a3b8; font-size: 14px; margin-top: 10px; letter-spacing: 3px; text-transform: uppercase; }
              .content { background: linear-gradient(145deg, rgba(16, 185, 129, 0.08), rgba(139, 92, 246, 0.08)); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 0 0 16px 16px; padding: 40px 32px; }
              .greeting { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 16px; text-align: center; }
              .greeting-name { color: #10b981; }
              .message { color: #cbd5e1; font-size: 16px; line-height: 1.8; margin: 20px 0; text-align: center; }
              .account-card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(71, 85, 105, 0.4); border-radius: 16px; padding: 28px; margin: 32px 0; }
              .account-title { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
              .account-title::before { content: ''; display: block; width: 3px; height: 16px; background: linear-gradient(180deg, #10b981, #059669); border-radius: 2px; }
              .account-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(71, 85, 105, 0.3); }
              .account-row:last-child { border-bottom: none; }
              .account-label { color: #94a3b8; font-size: 14px; }
              .account-value { color: #ffffff; font-size: 14px; font-weight: 600; text-align: right; }
              .features-section { margin: 32px 0; }
              .features-title { color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 20px; text-align: center; }
              .features-grid { display: grid; gap: 12px; }
              .feature-item { display: flex; align-items: center; gap: 12px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 10px; padding: 14px 16px; }
              .feature-icon { font-size: 20px; }
              .feature-text { color: #cbd5e1; font-size: 14px; }
              .cta-section { text-align: center; margin: 32px 0 16px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; }
              .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent); margin: 32px 0; }
              .help-section { background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin-top: 24px; }
              .help-text { color: #93c5fd; font-size: 14px; margin: 0; }
              .help-link { color: #60a5fa; text-decoration: underline; }
              .footer { text-align: center; padding: 40px 20px; }
              .footer-logo { font-size: 24px; font-weight: 700; color: #475569; letter-spacing: 3px; margin-bottom: 16px; }
              .footer-text { color: #475569; font-size: 12px; line-height: 1.8; margin: 4px 0; }
              .social-links { margin-top: 24px; display: flex; justify-content: center; gap: 16px; }
              .social-link { color: #64748b; text-decoration: none; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="wrapper">
              <div class="container">
                <div class="welcome-banner">
                  <span class="welcome-emoji">🎉</span>
                  <p class="welcome-text">Welcome to the ASIREX Family!</p>
                </div>
                
                <div class="header">
                  <div class="logo">ASIREX</div>
                  <div class="tagline">Innovating Tomorrow, Today</div>
                </div>
                
                <div class="content">
                  <h1 class="greeting">Hello, <span class="greeting-name">${fullName}</span>! 👋</h1>
                  
                  <p class="message">
                    Congratulations! Your ASIREX account has been successfully created. 
                    We're excited to have you on board and can't wait for you to explore 
                    the incredible innovations we have in store for you.
                  </p>
                  
                  <div class="account-card">
                    <div class="account-title">Your Account Details</div>
                    <div class="account-row">
                      <span class="account-label">Full Name</span>
                      <span class="account-value">${fullName}</span>
                    </div>
                    <div class="account-row">
                      <span class="account-label">Email Address</span>
                      <span class="account-value">${email}</span>
                    </div>
                    ${dateOfBirth ? `
                    <div class="account-row">
                      <span class="account-label">Date of Birth</span>
                      <span class="account-value">${new Date(dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    ` : ''}
                    <div class="account-row">
                      <span class="account-label">Member Since</span>
                      <span class="account-value">${currentDate}</span>
                    </div>
                    <div class="account-row">
                      <span class="account-label">Account Status</span>
                      <span class="account-value" style="color: #10b981;">✓ Active</span>
                    </div>
                  </div>
                  
                  <div class="features-section">
                    <h3 class="features-title">What You Can Do Now</h3>
                    <div class="features-grid">
                      <div class="feature-item">
                        <span class="feature-icon">🛒</span>
                        <span class="feature-text">Shop our innovative products with exclusive member benefits</span>
                      </div>
                      <div class="feature-item">
                        <span class="feature-icon">📦</span>
                        <span class="feature-text">Track your orders in real-time from anywhere</span>
                      </div>
                      <div class="feature-item">
                        <span class="feature-icon">🎁</span>
                        <span class="feature-text">Access special discounts and early product launches</span>
                      </div>
                      <div class="feature-item">
                        <span class="feature-icon">📅</span>
                        <span class="feature-text">Register for exclusive events and workshops</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="cta-section">
                    <a href="https://asirex.in" class="cta-button">
                      Start Exploring →
                    </a>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="help-section">
                    <p class="help-text">
                      Need help? Our support team is always here for you.<br/>
                      Contact us at <a href="mailto:support@asirex.in" class="help-link">support@asirex.in</a>
                    </p>
                  </div>
                </div>
                
                <div class="footer">
                  <div class="footer-logo">ASIREX</div>
                  <p class="footer-text">Building the future of technology</p>
                  <p class="footer-text">© ${new Date().getFullYear()} ASIREX. All rights reserved.</p>
                  <div class="social-links">
                    <a href="https://instagram.com/asirex.in" class="social-link">Instagram</a>
                    <span class="social-link">•</span>
                    <a href="https://x.com/asirex_in" class="social-link">Twitter</a>
                    <span class="social-link">•</span>
                    <a href="https://asirex.in" class="social-link">Website</a>
                  </div>
                  <p class="footer-text" style="margin-top: 20px; color: #374151;">
                    You're receiving this email because you created an account at ASIREX.
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
    console.log("Welcome email response:", emailResult);

    if (!emailResponse.ok) {
      console.error("Welcome email sending failed:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
