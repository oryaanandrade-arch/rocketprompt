import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "welcome" | "weekly_report" | "project_update" | "notification";
  to: string;
  subject?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (type: string, data: Record<string, any> = {}) => {
  switch (type) {
    case "welcome":
      return {
        subject: "Bem-vindo ao Deer Mafia! 🦌",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6; margin-bottom: 24px;">Bem-vindo ao Deer Mafia! 🦌</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Olá${data.name ? `, ${data.name}` : ''}!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Estamos muito felizes em ter você conosco. Agora você tem acesso às melhores ferramentas 
              de geração de prompts e planejamento de projetos.
            </p>
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 12px; margin: 24px 0;">
              <p style="color: white; font-size: 18px; margin: 0; text-align: center;">
                🚀 Comece agora a transformar suas ideias em realidade!
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Equipe Deer Mafia
            </p>
          </div>
        `,
      };
    case "weekly_report":
      return {
        subject: "📊 Seu Relatório Semanal - Deer Mafia",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6; margin-bottom: 24px;">📊 Relatório Semanal</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Olá${data.name ? `, ${data.name}` : ''}!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Aqui está um resumo da sua atividade na última semana:
            </p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 24px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280;">Projetos criados:</span>
                <strong style="color: #374151;">${data.projectsCreated || 0}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280;">Prompts gerados:</span>
                <strong style="color: #374151;">${data.promptsGenerated || 0}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">Blueprints criados:</span>
                <strong style="color: #374151;">${data.blueprintsCreated || 0}</strong>
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Continue assim! 🚀<br/>
              Equipe Deer Mafia
            </p>
          </div>
        `,
      };
    case "project_update":
      return {
        subject: `🔔 Atualização no projeto: ${data.projectName || 'Seu projeto'}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6; margin-bottom: 24px;">🔔 Atualização de Projeto</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Olá${data.name ? `, ${data.name}` : ''}!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              O projeto <strong>${data.projectName || 'Seu projeto'}</strong> foi atualizado.
            </p>
            <div style="background: #dbeafe; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 24px 0;">
              <p style="color: #1e40af; margin: 0;">
                ${data.message || 'Nova atualização disponível.'}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Equipe Deer Mafia
            </p>
          </div>
        `,
      };
    case "notification":
    default:
      return {
        subject: data.subject || "Notificação - Deer Mafia",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6; margin-bottom: 24px;">🔔 Notificação</h1>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${data.message || 'Você tem uma nova notificação.'}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              Equipe Deer Mafia
            </p>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, subject, data }: EmailRequest = await req.json();

    if (!to) {
      throw new Error("Email recipient is required");
    }

    const template = getEmailTemplate(type, data);

    const emailResponse = await resend.emails.send({
      from: "Deer Mafia <onboarding@resend.dev>",
      to: [to],
      subject: subject || template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
