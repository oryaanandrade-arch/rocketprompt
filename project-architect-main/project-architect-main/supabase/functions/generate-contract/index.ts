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
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      client_name,
      client_email,
      service_type,
      project_description,
      deadline,
      contract_value,
      payment_conditions,
    } = body;

    if (!client_name || !client_email || !service_type || !project_description || !contract_value) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const prompt = `Gere um contrato de prestação de serviços profissional em português brasileiro com as seguintes informações:

- Nome do Cliente: ${client_name}
- Email do Cliente: ${client_email}
- Tipo de Serviço: ${service_type}
- Descrição do Projeto: ${project_description}
- Prazo de Entrega: ${deadline || "A combinar"}
- Valor: R$ ${Number(contract_value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Condições de Pagamento: ${payment_conditions || "À vista"}

O contrato deve conter:
1. Identificação das partes (CONTRATANTE e CONTRATADA)
2. Objeto do contrato
3. Escopo dos serviços
4. Prazos e entregas
5. Valor e forma de pagamento
6. Obrigações das partes
7. Confidencialidade
8. Rescisão
9. Disposições gerais
10. Foro

Use formatação clara com numeração de cláusulas. Seja profissional e objetivo. Não use markdown, use texto puro com quebras de linha.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em direito contratual brasileiro. Gere contratos profissionais, claros e juridicamente válidos. Responda apenas com o texto do contrato, sem comentários adicionais.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", errText);
      throw new Error("Falha ao gerar contrato com IA");
    }

    const aiData = await aiResponse.json();
    const contractContent = aiData.choices?.[0]?.message?.content;

    if (!contractContent) {
      throw new Error("Resposta da IA vazia");
    }

    // Save contract to database
    const { data: contract, error: insertError } = await supabase
      .from("contracts")
      .insert({
        user_id: user.id,
        client_name,
        client_email,
        service_type,
        project_description,
        deadline: deadline || null,
        contract_value: Number(contract_value),
        payment_conditions: payment_conditions || "À vista",
        contract_content: contractContent,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Erro ao salvar contrato");
    }

    return new Response(JSON.stringify({ success: true, contract }), {
      status: 200,
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
