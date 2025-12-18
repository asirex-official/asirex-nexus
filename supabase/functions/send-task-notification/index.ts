import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskNotificationRequest {
  taskTitle: string;
  taskDescription?: string;
  priority: string;
  dueDate?: string;
  assignee: { email: string; name: string; };
  assignerName: string;
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
    const { taskTitle, taskDescription, priority, dueDate, assignee, assignerName }: TaskNotificationRequest = await req.json();

    console.log(`Sending task notification to ${assignee.email}`);

    const result = await resend.emails.send({
      from: "Asirex <onboarding@resend.dev>",
      to: [assignee.email],
      subject: `New Task: ${taskTitle} [${priority.toUpperCase()}]`,
      html: `<h1>New Task Assigned</h1><p>Hi ${assignee.name}, ${assignerName} assigned you: <strong>${taskTitle}</strong></p>${taskDescription ? `<p>${taskDescription}</p>` : ""}${dueDate ? `<p>Due: ${dueDate}</p>` : ""}<p>Priority: ${priority}</p>`,
    });

    return new Response(JSON.stringify({ success: true, result }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
