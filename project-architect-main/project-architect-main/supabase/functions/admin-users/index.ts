import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client to verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.log("User auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using service role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.log("User is not admin:", user.id);
      return new Response(
        JSON.stringify({ error: "Acesso negado. Apenas administradores." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin user verified:", user.id);

    // Handle GET - List all users
    if (req.method === "GET") {
      console.log("Fetching all users...");
      
      // Get all users from auth
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) {
        console.log("Error fetching auth users:", authError);
        throw authError;
      }

      // Get all profiles with phone number and blocking info
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name, phone_number, is_blocked, blocked_at, blocked_reason");

      // Get all subscriptions
      const { data: subscriptions } = await supabaseAdmin
        .from("subscriptions")
        .select("*");

      // Get all roles
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role");

      // Map users with their data including email verification status
      const users = authUsers.users.map((u) => ({
        id: u.id,
        email: u.email,
        email_verified: u.email_confirmed_at !== null,
        email_confirmed_at: u.email_confirmed_at,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        profile: profiles?.find((p) => p.user_id === u.id) || null,
        subscription: subscriptions?.find((s) => s.user_id === u.id) || null,
        role: roles?.find((r) => r.user_id === u.id) || null,
      }));

      console.log(`Returning ${users.length} users`);
      return new Response(
        JSON.stringify({ users }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle POST - Update user
    if (req.method === "POST") {
      const body = await req.json();
      const { action, userId, plan, status, role, blocked, blockedReason } = body;

      console.log("Action:", action, "UserId:", userId);

      if (action === "update-subscription") {
        // Update or create subscription
        const { error: subError } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan,
            status,
            starts_at: new Date().toISOString(),
            ends_at: plan === "lifetime" ? null : 
              plan === "monthly" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
              new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: "user_id" });

        if (subError) {
          console.log("Error updating subscription:", subError);
          throw subError;
        }

        console.log("Subscription updated for user:", userId);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === "update-role") {
        // Delete existing role
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Insert new role
        const { error: roleUpdateError } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (roleUpdateError) {
          console.log("Error updating role:", roleUpdateError);
          throw roleUpdateError;
        }

        console.log("Role updated for user:", userId);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === "block-user") {
        // Block or unblock user
        const { error: blockError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_blocked: blocked,
            blocked_at: blocked ? new Date().toISOString() : null,
            blocked_reason: blocked ? (blockedReason || "Bloqueado pelo administrador") : null,
          })
          .eq("user_id", userId);

        if (blockError) {
          console.log("Error blocking user:", blockError);
          throw blockError;
        }

        console.log(`User ${blocked ? "blocked" : "unblocked"}:`, userId);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Ação inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
