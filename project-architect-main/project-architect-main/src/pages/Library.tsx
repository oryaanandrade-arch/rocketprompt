import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Library as LibraryIcon, 
  FileText, 
  Copy, 
  Search, 
  Loader2,
  MessageSquare,
  Trash2,
  Check
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplates, ProjectTemplate } from "@/hooks/useTemplates";
import { useGeneratedPrompts } from "@/hooks/useChat";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Library() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: templates, isLoading: loadingTemplates } = useTemplates();
  const { data: prompts, isLoading: loadingPrompts } = useGeneratedPrompts();
  const createProject = useCreateProject();

  const filteredTemplates = templates?.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase()) ||
      template.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPrompts = prompts?.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      prompt.prompt_content.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseTemplate = async (template: ProjectTemplate) => {
    try {
      const project = await createProject.mutateAsync({
        name: `${template.name} - Novo`,
        description: template.description || `Projeto baseado no template ${template.name}`,
        status: "draft",
      });

      toast({
        title: "Projeto criado!",
        description: `Projeto criado com base no template "${template.name}".`,
      });

      navigate(`/architecture?project=${project.id}&template=${template.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyPrompt = (promptId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(promptId);
    toast({ title: "Prompt copiado!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <LibraryIcon className="h-8 w-8 text-primary" />
              Biblioteca
            </h1>
            <p className="text-muted-foreground mt-1">
              Templates, prompts salvos e recursos prontos
            </p>
          </div>
          <Button onClick={() => navigate("/generator")} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Novo Prompt
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="prompts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="prompts" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Meus Prompts
              {prompts && prompts.length > 0 && (
                <Badge variant="secondary" className="ml-1">{prompts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            {loadingPrompts ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPrompts && filteredPrompts.length > 0 ? (
              <div className="grid gap-4">
                {filteredPrompts.map((prompt) => (
                  <Card key={prompt.id} className="glass-card group hover:border-primary/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(prompt.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          variant={copiedId === prompt.id ? "default" : "outline"}
                          onClick={() => handleCopyPrompt(prompt.id, prompt.prompt_content)}
                        >
                          {copiedId === prompt.id ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4 max-h-32 overflow-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                          {prompt.prompt_content.slice(0, 500)}
                          {prompt.prompt_content.length > 500 && "..."}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum prompt salvo</h3>
                <p className="text-muted-foreground mb-4">
                  Gere seu primeiro prompt conversando com a IA
                </p>
                <Button onClick={() => navigate("/generator")}>
                  Gerar Prompt
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTemplates && filteredTemplates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="glass-card group hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <CardTitle className="mt-4">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.tags?.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {template.default_features && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Funcionalidades:</p>
                          <div className="text-xs text-muted-foreground">
                            {(template.default_features as string[]).slice(0, 3).join(" • ")}
                            {(template.default_features as string[]).length > 3 && " ..."}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full gap-2"
                        onClick={() => handleUseTemplate(template)}
                        disabled={createProject.isPending}
                      >
                        {createProject.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Usar Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <LibraryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                <p className="text-muted-foreground">
                  {search ? "Tente ajustar sua busca" : "Nenhum template disponível no momento"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
