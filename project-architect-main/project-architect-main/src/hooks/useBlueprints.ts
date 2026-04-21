import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Blueprint = Tables<"generated_blueprints">;

export function useBlueprints() {
  return useQuery({
    queryKey: ["blueprints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_blueprints")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useBlueprintByProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["blueprints", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("generated_blueprints")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Blueprint | null;
    },
    enabled: !!projectId,
  });
}

interface GenerateBlueprintInput {
  projectId: string;
  projectName: string;
  productType: string;
  businessObjective: string;
  audienceType: string;
  targetUsers: string;
  problemDescription: string;
  coreFeatures: string;
  monetizationModel: string;
  pricingStrategy: string;
  platformType: string;
  complexityLevel: string;
  techPreferences: string;
  additionalNotes: string;
}

export function useGenerateBlueprint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: GenerateBlueprintInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-blueprint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(input),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erro ao gerar blueprint");
      }

      return result.blueprint as Blueprint;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      queryClient.invalidateQueries({ queryKey: ["blueprints", data.project_id] });
      toast({
        title: "Blueprint gerado!",
        description: "Seu projeto foi estruturado pela IA com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao gerar blueprint",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

interface ImportIdeaInput {
  type: "text" | "url";
  content: string;
}

export interface ImportedIdea {
  projectName: string;
  productType: string;
  description: string;
  targetAudience: string;
  problemSolved: string;
  suggestedFeatures: string[];
  monetizationSuggestion: string;
  platformSuggestion: string;
  complexityEstimate: string;
  interpretation: string;
}

export function useImportIdea() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: ImportIdeaInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-idea`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(input),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erro ao importar ideia");
      }

      return result.data as ImportedIdea;
    },
    onSuccess: () => {
      toast({
        title: "Ideia analisada!",
        description: "A IA estruturou sua ideia com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao importar ideia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}