import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Contract {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  project_description: string;
  deadline: string | null;
  contract_value: number;
  payment_conditions: string | null;
  contract_content: string;
  status: "draft" | "sent" | "viewed" | "signed" | "cancelled";
  sign_token: string;
  signed_at: string | null;
  signed_ip: string | null;
  client_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContractInput {
  client_name: string;
  client_email: string;
  service_type: string;
  project_description: string;
  deadline?: string;
  contract_value: number;
  payment_conditions?: string;
}

export function useContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contracts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Contract[];
    },
    enabled: !!user,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateContractInput) => {
      const { data, error } = await supabase.functions.invoke("generate-contract", {
        body: input,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.contract as Contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contrato gerado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao gerar contrato", description: error.message, variant: "destructive" });
    },
  });
}

export function useSendContractEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contractId: string) => {
      const baseUrl = window.location.origin;
      const { data, error } = await supabase.functions.invoke("send-contract-email", {
        body: { contract_id: contractId, base_url: baseUrl },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contrato enviado por email!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao enviar email", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("contracts")
        .update({ status, updated_at: new Date().toISOString() } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contrato removido" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover contrato", description: error.message, variant: "destructive" });
    },
  });
}
