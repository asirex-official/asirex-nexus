import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GiftCardRefundRequest {
  refund_id: string;
  user_id: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { refund_id, user_id, amount }: GiftCardRefundRequest = await req.json();

    if (!refund_id || !user_id || !amount) {
      return new Response(
        JSON.stringify({ error: "Refund ID, user ID, and amount are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function to create gift card
    const { data, error } = await supabase.rpc("create_gift_card_refund", {
      p_user_id: user_id,
      p_amount: amount,
      p_refund_id: refund_id,
    });

    if (error) {
      console.error("Error creating gift card:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create gift card" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the created gift card
    const { data: giftCard, error: fetchError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("id", data)
      .single();

    if (fetchError) {
      console.error("Error fetching gift card:", fetchError);
    }

    // Send notification email
    const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
    
    if (authUser?.user?.email && giftCard) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        
        await resend.emails.send({
          from: "ASIREX <onboarding@resend.dev>",
          to: [authUser.user.email],
          subject: "Your Gift Card Refund is Ready!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff;">
              <h2 style="color: #6366f1;">Gift Card Refund Issued</h2>
              <p>Great news! Your refund has been processed as a gift card.</p>
              
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; opacity: 0.8;">Gift Card Code</p>
                <div style="font-size: 28px; letter-spacing: 4px; font-weight: bold; font-family: monospace;">
                  ${giftCard.code}
                </div>
                <div style="margin-top: 20px; font-size: 24px;">
                  ₹${amount.toLocaleString()}
                </div>
              </div>
              
              <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin: 0 0 10px 0;">Terms & Conditions:</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; opacity: 0.8;">
                  <li>This gift card can only be used once</li>
                  <li>Non-transferable to other accounts</li>
                  <li>Valid for 1 year from issue date</li>
                  <li>Cannot be exchanged for cash</li>
                </ul>
              </div>
              
              <p style="color: #888; font-size: 12px; margin-top: 20px;">
                This gift card has been automatically credited to your account. You can use it at checkout.
              </p>
            </div>
          `,
        });
      }
    }

    // Create notification in database
    if (giftCard) {
      await supabase.from("notifications").insert({
        user_id,
        title: "Gift Card Refund Issued",
        message: `Your refund of ₹${amount.toLocaleString()} has been processed as a gift card. Code: ${giftCard.code}`,
        type: "refund",
        link: "/settings?tab=gift-cards",
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        gift_card_id: data,
        code: giftCard?.code,
        message: "Gift card refund processed successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in process-gift-card-refund:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
