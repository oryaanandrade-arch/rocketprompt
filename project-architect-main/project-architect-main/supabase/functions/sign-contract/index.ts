import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response(JSON.stringify({ error: "Token não fornecido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: contract, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("sign_token", token)
        .single();

      if (error || !contract) {
        return new Response(JSON.stringify({ error: "Contrato não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as viewed if sent
      if (contract.status === "sent") {
        await supabase
          .from("contracts")
          .update({ status: "viewed", updated_at: new Date().toISOString() })
          .eq("id", contract.id);
        contract.status = "viewed";
      }

      return new Response(JSON.stringify({ contract }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const { token, client_notes } = await req.json();

      if (!token) {
        return new Response(JSON.stringify({ error: "Token não fornecido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: contract, error: fetchError } = await supabase
        .from("contracts")
        .select("*")
        .eq("sign_token", token)
        .single();

      if (fetchError || !contract) {
        return new Response(JSON.stringify({ error: "Contrato não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (contract.status === "signed") {
        return new Response(JSON.stringify({ error: "Contrato já assinado" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (contract.status === "cancelled") {
        return new Response(JSON.stringify({ error: "Contrato cancelado" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: "signed",
          signed_at: new Date().toISOString(),
          signed_ip: clientIp,
          client_notes: client_notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contract.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Erro ao assinar contrato");
      }

      return new Response(JSON.stringify({ success: true, message: "Contrato assinado com sucesso" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
