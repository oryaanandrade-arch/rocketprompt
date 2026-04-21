import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionPlan = "monthly" | "quarterly" | "lifetime";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trialing";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Email do CEO (Plano vitalício Bypass)
      if (user.email === "ryanzinho.andrade@gmail.com") {
        return {
          id: "ceo-lifetime-plan",
          user_id: user.id,
          plan: "lifetime",
          status: "active",
          starts_at: new Date().toISOString(),
          ends_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Subscription;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
  });
}

export function useHasActiveSubscription() {
  const { data: subscription, isLoading } = useSubscription();

  const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";

  // Check if subscription has expired
  if (subscription?.ends_at && new Date(subscription.ends_at) < new Date()) {
    return { hasActiveSubscription: false, isLoading, subscription };
  }

  return { hasActiveSubscription, isLoading, subscription };
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Calculate end date based on plan
      let endsAt: string | null = null;
      const now = new Date();

      if (plan === "monthly") {
        endsAt = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      } else if (plan === "quarterly") {
        endsAt = new Date(now.setMonth(now.getMonth() + 3)).toISOString();
      }
      // Lifetime has no end date

      const { data, error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan,
          status: "active" as SubscriptionStatus,
          starts_at: new Date().toISOString(),
          ends_at: endsAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Subscription;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast({
        title: "Assinatura ativada!",
        description: `Seu plano ${data.plan === "monthly" ? "Mensal" : data.plan === "quarterly" ? "Trimestral" : "Vitalício"} está ativo.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao ativar assinatura",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
