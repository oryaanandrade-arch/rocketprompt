import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeamento dos planos Perfect Pay para nosso sistema
const PLAN_MAPPING: Record<string, string> = {
  // Configure aqui os IDs dos produtos Perfect Pay
  "mensal": "monthly",
  "trimestral": "quarterly", 
  "vitalicio": "lifetime",
  "monthly": "monthly",
  "quarterly": "quarterly",
  "lifetime": "lifetime",
};

// Status mapping Perfect Pay -> nosso sistema
const STATUS_MAPPING: Record<string, string> = {
  "approved": "active",
  "pending": "trialing",
  "in_process": "trialing",
  "authorized": "active",
  "complete": "active",
  "cancelled": "cancelled",
  "refunded": "cancelled",
  "rejected": "expired",
  "expired": "expired",
};

interface PerfectPayWebhook {
  // Campos comuns do Perfect Pay webhook
  sale_id?: string;
  transaction_id?: string;
  customer_email?: string;
  customer_name?: string;
  status?: string;
  sale_status_enum?: string;
  product_id?: string;
  product_name?: string;
  plan?: string;
  payment_type?: string;
  payment_method?: string;
  sale_amount?: number;
  amount?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  // Dados extras
  [key: string]: unknown;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar método
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obter secret para validação (opcional, mas recomendado)
    const webhookSecret = Deno.env.get("PERFECTPAY_WEBHOOK_SECRET");
    
    // Validar token de autorização se configurado
    const authHeader = req.headers.get("authorization") || req.headers.get("x-webhook-secret");
    if (webhookSecret && authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error("Webhook secret inválido");
      // Em produção, você pode retornar 401. Por enquanto, logamos e continuamos
      // return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Parse do body
    const payload: PerfectPayWebhook = await req.json();
    console.log("Perfect Pay Webhook recebido:", JSON.stringify(payload, null, 2));

    // Extrair dados relevantes
    const customerEmail = payload.customer_email;
    const transactionId = payload.transaction_id || payload.sale_id || crypto.randomUUID();
    const rawStatus = payload.status || payload.sale_status_enum || "pending";
    const rawPlan = payload.plan || payload.product_name || "";
    const amount = payload.sale_amount || payload.amount || 0;
    const paymentMethod = payload.payment_type || payload.payment_method || "unknown";

    if (!customerEmail) {
      console.error("Email do cliente não encontrado no webhook");
      return new Response(
        JSON.stringify({ error: "Customer email not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mapear status e plano
    const status = STATUS_MAPPING[rawStatus.toLowerCase()] || "trialing";
    const plan = PLAN_MAPPING[rawPlan.toLowerCase()] || detectPlanFromName(rawPlan);

    console.log(`Processando: email=${customerEmail}, status=${status}, plan=${plan}, transactionId=${transactionId}`);

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar usuário pelo email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Erro ao buscar usuários:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to lookup user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
    
    if (!user) {
      console.error(`Usuário não encontrado para email: ${customerEmail}`);
      // Retornamos 200 para não reenviar o webhook
      return new Response(
        JSON.stringify({ success: false, message: "User not found, webhook acknowledged" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`Usuário encontrado: ${userId}`);

    // Calcular datas de início e fim baseado no plano
    const startsAt = new Date().toISOString();
    let endsAt: string | null = null;
    
    if (plan === "monthly") {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      endsAt = endDate.toISOString();
    } else if (plan === "quarterly") {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      endsAt = endDate.toISOString();
    }
    // Lifetime não tem data de fim

    // Verificar se já existe assinatura para este usuário
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let subscriptionId: string;

    if (existingSubscription) {
      // Atualizar assinatura existente
      const { data: updatedSub, error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan,
          status,
          starts_at: startsAt,
          ends_at: endsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select("id")
        .single();

      if (updateError) {
        console.error("Erro ao atualizar assinatura:", updateError);
        throw updateError;
      }
      
      subscriptionId = updatedSub.id;
      console.log(`Assinatura atualizada: ${subscriptionId}`);
    } else {
      // Criar nova assinatura
      const { data: newSub, error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan,
          status,
          starts_at: startsAt,
          ends_at: endsAt,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Erro ao criar assinatura:", insertError);
        throw insertError;
      }

      subscriptionId = newSub.id;
      console.log(`Nova assinatura criada: ${subscriptionId}`);
    }

    // Registrar pagamento
    const { error: paymentError } = await supabase
      .from("payments")
      .upsert({
        user_id: userId,
        subscription_id: subscriptionId,
        transaction_id: transactionId,
        amount: amount / 100, // Converter de centavos se necessário
        currency: payload.currency || "BRL",
        status: status === "active" ? "completed" : "pending",
        payment_method: paymentMethod,
        plan,
        metadata: payload,
      }, {
        onConflict: "transaction_id",
      });

    if (paymentError) {
      console.error("Erro ao registrar pagamento:", paymentError);
      // Não falhamos o webhook por isso
    } else {
      console.log("Pagamento registrado com sucesso");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Subscription updated successfully",
        subscription_id: subscriptionId,
        user_id: userId,
        plan,
        status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Erro no webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper para detectar plano a partir do nome do produto
function detectPlanFromName(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("mensal") || lowerName.includes("monthly")) return "monthly";
  if (lowerName.includes("trimestral") || lowerName.includes("quarterly")) return "quarterly";
  if (lowerName.includes("vitalicio") || lowerName.includes("lifetime") || lowerName.includes("vitalício")) return "lifetime";
  return "monthly"; // Default
}