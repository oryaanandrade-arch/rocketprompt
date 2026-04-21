import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em criar prompts perfeitos para ferramentas de desenvolvimento com IA como Lovable, Cursor, e similares.

Sua tarefa é MELHORAR o prompt fornecido pelo usuário, tornando-o:
1. Mais detalhado e específico
2. Mais técnico e profissional
3. Com instruções claras e estruturadas
4. Com contexto completo sobre o projeto
5. Com requisitos técnicos bem definidos

Estruture o prompt melhorado em seções claras:
- CONTEXTO: Visão geral do projeto
- OBJETIVO: O que deve ser construído
- PÚBLICO-ALVO: Quem vai usar
- FUNCIONALIDADES: Lista detalhada de features
- FLUXO DO USUÁRIO: Jornada principal
- REGRAS DE NEGÓCIO: Validações e lógica
- EXPERIÊNCIA VISUAL: Design e UX esperados
- STACK TÉCNICA: Tecnologias sugeridas
- REQUISITOS TÉCNICOS: Performance, segurança, etc.
- INSTRUÇÃO FINAL: Comando claro para a IA

Mantenha o tom profissional e técnico. Adicione detalhes relevantes que o usuário pode ter esquecido.
Retorne APENAS o prompt melhorado, sem explicações adicionais.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Melhore este prompt:\n\n${prompt}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione mais créditos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to improve prompt");
    }

    const data = await response.json();
    const improvedPrompt = data.choices?.[0]?.message?.content;

    if (!improvedPrompt) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({ improvedPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("improve-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
