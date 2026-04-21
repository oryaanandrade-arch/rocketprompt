import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface EmailPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  weekly_reports: boolean;
  project_updates: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmailPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["email-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("email_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as EmailPreferences | null;
    },
    enabled: !!user?.id,
  });

  const upsertMutation = useMutation({
    mutationFn: async (preferences: Partial<EmailPreferences>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("email_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-preferences"] });
      toast({
        title: "Preferências salvas",
        description: "Suas preferências de email foram atualizadas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
      console.error("Error saving email preferences:", error);
    },
  });

  const sendTestEmail = useMutation({
    mutationFn: async (type: "welcome" | "weekly_report" | "project_update") => {
      if (!user?.email) throw new Error("User email not found");

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          type,
          to: user.email,
          data: {
            name: user.user_metadata?.full_name || "Usuário",
            projectsCreated: 5,
            promptsGenerated: 12,
            blueprintsCreated: 3,
            projectName: "Meu Projeto",
            message: "Este é um email de teste para verificar as notificações.",
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o email de teste.",
        variant: "destructive",
      });
      console.error("Error sending test email:", error);
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    updatePreferences: upsertMutation.mutate,
    isUpdating: upsertMutation.isPending,
    sendTestEmail: sendTestEmail.mutate,
    isSendingTest: sendTestEmail.isPending,
  };
}
