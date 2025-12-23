import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplaintNotificationRequest {
  complaintId: string;
  orderId: string;
  userId: string;
  notificationType: 
    | "complaint_received" 
    | "complaint_approved" 
    | "complaint_rejected"
    | "pickup_scheduled"
    | "pickup_completed"
    | "replacement_created"
    | "refund_initiated";
  complaintType: string;
  customerName: string;
  customerEmail: string;
  additionalData?: {
    couponCode?: string;
    couponDiscount?: number;
    pickupDate?: string;
    refundMethod?: string;
    refundAmount?: number;
    replacementOrderId?: string;
    rejectionReason?: string;
  };
}

const getEmailContent = (data: ComplaintNotificationRequest) => {
  const { notificationType, complaintType, customerName, additionalData } = data;
  
  const complaintTypeLabel = {
    not_received: "Order Not Received",
    damaged: "Damaged Product",
    return: "Return Request",
    replacement: "Replacement Request",
    warranty: "Warranty Claim",
  }[complaintType] || complaintType;

  switch (notificationType) {
    case "complaint_received":
      return {
        subject: `We received your ${complaintTypeLabel} request - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#f97316;">📋 Request Received</h2>
            <p>Hi ${customerName},</p>
            <p>We have received your <strong>${complaintTypeLabel}</strong> request for Order #${data.orderId.slice(0, 8)}.</p>
            <p>Our team is now reviewing your request. We'll get back to you within 24-48 hours with an update.</p>
            <div style="background:#fff7ed;padding:16px;border-radius:8px;border-left:4px solid #f97316;margin:16px 0;">
              <p style="margin:0;"><strong>What happens next?</strong></p>
              <ul style="margin:8px 0 0 0;">
                <li>Our team will investigate your request</li>
                <li>You'll receive an email with the decision</li>
                <li>If approved, we'll guide you through next steps</li>
              </ul>
            </div>
            <p>Thank you for your patience!</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    case "complaint_approved":
      return {
        subject: `Good News! Your ${complaintTypeLabel} request is approved - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#10b981;">✅ Request Approved!</h2>
            <p>Hi ${customerName},</p>
            <p>Great news! Your <strong>${complaintTypeLabel}</strong> request for Order #${data.orderId.slice(0, 8)} has been approved.</p>
            ${additionalData?.couponCode ? `
              <div style="background:#ecfdf5;padding:16px;border-radius:8px;border-left:4px solid #10b981;margin:16px 0;">
                <p style="margin:0;"><strong>🎁 Apology Gift</strong></p>
                <p style="margin:8px 0;">We're sorry for the inconvenience. Here's a ${additionalData.couponDiscount || 20}% discount code for your next order:</p>
                <p style="font-size:24px;font-weight:bold;color:#10b981;letter-spacing:2px;">${additionalData.couponCode}</p>
              </div>
            ` : ''}
            <p><strong>Next Steps:</strong></p>
            <ul>
              ${complaintType === 'not_received' ? '<li>If prepaid, select your refund method in your order page</li>' : ''}
              ${['return', 'replacement', 'damaged'].includes(complaintType) ? '<li>We will schedule a pickup for the product</li>' : ''}
              ${complaintType === 'warranty' ? '<li>We will arrange for product inspection/replacement</li>' : ''}
            </ul>
            <p>Check your order page for real-time updates.</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    case "complaint_rejected":
      return {
        subject: `Update on your ${complaintTypeLabel} request - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#ef4444;">Request Update</h2>
            <p>Hi ${customerName},</p>
            <p>After careful review, we were unable to approve your <strong>${complaintTypeLabel}</strong> request for Order #${data.orderId.slice(0, 8)}.</p>
            ${additionalData?.rejectionReason ? `
              <div style="background:#fef2f2;padding:16px;border-radius:8px;border-left:4px solid #ef4444;margin:16px 0;">
                <p style="margin:0;"><strong>Reason:</strong></p>
                <p style="margin:8px 0 0 0;">${additionalData.rejectionReason}</p>
              </div>
            ` : ''}
            <p>If you believe this decision is incorrect, please contact our support team with additional details or evidence.</p>
            <p>We're here to help!</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    case "pickup_scheduled":
      return {
        subject: `Pickup Scheduled for Order #${data.orderId.slice(0, 8)} - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#3b82f6;">📦 Pickup Scheduled</h2>
            <p>Hi ${customerName},</p>
            <p>Good news! We have scheduled a pickup for your ${complaintTypeLabel} request.</p>
            ${additionalData?.pickupDate ? `
              <div style="background:#eff6ff;padding:16px;border-radius:8px;border-left:4px solid #3b82f6;margin:16px 0;">
                <p style="margin:0;"><strong>📅 Scheduled Pickup Date:</strong></p>
                <p style="font-size:18px;margin:8px 0 0 0;font-weight:bold;">${additionalData.pickupDate}</p>
              </div>
            ` : ''}
            <p><strong>Please ensure:</strong></p>
            <ul>
              <li>Product is in original packaging (if available)</li>
              <li>All accessories and tags are included</li>
              <li>Someone is available to hand over the product</li>
            </ul>
            <p>Our delivery partner will contact you before arrival.</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    case "pickup_completed":
      return {
        subject: `Pickup Completed - Order #${data.orderId.slice(0, 8)} - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#10b981;">✅ Pickup Completed</h2>
            <p>Hi ${customerName},</p>
            <p>We've successfully picked up your product for Order #${data.orderId.slice(0, 8)}.</p>
            <p><strong>What's next?</strong></p>
            <ul>
              ${complaintType === 'return' ? '<li>Your refund will be processed within 5-7 business days</li>' : ''}
              ${complaintType === 'replacement' ? '<li>Your replacement order is being prepared</li>' : ''}
              ${complaintType === 'warranty' ? '<li>Product will be inspected and repaired/replaced</li>' : ''}
            </ul>
            <p>Check your order page for real-time updates.</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    case "replacement_created":
      return {
        subject: `Replacement Order Created - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8b5cf6;">🔄 Replacement Order Created</h2>
            <p>Hi ${customerName},</p>
            <p>Great news! We've created a replacement order for you.</p>
            ${additionalData?.replacementOrderId ? `
              <div style="background:#f5f3ff;padding:16px;border-radius:8px;border-left:4px solid #8b5cf6;margin:16px 0;">
                <p style="margin:0;"><strong>New Order ID:</strong></p>
                <p style="font-size:18px;margin:8px 0 0 0;font-weight:bold;">#${additionalData.replacementOrderId.slice(0, 8)}</p>
              </div>
            ` : ''}
            <p>Your replacement will be shipped soon. Track it in your orders page.</p>
            <p>Thank you for your patience!</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    case "refund_initiated":
      return {
        subject: `Refund Initiated - Order #${data.orderId.slice(0, 8)} - ASIREX`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#10b981;">💰 Refund Initiated</h2>
            <p>Hi ${customerName},</p>
            <p>We've initiated your refund for Order #${data.orderId.slice(0, 8)}.</p>
            <div style="background:#ecfdf5;padding:16px;border-radius:8px;border-left:4px solid #10b981;margin:16px 0;">
              ${additionalData?.refundAmount ? `<p style="margin:0;"><strong>Amount:</strong> ₹${additionalData.refundAmount.toLocaleString()}</p>` : ''}
              ${additionalData?.refundMethod ? `<p style="margin:8px 0 0 0;"><strong>Method:</strong> ${additionalData.refundMethod}</p>` : ''}
            </div>
            <p><strong>Timeline:</strong></p>
            <ul>
              <li>Gift Card: Instant</li>
              <li>UPI: 1-2 business days</li>
              <li>Bank Transfer: 5-7 business days</li>
            </ul>
            <p>Thank you for shopping with us!</p>
            <p style="color:#888;">Team ASIREX</p>
          </div>
        `,
      };

    default:
      return {
        subject: `Order Update - ASIREX`,
        html: `<p>Your order has been updated. Please check your orders page for details.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ComplaintNotificationRequest = await req.json();
    console.log("Complaint notification request:", data);

    // Create Supabase client for creating in-app notification
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create in-app notification
    const notificationTitle = {
      complaint_received: "Request Received",
      complaint_approved: "Request Approved!",
      complaint_rejected: "Request Update",
      pickup_scheduled: "Pickup Scheduled",
      pickup_completed: "Pickup Completed",
      replacement_created: "Replacement Order Created",
      refund_initiated: "Refund Initiated",
    }[data.notificationType] || "Order Update";

    const notificationMessage = {
      complaint_received: `Your ${data.complaintType.replace('_', ' ')} request is being reviewed.`,
      complaint_approved: `Your ${data.complaintType.replace('_', ' ')} request has been approved!`,
      complaint_rejected: `Your ${data.complaintType.replace('_', ' ')} request could not be approved.`,
      pickup_scheduled: `Pickup scheduled for ${data.additionalData?.pickupDate || 'soon'}.`,
      pickup_completed: "Product picked up successfully. Processing your request.",
      replacement_created: "Your replacement order has been created!",
      refund_initiated: `Refund of ₹${data.additionalData?.refundAmount || 0} initiated.`,
    }[data.notificationType] || "Your order has been updated.";

    await supabase.from("notifications").insert({
      user_id: data.userId,
      title: notificationTitle,
      message: notificationMessage,
      type: "order",
      link: `/track-order`,
    });

    // Send email if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey && data.customerEmail) {
      const resend = new Resend(resendApiKey);
      const emailContent = getEmailContent(data);

      await resend.emails.send({
        from: "ASIREX <orders@resend.dev>",
        to: [data.customerEmail],
        subject: emailContent.subject,
        html: emailContent.html,
      });

      console.log("Complaint notification email sent");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-complaint-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
