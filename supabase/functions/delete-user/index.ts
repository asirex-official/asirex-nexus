import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if requesting user is admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .in("role", ["super_admin", "admin"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean up tasks - nullify assignments to preserve history
    await supabaseAdmin.from("tasks").update({ assigned_to: null }).eq("assigned_to", user_id);
    await supabaseAdmin.from("tasks").update({ assigned_by: null }).eq("assigned_by", user_id);
    
    // Clean up meetings - remove from attendees
    const { data: meetings } = await supabaseAdmin.from("meetings").select("id, attendees");
    if (meetings) {
      for (const meeting of meetings) {
        const attendees = meeting.attendees as string[] | null;
        if (attendees && attendees.includes(user_id)) {
          const updatedAttendees = attendees.filter((id: string) => id !== user_id);
          await supabaseAdmin.from("meetings").update({ attendees: updatedAttendees }).eq("id", meeting.id);
        }
      }
    }

    // Clean up team_members if linked
    await supabaseAdmin.from("team_members").delete().eq("user_id", user_id);

    // Delete related data
    await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
    await supabaseAdmin.from("activity_logs").delete().eq("user_id", user_id);
    await supabaseAdmin.from("profiles").delete().eq("user_id", user_id);
    await supabaseAdmin.from("user_addresses").delete().eq("user_id", user_id);
    await supabaseAdmin.from("event_registrations").delete().eq("user_id", user_id);
    await supabaseAdmin.from("chat_conversations").delete().eq("user_id", user_id);
    await supabaseAdmin.from("ceo_security").delete().eq("user_id", user_id);

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
