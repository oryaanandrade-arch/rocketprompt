import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  plan: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Payment[];
    },
  });
}
