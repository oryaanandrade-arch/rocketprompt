import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAuditEvent } from "@/hooks/useAuditLog";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type ProjectInsert = TablesInsert<"projects">;
export type ProjectUpdate = TablesUpdate<"projects">;

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Project | null;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (project: Omit<ProjectInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("projects")
        .insert({ ...project, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log project creation
      await logAuditEvent({
        eventType: 'project_created',
        userId: user.id,
        success: true,
        metadata: { projectId: data.id, projectName: data.name }
      });
      
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Projeto criado!",
        description: "Seu projeto foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log project update
      if (user) {
        await logAuditEvent({
          eventType: 'project_updated',
          userId: user.id,
          success: true,
          metadata: { projectId: data.id, projectName: data.name }
        });
      }
      
      return data as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
      toast({
        title: "Projeto atualizado!",
        description: "Alterações salvas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Log project deletion
      if (user) {
        await logAuditEvent({
          eventType: 'project_deleted',
          userId: user.id,
          success: true,
          metadata: { projectId: id }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Projeto excluído!",
        description: "O projeto foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Stats hook for dashboard
export function useProjectStats() {
  return useQuery({
    queryKey: ["project-stats"],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("status, created_at");
      
      if (error) throw error;

      const total = projects?.length ?? 0;
      const completed = projects?.filter(p => p.status === "completed").length ?? 0;
      const inProgress = projects?.filter(p => p.status === "in_progress").length ?? 0;
      const draft = projects?.filter(p => p.status === "draft").length ?? 0;
      
      // Projects created this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const thisMonthCount = projects?.filter(p => new Date(p.created_at!) >= thisMonth).length ?? 0;

      return {
        total,
        completed,
        inProgress,
        draft,
        thisMonthCount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    },
  });
}

// Blueprints stats
export function useBlueprintStats() {
  return useQuery({
    queryKey: ["blueprint-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_blueprints")
        .select("created_at");
      
      if (error) throw error;

      const total = data?.length ?? 0;
      
      // This week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekCount = data?.filter(b => new Date(b.created_at!) >= weekAgo).length ?? 0;

      return { total, thisWeekCount };
    },
  });
}
