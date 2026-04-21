import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArchitectureInput {
  projectId: string;
  projectName: string;
  productType: string;
  businessObjective: string;
  audienceType: string;
  targetUsers: string;
  problemDescription: string;
  coreFeatures: string;
  monetizationModel: string;
  pricingStrategy: string;
  platformType: string;
  complexityLevel: string;
  techPreferences: string;
  additionalNotes: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const input: ArchitectureInput = await req.json();
    console.log("Generating blueprint for project:", input.projectName);

    const systemPrompt = `Você é um arquiteto de produtos digitais sênior especialista em transformar ideias em projetos estruturados e vendáveis. 

Sua missão é analisar as informações fornecidas e gerar um BLUEPRINT PROFISSIONAL E COMPLETO do projeto digital.

REGRAS CRÍTICAS:
- Seja específico e prático, não genérico
- Use linguagem profissional em português brasileiro
- Foque em valor de negócio e viabilidade técnica
- Considere o nível de complexidade informado
- Gere conteúdo ÚNICO e PERSONALIZADO baseado nos inputs

Responda EXCLUSIVAMENTE em JSON válido, seguindo esta estrutura exata:
{
  "vision_overview": "Descrição completa e estratégica da visão do produto (2-3 parágrafos)",
  "problem_solved": "Problema central que o produto resolve e por que é importante (1-2 parágrafos)",
  "value_proposition": "Proposta de valor única e diferenciadores competitivos (1-2 parágrafos)",
  "features_by_module": [
    {
      "module": "Nome do Módulo",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "priority": "alta|média|baixa"
    }
  ],
  "user_flow": "Descrição detalhada da jornada do usuário do início ao fim",
  "business_rules": [
    "Regra de negócio 1",
    "Regra de negócio 2"
  ],
  "recommended_stack": {
    "frontend": ["Tecnologia 1", "Tecnologia 2"],
    "backend": ["Tecnologia 1", "Tecnologia 2"],
    "database": ["Banco de dados"],
    "integrations": ["Integração 1", "Integração 2"],
    "infrastructure": ["Infraestrutura 1"]
  },
  "database_structure": [
    {
      "table": "Nome da tabela",
      "description": "Descrição",
      "main_fields": ["campo1", "campo2", "campo3"]
    }
  ],
  "roadmap": [
    {
      "phase": "Fase 1 - MVP",
      "duration": "X semanas",
      "deliverables": ["Entregável 1", "Entregável 2"]
    }
  ],
  "professional_prompt": "Prompt profissional e completo para um desenvolvedor criar este projeto, incluindo todas as especificações técnicas e funcionais necessárias"
}`;

    const userPrompt = `Gere um blueprint profissional para o seguinte projeto:

NOME DO PROJETO: ${input.projectName}

TIPO DE PRODUTO: ${input.productType}
OBJETIVO DE NEGÓCIO: ${input.businessObjective}

PÚBLICO-ALVO: ${input.audienceType}
USUÁRIOS ESPECÍFICOS: ${input.targetUsers}

PROBLEMA QUE RESOLVE: ${input.problemDescription}

FUNCIONALIDADES DESEJADAS: ${input.coreFeatures}

MODELO DE MONETIZAÇÃO: ${input.monetizationModel}
ESTRATÉGIA DE PREÇOS: ${input.pricingStrategy}

PLATAFORMA: ${input.platformType}
NÍVEL DE COMPLEXIDADE: ${input.complexityLevel}

PREFERÊNCIAS TÉCNICAS: ${input.techPreferences || "Não especificado"}

NOTAS ADICIONAIS: ${input.additionalNotes || "Nenhuma"}

Gere um blueprint completo, específico e profissional para este projeto.`;

    console.log("Calling Lovable AI Gateway...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawResponse = aiData.choices?.[0]?.message?.content;
    
    if (!rawResponse) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("Raw AI response received, parsing JSON...");

    // Parse JSON from response (handle markdown code blocks)
    let parsedBlueprint;
    try {
      let jsonString = rawResponse;
      if (jsonString.includes("```json")) {
        jsonString = jsonString.split("```json")[1].split("```")[0].trim();
      } else if (jsonString.includes("```")) {
        jsonString = jsonString.split("```")[1].split("```")[0].trim();
      }
      parsedBlueprint = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Raw response:", rawResponse);
      throw new Error("Erro ao processar resposta da IA. Tente novamente.");
    }

    // Save blueprint to database
    const { data: blueprint, error: insertError } = await supabase
      .from("generated_blueprints")
      .insert({
        project_id: input.projectId,
        user_id: user.id,
        vision_overview: parsedBlueprint.vision_overview,
        problem_solved: parsedBlueprint.problem_solved,
        value_proposition: parsedBlueprint.value_proposition,
        features_by_module: parsedBlueprint.features_by_module,
        user_flow: parsedBlueprint.user_flow,
        business_rules: parsedBlueprint.business_rules,
        recommended_stack: parsedBlueprint.recommended_stack,
        database_structure: parsedBlueprint.database_structure,
        roadmap: parsedBlueprint.roadmap,
        professional_prompt: parsedBlueprint.professional_prompt,
        raw_ai_response: rawResponse,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Erro ao salvar blueprint no banco de dados");
    }

    // Log the AI usage
    await supabase.from("ai_logs").insert({
      user_id: user.id,
      project_id: input.projectId,
      request_type: "blueprint_generation",
      prompt_sent: userPrompt.substring(0, 1000),
      response_received: rawResponse.substring(0, 1000),
      model_used: "google/gemini-2.5-flash",
      tokens_used: aiData.usage?.total_tokens || null,
    });

    console.log("Blueprint generated and saved successfully:", blueprint.id);

    return new Response(JSON.stringify({ success: true, blueprint }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-blueprint:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido ao gerar blueprint" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});