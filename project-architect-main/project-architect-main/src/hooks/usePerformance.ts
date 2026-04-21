import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PerformanceMetrics {
  leadsToday: number;
  leadsMonth: number;
  totalScore: number;
  converted: number;
  proposalsAccepted: number;
  proposalsSent: number;
  averageTicket: number;
  totalRevenue: number;
  recurringContracts: number;
  activeContracts: number;
  conversionRate: number;
}

export function usePerformanceMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["performance-metrics", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<PerformanceMetrics> => {
      const { data: contracts } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user!.id);

      const list = (contracts || []) as any[];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const leadsToday = list.filter(
        (c) => new Date(c.created_at) >= today
      ).length;
      const leadsMonth = list.filter(
        (c) => new Date(c.created_at) >= startMonth
      ).length;

      const proposalsSent = list.filter((c) =>
        ["sent", "viewed", "signed"].includes(c.status)
      ).length;

      const proposalsAccepted = list.filter((c) => c.status === "signed").length;
      const converted = proposalsAccepted;
      const activeContracts = list.filter((c) => c.status === "signed").length;

      const signedContracts = list.filter((c) => c.status === "signed");
      const totalRevenue = signedContracts.reduce(
        (sum, c) => sum + Number(c.contract_value || 0),
        0
      );
      const averageTicket =
        signedContracts.length > 0 ? totalRevenue / signedContracts.length : 0;

      const recurringContracts = signedContracts.filter((c) =>
        /(mensal|recorr|assinatura|mensalidade)/i.test(
          `${c.payment_conditions || ""} ${c.service_type || ""}`
        )
      ).length;

      const conversionRate =
        proposalsSent > 0 ? (proposalsAccepted / proposalsSent) * 100 : 0;

      // Score = quality indicator combining volume + conversion
      const totalScore = Math.min(
        100,
        Math.round(conversionRate * 0.6 + Math.min(leadsMonth, 50) * 0.8)
      );

      return {
        leadsToday,
        leadsMonth,
        totalScore,
        converted,
        proposalsAccepted,
        proposalsSent,
        averageTicket,
        totalRevenue,
        recurringContracts,
        activeContracts,
        conversionRate,
      };
    },
  });
}
