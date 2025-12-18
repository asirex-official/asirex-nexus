import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingInviteRequest {
  meetingTitle: string;
  meetingDescription?: string;
  meetingDate: string;
  meetingTime: string;
  durationMinutes: number;
  meetingLink?: string;
  attendees: { email: string; name: string; }[];
  organizerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "RESEND_API_KEY not configured" }), 
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const resend = new Resend(RESEND_API_KEY);
    const { meetingTitle, meetingDescription, meetingDate, meetingTime, durationMinutes, meetingLink, attendees, organizerName }: MeetingInviteRequest = await req.json();

    console.log(`Sending meeting invites for: ${meetingTitle}`);

    const results = await Promise.all(attendees.map(async (attendee) => {
      try {
        await resend.emails.send({
          from: "Asirex <onboarding@resend.dev>",
          to: [attendee.email],
          subject: `Meeting: ${meetingTitle}`,
          html: `<h1>Meeting Invitation</h1><p>Hi ${attendee.name}, ${organizerName} invited you to ${meetingTitle} on ${meetingDate} at ${meetingTime} (${durationMinutes} mins).${meetingLink ? ` <a href="${meetingLink}">Join</a>` : ""}</p>`,
        });
        return { email: attendee.email, success: true };
      } catch (e: any) { return { email: attendee.email, success: false, error: e.message }; }
    }));

    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
