import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkNotificationRequest {
  title: string;
  message: string;
  type: string;
  link?: string;
  target_category: string;
  target_limit?: number;
  send_email?: boolean;
}

// Email sending function using Resend
async function sendEmailNotifications(emails: string[], title: string, message: string, link?: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email notifications");
    return { sent: 0, error: "Email not configured" };
  }

  let sentCount = 0;
  const batchSize = 50; // Resend allows up to 100 per request

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch.map(email => ({
          from: "Asirex <notifications@asirex.com>",
          to: [email],
          subject: title,
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
                ${link ? `
                  <a href="${link}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    View More
                  </a>
                ` : ''}
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} Asirex. All rights reserved.
              </p>
            </div>
          `,
        }))),
      });

      if (res.ok) {
        sentCount += batch.length;
      } else {
        console.error("Resend batch error:", await res.text());
      }
    } catch (error) {
      console.error("Email batch error:", error);
    }
  }

  return { sent: sentCount };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is a super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is super_admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ success: false, error: "Only super admins can send bulk notifications" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, message, type, link, target_category, target_limit, send_email }: BulkNotificationRequest = await req.json();

    if (!title || !message || !target_category) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending bulk notification: ${title} to category: ${target_category}, send_email: ${send_email}`);

    let userIds: string[] = [];
    let userEmails: string[] = [];

    // Get target users based on category
    switch (target_category) {
      case "all_users": {
        const { data: users } = await supabase
          .from("profiles")
          .select("user_id")
          .limit(target_limit || 1000);
        userIds = users?.map(u => u.user_id) || [];
        break;
      }
      case "new_signups_today": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: users } = await supabase
          .from("profiles")
          .select("user_id, created_at")
          .gte("created_at", today.toISOString())
          .limit(target_limit || 100);
        userIds = users?.map(u => u.user_id) || [];
        break;
      }
      case "new_signups_week": {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: users } = await supabase
          .from("profiles")
          .select("user_id, created_at")
          .gte("created_at", weekAgo.toISOString())
          .limit(target_limit || 500);
        userIds = users?.map(u => u.user_id) || [];
        break;
      }
      case "customers_with_orders": {
        const { data: orders } = await supabase
          .from("orders")
          .select("user_id")
          .eq("payment_status", "paid")
          .not("user_id", "is", null);
        const uniqueUsers = [...new Set(orders?.map(o => o.user_id).filter(Boolean))];
        userIds = (uniqueUsers as string[]).slice(0, target_limit || 1000);
        break;
      }
      case "event_attendees": {
        const { data: registrations } = await supabase
          .from("event_registrations")
          .select("user_id");
        const uniqueUsers = [...new Set(registrations?.map(r => r.user_id))];
        userIds = uniqueUsers.slice(0, target_limit || 1000);
        break;
      }
      case "newsletter_subscribers": {
        const { data: subscribers } = await supabase
          .from("newsletter_subscribers")
          .select("email")
          .eq("is_active", true)
          .limit(target_limit || 1000);
        // For newsletter subscribers, we need to find matching profiles
        if (subscribers?.length) {
          const emails = subscribers.map(s => s.email);
          // Note: This assumes users have the same email in auth
          console.log(`Found ${emails.length} newsletter subscribers`);
        }
        // For now, just notify all users (as we can't easily match newsletter emails to user_ids)
        const { data: users } = await supabase
          .from("profiles")
          .select("user_id")
          .limit(target_limit || 100);
        userIds = users?.map(u => u.user_id) || [];
        break;
      }
      case "first_100_users": {
        const { data: users } = await supabase
          .from("profiles")
          .select("user_id, created_at")
          .order("created_at", { ascending: true })
          .limit(100);
        userIds = users?.map(u => u.user_id) || [];
        break;
      }
      case "inactive_users": {
        // Users who haven't placed an order in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: allUsers } = await supabase
          .from("profiles")
          .select("user_id");
        const { data: activeOrders } = await supabase
          .from("orders")
          .select("user_id")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .not("user_id", "is", null);
        const activeUserIds = new Set(activeOrders?.map(o => o.user_id));
        userIds = (allUsers?.filter(u => !activeUserIds.has(u.user_id)).map(u => u.user_id) || [])
          .slice(0, target_limit || 500);
        break;
      }
      case "staff_members": {
        const { data: staff } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["super_admin", "admin", "manager", "developer", "employee", "core_member"]);
        userIds = staff?.map(s => s.user_id) || [];
        break;
      }
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid target category" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No users found for this category" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending to ${userIds.length} users`);

    // Create notifications for all target users
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      link: link || null,
      is_read: false,
    }));

    // Batch insert notifications
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(batch);
      
      if (insertError) {
        console.error("Error inserting batch:", insertError);
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`Successfully sent ${insertedCount} in-app notifications`);

    // Send email notifications if requested
    let emailsSent = 0;
    if (send_email && userIds.length > 0) {
      // Fetch user emails from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      
      if (!authError && authUsers?.users) {
        const userIdSet = new Set(userIds);
        userEmails = authUsers.users
          .filter(u => userIdSet.has(u.id) && u.email)
          .map(u => u.email as string);
        
        console.log(`Sending emails to ${userEmails.length} users`);
        const emailResult = await sendEmailNotifications(userEmails, title, message, link);
        emailsSent = emailResult.sent;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_count: insertedCount,
        emails_sent: emailsSent,
        message: `Notification sent to ${insertedCount} users${emailsSent > 0 ? `, ${emailsSent} emails sent` : ''}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-bulk-notifications:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
