import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ActivityItem {
  id: string;
  type: "blueprint_generated" | "project_completed" | "project_updated" | "project_created";
  title: string;
  description: string;
  time: string;
  createdAt: Date;
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const activities: ActivityItem[] = [];

      // Get recent blueprints
      const { data: blueprints } = await supabase
        .from("generated_blueprints")
        .select("id, created_at, project_id, projects(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      blueprints?.forEach((b) => {
        activities.push({
          id: `blueprint-${b.id}`,
          type: "blueprint_generated",
          title: "Blueprint gerado",
          description: (b.projects as unknown as { name: string })?.name ?? "Projeto",
          time: formatDistanceToNow(new Date(b.created_at!), { addSuffix: true, locale: ptBR }),
          createdAt: new Date(b.created_at!),
        });
      });

      // Get recent projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, status, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);

      projects?.forEach((p) => {
        const isNew = new Date(p.created_at!).getTime() === new Date(p.updated_at!).getTime();
        
        if (p.status === "completed") {
          activities.push({
            id: `project-completed-${p.id}`,
            type: "project_completed",
            title: "Projeto concluído",
            description: p.name,
            time: formatDistanceToNow(new Date(p.updated_at!), { addSuffix: true, locale: ptBR }),
            createdAt: new Date(p.updated_at!),
          });
        } else if (isNew) {
          activities.push({
            id: `project-created-${p.id}`,
            type: "project_created",
            title: "Novo projeto criado",
            description: p.name,
            time: formatDistanceToNow(new Date(p.created_at!), { addSuffix: true, locale: ptBR }),
            createdAt: new Date(p.created_at!),
          });
        } else {
          activities.push({
            id: `project-updated-${p.id}`,
            type: "project_updated",
            title: "Projeto atualizado",
            description: p.name,
            time: formatDistanceToNow(new Date(p.updated_at!), { addSuffix: true, locale: ptBR }),
            createdAt: new Date(p.updated_at!),
          });
        }
      });

      // Sort by date and take top 5
      return activities
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
    },
  });
}
