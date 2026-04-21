import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionPlan, SubscriptionStatus } from "@/hooks/useSubscription";

export interface AdminUser {
  id: string;
  email: string;
  email_verified: boolean;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  profile: {
    full_name: string | null;
    phone_number: string | null;
    is_blocked: boolean;
    blocked_at: string | null;
    blocked_reason: string | null;
  } | null;
  subscription: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    starts_at: string;
    ends_at: string | null;
  } | null;
  role: {
    role: "admin" | "moderator" | "user" | "ceo";
  } | null;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "GET",
      });

      if (error) throw error;
      return data.users as AdminUser[];
    },
  });
}

export function useUpdateUserSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      plan,
      status,
    }: {
      userId: string;
      plan?: SubscriptionPlan;
      status?: SubscriptionStatus;
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "POST",
        body: { action: "update-subscription", userId, plan, status },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Assinatura atualizada",
        description: "A assinatura do usuário foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "moderator" | "user";
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "POST",
        body: { action: "update-role", userId, role },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Permissão atualizada",
        description: "A permissão do usuário foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      blocked,
      blockedReason,
    }: {
      userId: string;
      blocked: boolean;
      blockedReason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "POST",
        body: { action: "block-user", userId, blocked, blockedReason },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: variables.blocked ? "Usuário bloqueado" : "Usuário desbloqueado",
        description: variables.blocked 
          ? "O usuário foi bloqueado e não poderá acessar a ferramenta."
          : "O usuário foi desbloqueado e pode acessar novamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
