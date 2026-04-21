import { useNavigate } from "react-router-dom";
import { FolderKanban, CheckCircle, Clock, TrendingUp, Loader2, MessageSquare, ArrowRight, FileText } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useProjects, useProjectStats, useBlueprintStats } from "@/hooks/useProjects";
import { useGeneratedPrompts } from "@/hooks/useChat";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: stats, isLoading: statsLoading } = useProjectStats();
  const { data: blueprintStats } = useBlueprintStats();
  const { data: prompts } = useGeneratedPrompts();
  const { data: profile } = useProfile();

  const isLoading = projectsLoading || statsLoading;

  const statsData = [
    {
      title: "Total de Projetos",
      value: stats?.total ?? 0,
      change: `+${stats?.thisMonthCount ?? 0} este mês`,
      changeType: "positive" as const,
      icon: FolderKanban,
    },
    {
      title: "Prompts Gerados",
      value: prompts?.length ?? 0,
      change: "Prontos para usar",
      changeType: "positive" as const,
      icon: FileText,
    },
    {
      title: "Blueprints",
      value: blueprintStats?.total ?? 0,
      change: `+${blueprintStats?.thisWeekCount ?? 0} esta semana`,
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Horas Economizadas",
      value: `${((blueprintStats?.total ?? 0) + (prompts?.length ?? 0)) * 2}h`,
      change: "Com ajuda da IA",
      changeType: "positive" as const,
      icon: Clock,
    },
  ];

  const recentProjects = (projects ?? []).slice(0, 4);

  return (
    <>
      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {profile?.full_name ? (
            <>Olá, <span className="gradient-text">{profile.full_name.split(' ')[0]}</span>!</>
          ) : (
            <>Bem-vindo ao <span className="gradient-text">RocketPrompt</span></>
          )}
        </h1>
        <p className="text-muted-foreground">
          Transforme suas ideias em prompts profissionais prontos para o Lovable.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main CTA */}
          <div 
            className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden cursor-pointer group opacity-0 animate-fade-up"
            style={{ animationDelay: "100ms" }}
            onClick={() => navigate("/generator")}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse-glow shrink-0">
                <MessageSquare className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold mb-1">Gerar Prompt com IA</h2>
                <p className="text-muted-foreground">
                  Converse com a IA e receba um prompt profissional pronto para o Lovable
                </p>
              </div>
              <Button size="lg" className="glow-effect shrink-0">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsData.map((stat, index) => (
              <StatsCard key={stat.title} {...stat} delay={200 + index * 100} />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
            <div 
              className="glass-card-hover rounded-xl p-6 cursor-pointer"
              onClick={() => navigate("/generator")}
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Novo Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Converse com a IA e gere prompts profissionais
              </p>
            </div>

            <div 
              className="glass-card-hover rounded-xl p-6 cursor-pointer"
              onClick={() => navigate("/projects")}
            >
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <FolderKanban className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Meus Projetos</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie seus projetos e blueprints
              </p>
            </div>

            <div 
              className="glass-card-hover rounded-xl p-6 cursor-pointer"
              onClick={() => navigate("/library")}
            >
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Biblioteca</h3>
              <p className="text-sm text-muted-foreground">
                Templates e prompts salvos
              </p>
            </div>
          </div>

          {/* Projects & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between opacity-0 animate-fade-up" style={{ animationDelay: "700ms" }}>
                <h2 className="text-lg font-semibold">Projetos Recentes</h2>
                <a href="/projects" className="text-sm text-primary hover:underline">
                  Ver todos
                </a>
              </div>
              
              {recentProjects.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center opacity-0 animate-fade-up" style={{ animationDelay: "750ms" }}>
                  <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece gerando seu primeiro prompt com a IA.
                  </p>
                  <Button onClick={() => navigate("/generator")}>
                    Gerar Prompt
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      delay={750 + index * 100}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <RecentActivity />
            </div>
          </div>
        </>
      )}
    </>
  );
}
