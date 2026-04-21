import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Calendar, Clock, Tag } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "in_progress", label: "Em Progresso" },
  { value: "completed", label: "Concluído" },
  { value: "archived", label: "Arquivado" },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: project, isLoading, error } = useProject(id);
  const updateProject = useUpdateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setStatus(project.status || "draft");
    }
  }, [project]);

  useEffect(() => {
    if (project) {
      const changed =
        name !== project.name ||
        description !== (project.description || "") ||
        status !== (project.status || "draft");
      setHasChanges(changed);
    }
  }, [name, description, status, project]);

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateProject.mutateAsync({
        id,
        name,
        description,
        status: status as "draft" | "in_progress" | "completed" | "archived",
      });
      setHasChanges(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">Projeto não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O projeto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate("/projects")}>Voltar aos Projetos</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SubscriptionGuard>
        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/projects")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar Projeto</h1>
                <p className="text-muted-foreground text-sm">
                  Atualize as informações do seu projeto
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateProject.isPending}
              className="gap-2"
            >
              {updateProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Informações do Projeto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do projeto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva seu projeto..."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Criado em</p>
                      <p className="font-medium">
                        {project.created_at
                          ? format(new Date(project.created_at), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Última atualização</p>
                      <p className="font-medium">
                        {project.updated_at
                          ? format(new Date(project.updated_at), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Status atual</p>
                      <Badge variant="secondary" className="mt-1">
                        {statusOptions.find((s) => s.value === project.status)?.label ||
                          "Rascunho"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/architecture?project=${id}`)}
                  >
                    Ver Arquitetura
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/generator?project=${id}`)}
                  >
                    Gerar Prompt
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SubscriptionGuard>
    </MainLayout>
  );
}
