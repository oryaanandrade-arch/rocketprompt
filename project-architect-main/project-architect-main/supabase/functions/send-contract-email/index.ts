import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { contract_id, base_url } = await req.json();

    if (!contract_id || !base_url) {
      return new Response(JSON.stringify({ error: "contract_id e base_url são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: contract, error: fetchError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contract_id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !contract) {
      return new Response(JSON.stringify({ error: "Contrato não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY =
      Deno.env.get("RESEND_API_KEY_1") || Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error(
        "Chave do Resend não configurada (RESEND_API_KEY_1 ou RESEND_API_KEY)"
      );
    }

    // Normaliza base_url removendo barra final
    const cleanBaseUrl = String(base_url).replace(/\/+$/, "");
    const signUrl = `${cleanBaseUrl}/contract/${contract.sign_token}`;

    const valorFormatado = Number(contract.contract_value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #000;">
          <h1 style="color: #000; margin: 0; font-size: 24px; font-weight: 800;">CONTRATO DE SERVIÇOS</h1>
          <p style="color: #666; margin: 8px 0 0; font-size: 14px;">RocketPrompt</p>
        </div>
        <div style="padding: 30px 0;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Olá <strong>${contract.client_name}</strong>,
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Um contrato foi preparado para você referente ao seguinte projeto:
          </p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #000;">
            <p style="margin: 0 0 8px; color: #333;"><strong>Serviço:</strong> ${contract.service_type}</p>
            <p style="margin: 0 0 8px; color: #333;"><strong>Valor:</strong> R$ ${valorFormatado}</p>
            <p style="margin: 0; color: #333;"><strong>Prazo:</strong> ${contract.deadline || "A combinar"}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signUrl}"
               style="display: inline-block; background: #000; color: #fff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Visualizar e Assinar Contrato
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Caso o botão não funcione, copie e cole este link no navegador:<br />
            <a href="${signUrl}" style="color: #000; word-break: break-all;">${signUrl}</a>
          </p>
        </div>
        <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Este é um email automático enviado pela RocketPrompt.
          </p>
        </div>
      </div>
    `;

    const textVersion = `
Olá ${contract.client_name},

Um contrato de ${contract.service_type} foi preparado para você.
Valor: R$ ${valorFormatado}
Prazo: ${contract.deadline || "A combinar"}

Acesse o link para visualizar e assinar:
${signUrl}

— RocketPrompt
    `.trim();

    const emailPayload = {
      from: "RocketPrompt <onboarding@resend.dev>",
      to: [contract.client_email],
      subject: `Contrato de Serviços - ${contract.service_type}`,
      html,
      text: textVersion,
      reply_to: user.email || undefined,
    };

    let emailResponse: Response;

    // Estratégia 1: Connector Gateway (recomendado)
    if (LOVABLE_API_KEY) {
      const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
      emailResponse = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify(emailPayload),
      });

      // Se o gateway falhar, faz fallback direto pela Resend API
      if (!emailResponse.ok) {
        const gatewayErr = await emailResponse.text();
        console.warn("Gateway falhou, tentando Resend direto:", gatewayErr);
        emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });
      }
    } else {
      // Estratégia 2: Resend direto
      emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailPayload),
      });
    }

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Email error final:", errText);
      throw new Error(`Erro ao enviar email: ${errText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email enviado com sucesso:", emailResult);

    const serviceSupabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await serviceSupabase
      .from("contracts")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", contract_id);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResult?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

