import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ArchitectureAnswers = Tables<"architecture_answers">;
export type ArchitectureAnswersInsert = TablesInsert<"architecture_answers">;
export type ArchitectureAnswersUpdate = TablesUpdate<"architecture_answers">;

export function useArchitectureAnswers(projectId: string | undefined) {
  return useQuery({
    queryKey: ["architecture-answers", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("architecture_answers")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ArchitectureAnswers | null;
    },
    enabled: !!projectId,
  });
}

export function useSaveArchitectureAnswers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (answers: ArchitectureAnswersInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Check if answers already exist
      const { data: existing } = await supabase
        .from("architecture_answers")
        .select("id")
        .eq("project_id", answers.project_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("architecture_answers")
          .update({
            ...answers,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as ArchitectureAnswers;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("architecture_answers")
          .insert({
            ...answers,
            user_id: user.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as ArchitectureAnswers;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["architecture-answers", data.project_id] });
      toast({
        title: "Respostas salvas!",
        description: "Suas respostas foram salvas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar respostas",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}