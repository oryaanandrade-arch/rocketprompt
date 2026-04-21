import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportInput {
  type: "text" | "url";
  content: string;
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

    const input: ImportInput = await req.json();
    console.log("Processing import:", input.type);

    let contentToAnalyze = input.content;

    // If URL, try to fetch basic info
    if (input.type === "url") {
      try {
        const urlResponse = await fetch(input.content, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ArchitectAI/1.0)" },
        });
        
        if (urlResponse.ok) {
          const html = await urlResponse.text();
          // Extract title and meta description
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
          const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          
          const title = titleMatch ? titleMatch[1].trim() : "";
          const description = descMatch ? descMatch[1].trim() : "";
          const h1 = h1Match ? h1Match[1].trim() : "";
          
          contentToAnalyze = `URL: ${input.content}\nTítulo: ${title}\nDescrição: ${description}\nH1: ${h1}`;
        }
      } catch (fetchError) {
        console.log("Could not fetch URL, using URL as-is:", fetchError);
        contentToAnalyze = `URL para analisar: ${input.content}`;
      }
    }

    const systemPrompt = `Você é um especialista em análise de ideias e produtos digitais. 

Sua missão é analisar a ideia ou URL fornecida e extrair/inferir informações estruturadas para criar um projeto digital.

REGRAS:
- Seja criativo mas realista
- Infira informações quando não explícitas
- Sugira um nome de projeto atraente
- Use português brasileiro
- Seja específico, não genérico

Responda EXCLUSIVAMENTE em JSON válido:
{
  "projectName": "Nome sugerido para o projeto",
  "productType": "site|saas|app|marketplace|sistema",
  "description": "Descrição clara do que é o projeto (2-3 frases)",
  "targetAudience": "Público-alvo identificado",
  "problemSolved": "Principal problema que resolve",
  "suggestedFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "monetizationSuggestion": "assinatura|one_time|freemium|comissao|hibrido",
  "platformSuggestion": "web|mobile|ambos",
  "complexityEstimate": "mvp|produto_vendavel|escala",
  "interpretation": "Breve explicação de como você interpretou a ideia original"
}`;

    const userPrompt = input.type === "url" 
      ? `Analise este site/produto e extraia informações para criar um projeto similar ou inspirado:\n\n${contentToAnalyze}`
      : `Analise esta ideia e estruture-a em um projeto digital:\n\n${contentToAnalyze}`;

    console.log("Calling Lovable AI Gateway for import analysis...");

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
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }), {
          status: 429,
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

    // Parse JSON
    let parsedResult;
    try {
      let jsonString = rawResponse;
      if (jsonString.includes("```json")) {
        jsonString = jsonString.split("```json")[1].split("```")[0].trim();
      } else if (jsonString.includes("```")) {
        jsonString = jsonString.split("```")[1].split("```")[0].trim();
      }
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Erro ao processar resposta da IA");
    }

    // Log the AI usage
    await supabase.from("ai_logs").insert({
      user_id: user.id,
      request_type: "import_idea",
      prompt_sent: userPrompt.substring(0, 1000),
      response_received: rawResponse.substring(0, 1000),
      model_used: "google/gemini-2.5-flash",
      tokens_used: aiData.usage?.total_tokens || null,
    });

    console.log("Import analysis completed successfully");

    return new Response(JSON.stringify({ success: true, data: parsedResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in import-idea:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar importação" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});