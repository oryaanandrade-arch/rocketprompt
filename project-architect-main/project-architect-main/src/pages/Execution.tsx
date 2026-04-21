import { Rocket, CheckCircle2, Clock, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/hooks/useProjects";
import { useBlueprints } from "@/hooks/useBlueprints";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Execution() {
  const { data: projects, isLoading } = useProjects();
  const { data: blueprints } = useBlueprints();
  
  // Get AI logs
  const { data: aiLogs } = useQuery({
    queryKey: ["ai-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_logs")
        .select("*, projects(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const inProgressProjects = projects?.filter(p => p.status === "in_progress") ?? [];

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Execução
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o progresso dos seus projetos em andamento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>Em Andamento</CardDescription>
              <CardTitle className="text-3xl">{inProgressProjects.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Projetos ativos
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>Concluídos</CardDescription>
              <CardTitle className="text-3xl">
                {projects?.filter(p => p.status === "completed").length ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Finalizados com sucesso
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>Pendentes</CardDescription>
              <CardTitle className="text-3xl">
                {projects?.filter(p => p.status === "draft").length ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-warning">
                <AlertCircle className="h-4 w-4" />
                Aguardando início
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects in Progress */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Projetos em Execução</CardTitle>
            <CardDescription>
              Acompanhe o progresso de cada projeto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : inProgressProjects.length === 0 ? (
              <div className="text-center py-8">
                <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum projeto em execução no momento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description || "Sem descrição"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={50} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">50%</p>
                      </div>
                      <Badge variant="default">Em Progresso</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
