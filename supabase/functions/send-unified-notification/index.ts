import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotificationType = 
  | "order_placed" 
  | "order_shipped" 
  | "order_delivered" 
  | "order_cancelled"
  | "delivery_failed"
  | "refund_approved" 
  | "refund_rejected"
  | "refund_completed"
  | "warranty_submitted"
  | "warranty_approved"
  | "warranty_rejected"
  | "new_coupon"
  | "new_product"
  | "new_event"
  | "new_project"
  | "custom";

interface NotificationRequest {
  type: NotificationType;
  userId?: string;
  userEmail?: string;
  userName?: string;
  title?: string;
  message?: string;
  link?: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  sendInApp?: boolean;
  targetAll?: boolean;
}

const getNotificationContent = (type: NotificationType, data: Record<string, any> = {}) => {
  const templates: Record<NotificationType, { title: string; message: string; emailSubject: string; emailHtml: string }> = {
    order_placed: {
      title: "Order Confirmed! 🎉",
      message: `Your order #${data.orderId?.slice(0, 8) || ''} has been placed successfully.`,
      emailSubject: `Order Confirmed - ASIREX #${data.orderId?.slice(0, 8) || ''}`,
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">✅ Order Confirmed!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Hi ${data.customerName || 'there'},</p>
            <p>Your order <strong>#${data.orderId?.slice(0, 8) || ''}</strong> has been placed successfully!</p>
            <p><strong>Total:</strong> ₹${data.totalAmount?.toLocaleString() || 0}</p>
            <p>We'll notify you once your order is shipped.</p>
            <a href="${data.trackUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#10b981;color:white;text-decoration:none;border-radius:8px;">Track Order</a>
          </div>
        </div>
      `,
    },
    order_shipped: {
      title: "Order Shipped! 🚚",
      message: `Your order #${data.orderId?.slice(0, 8) || ''} is on its way!`,
      emailSubject: `Your Order is Shipped - ASIREX #${data.orderId?.slice(0, 8) || ''}`,
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">🚚 Your Order is Shipped!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Great news! Your order <strong>#${data.orderId?.slice(0, 8) || ''}</strong> is on its way.</p>
            ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
            <p>Expected delivery in 3-7 business days.</p>
            <a href="${data.trackUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;">Track Shipment</a>
          </div>
        </div>
      `,
    },
    order_delivered: {
      title: "Order Delivered! 📦",
      message: `Your order #${data.orderId?.slice(0, 8) || ''} has been delivered.`,
      emailSubject: `Order Delivered - ASIREX #${data.orderId?.slice(0, 8) || ''}`,
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">📦 Order Delivered!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Your order <strong>#${data.orderId?.slice(0, 8) || ''}</strong> has been delivered!</p>
            <p>We hope you love your purchase. If you have any issues, please contact support.</p>
            <a href="${data.reviewUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#10b981;color:white;text-decoration:none;border-radius:8px;">Leave a Review</a>
          </div>
        </div>
      `,
    },
    order_cancelled: {
      title: "Order Cancelled",
      message: `Your order #${data.orderId?.slice(0, 8) || ''} has been cancelled.`,
      emailSubject: `Order Cancelled - ASIREX #${data.orderId?.slice(0, 8) || ''}`,
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">Order Cancelled</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Your order <strong>#${data.orderId?.slice(0, 8) || ''}</strong> has been cancelled.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            <p>If a refund is due, it will be processed within 5-7 business days.</p>
          </div>
        </div>
      `,
    },
    delivery_failed: {
      title: "Delivery Failed ⚠️",
      message: `Delivery attempt for order #${data.orderId?.slice(0, 8) || ''} failed.`,
      emailSubject: `Delivery Failed - Action Required - ASIREX #${data.orderId?.slice(0, 8) || ''}`,
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">⚠️ Delivery Failed</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>We couldn't deliver your order <strong>#${data.orderId?.slice(0, 8) || ''}</strong>.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            <p>Please update your delivery details or contact support.</p>
            <a href="${data.trackUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#f59e0b;color:white;text-decoration:none;border-radius:8px;">View Details</a>
          </div>
        </div>
      `,
    },
    refund_approved: {
      title: "Refund Approved! ✅",
      message: `Your refund of ₹${data.amount?.toLocaleString() || 0} has been approved.`,
      emailSubject: "Refund Approved - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">✅ Refund Approved!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Great news! Your refund of <strong>₹${data.amount?.toLocaleString() || 0}</strong> has been approved.</p>
            <p><strong>Refund Method:</strong> ${data.method || 'As per your selection'}</p>
            <p>The refund will be processed within 3-5 business days.</p>
          </div>
        </div>
      `,
    },
    refund_rejected: {
      title: "Refund Request Update",
      message: "Your refund request could not be approved at this time.",
      emailSubject: "Refund Request Update - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#6b7280 0%,#4b5563 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">Refund Request Update</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>We've reviewed your refund request and unfortunately, it could not be approved.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            <p>If you have questions, please contact our support team.</p>
          </div>
        </div>
      `,
    },
    refund_completed: {
      title: "Refund Processed! 💰",
      message: `Your refund of ₹${data.amount?.toLocaleString() || 0} has been completed.`,
      emailSubject: "Refund Completed - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">💰 Refund Completed!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Your refund of <strong>₹${data.amount?.toLocaleString() || 0}</strong> has been successfully processed!</p>
            <p><strong>Refund Method:</strong> ${data.method || 'As selected'}</p>
            ${data.method === 'gift_card' ? `<p><strong>Gift Card Code:</strong> ${data.giftCardCode || 'Check your account'}</p>` : ''}
            <p>Thank you for your patience.</p>
          </div>
        </div>
      `,
    },
    warranty_submitted: {
      title: "Warranty Claim Received",
      message: "Your warranty claim has been submitted for review.",
      emailSubject: "Warranty Claim Received - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">🛡️ Warranty Claim Received</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>We've received your warranty claim for <strong>${data.productName || 'your product'}</strong>.</p>
            <p>Our team will review your claim and get back to you within 2-3 business days.</p>
          </div>
        </div>
      `,
    },
    warranty_approved: {
      title: "Warranty Claim Approved! ✅",
      message: "Your warranty claim has been approved.",
      emailSubject: "Warranty Claim Approved - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">✅ Warranty Claim Approved!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>Great news! Your warranty claim for <strong>${data.productName || 'your product'}</strong> has been approved.</p>
            <p><strong>Resolution:</strong> ${data.resolution || 'Replacement/Repair'}</p>
            <p>We'll be in touch with next steps shortly.</p>
          </div>
        </div>
      `,
    },
    warranty_rejected: {
      title: "Warranty Claim Update",
      message: "Your warranty claim could not be approved.",
      emailSubject: "Warranty Claim Update - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#6b7280 0%,#4b5563 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">Warranty Claim Update</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>After careful review, we were unable to approve your warranty claim.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            <p>If you have questions, please contact our support team.</p>
          </div>
        </div>
      `,
    },
    new_coupon: {
      title: "New Coupon Available! 🎁",
      message: `Use code ${data.code || 'SPECIAL'} to get ${data.discount || ''}% off!`,
      emailSubject: "New Coupon Just for You! - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#ec4899 0%,#db2777 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">🎁 New Coupon Available!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;text-align:center;">
            <p style="font-size:18px;">Use code</p>
            <div style="background:#fef3c7;border:2px dashed #f59e0b;padding:20px;border-radius:8px;margin:20px 0;">
              <span style="font-size:28px;font-weight:bold;color:#d97706;">${data.code || 'SPECIAL'}</span>
            </div>
            <p style="font-size:24px;color:#10b981;font-weight:bold;">Get ${data.discount || ''}% OFF!</p>
            ${data.validUntil ? `<p style="color:#6b7280;">Valid until ${data.validUntil}</p>` : ''}
            <a href="${data.shopUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#ec4899;color:white;text-decoration:none;border-radius:8px;">Shop Now</a>
          </div>
        </div>
      `,
    },
    new_product: {
      title: "New Product Launch! 🚀",
      message: `Check out our new product: ${data.productName || 'Amazing Product'}`,
      emailSubject: "New Product Alert! - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">🚀 New Product Launch!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.productName}" style="width:100%;border-radius:8px;margin-bottom:20px;">` : ''}
            <h2 style="color:#1f2937;">${data.productName || 'Amazing New Product'}</h2>
            <p>${data.description || 'Check out our latest innovation!'}</p>
            <p style="font-size:24px;color:#6366f1;font-weight:bold;">₹${data.price?.toLocaleString() || ''}</p>
            <a href="${data.productUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;">View Product</a>
          </div>
        </div>
      `,
    },
    new_event: {
      title: "New Event! 📅",
      message: `Don't miss: ${data.eventName || 'Exciting Event'}`,
      emailSubject: "You're Invited! New Event - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">📅 New Event!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <h2 style="color:#1f2937;">${data.eventName || 'Exciting Event'}</h2>
            <p>${data.description || 'Join us for this amazing event!'}</p>
            ${data.date ? `<p><strong>📅 Date:</strong> ${data.date}</p>` : ''}
            ${data.location ? `<p><strong>📍 Location:</strong> ${data.location}</p>` : ''}
            <a href="${data.eventUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#f59e0b;color:white;text-decoration:none;border-radius:8px;">Learn More</a>
          </div>
        </div>
      `,
    },
    new_project: {
      title: "New Project Announcement! 🎯",
      message: `Discover our new project: ${data.projectName || 'Exciting Project'}`,
      emailSubject: "New Project Announcement - ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#14b8a6 0%,#0d9488 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">🎯 New Project!</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <h2 style="color:#1f2937;">${data.projectName || 'Exciting New Project'}</h2>
            <p>${data.description || 'We are excited to announce our latest project!'}</p>
            <a href="${data.projectUrl || '#'}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#14b8a6;color:white;text-decoration:none;border-radius:8px;">View Project</a>
          </div>
        </div>
      `,
    },
    custom: {
      title: data.title || "Notification",
      message: data.message || "",
      emailSubject: data.title || "Notification from ASIREX",
      emailHtml: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;">${data.title || 'Notification'}</h1>
          </div>
          <div style="background:#f9fafb;padding:30px;">
            <p>${data.message || ''}</p>
            ${data.link ? `<a href="${data.link}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;">View More</a>` : ''}
          </div>
        </div>
      `,
    },
  };

  return templates[type] || templates.custom;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: NotificationRequest = await req.json();
    console.log("Unified notification request:", requestData);

    const { type, userId, userEmail, userName, data = {}, sendEmail = true, sendInApp = true, targetAll = false, link } = requestData;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const content = getNotificationContent(type, { ...data, customerName: userName });
    const title = requestData.title || content.title;
    const message = requestData.message || content.message;

    let inAppSent = 0;
    let emailSent = 0;

    // Handle sending to all users
    if (targetAll) {
      // Get all users
      const { data: users } = await supabase
        .from("profiles")
        .select("user_id")
        .limit(5000);

      const userIds = users?.map(u => u.user_id) || [];

      if (sendInApp && userIds.length > 0) {
        const notifications = userIds.map(uid => ({
          user_id: uid,
          title,
          message,
          type: "announcement",
          link: link || data.link,
        }));

        const { error } = await supabase.from("notifications").insert(notifications);
        if (!error) {
          inAppSent = userIds.length;
        }
      }

      // Get emails if sending email
      if (sendEmail) {
        const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 5000 });
        const emails = authUsers?.users?.map(u => u.email).filter(Boolean) as string[] || [];

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey && emails.length > 0) {
          const resend = new Resend(resendApiKey);
          
          // Batch send emails (50 at a time)
          for (let i = 0; i < emails.length; i += 50) {
            const batch = emails.slice(i, i + 50);
            try {
              await resend.batch.send(
                batch.map(email => ({
                  from: "ASIREX <notifications@resend.dev>",
                  to: [email],
                  subject: content.emailSubject,
                  html: content.emailHtml,
                }))
              );
              emailSent += batch.length;
            } catch (e) {
              console.error("Batch email error:", e);
            }
          }
        }
      }
    } else {
      // Single user notification
      if (sendInApp && userId) {
        const { error } = await supabase.from("notifications").insert({
          user_id: userId,
          title,
          message,
          type: type.includes("order") ? "order" : type.includes("refund") ? "refund" : "general",
          link: link || data.trackUrl || data.link,
        });
        if (!error) inAppSent = 1;
      }

      if (sendEmail && userEmail) {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          try {
            await resend.emails.send({
              from: "ASIREX <notifications@resend.dev>",
              to: [userEmail],
              subject: content.emailSubject,
              html: content.emailHtml,
            });
            emailSent = 1;
            console.log("Email sent to:", userEmail);
          } catch (e) {
            console.error("Email send error:", e);
          }
        }
      }
    }

    console.log(`Notification sent - In-app: ${inAppSent}, Email: ${emailSent}`);

    return new Response(
      JSON.stringify({ success: true, inAppSent, emailSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-unified-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
