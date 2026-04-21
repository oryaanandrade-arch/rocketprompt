import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Loader2, Copy, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates, ProjectTemplate } from "@/hooks/useTemplates";
import { useCreateProject } from "@/hooks/useProjects";

interface TemplatesModalProps {
  trigger?: React.ReactNode;
}

export function TemplatesModal({ trigger }: TemplatesModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const navigate = useNavigate();

  const { data: templates, isLoading } = useTemplates();
  const createProject = useCreateProject();

  const filteredTemplates = templates?.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase()) ||
      template.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const project = await createProject.mutateAsync({
        name: `${selectedTemplate.name} - Novo`,
        description: selectedTemplate.description || `Projeto baseado no template ${selectedTemplate.name}`,
        status: "draft",
      });

      setOpen(false);
      setSelectedTemplate(null);
      setSearch("");
      navigate(`/architecture?project=${project.id}&template=${selectedTemplate.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBack = () => {
    setSelectedTemplate(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTemplate(null);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Biblioteca de Templates</DialogTitle>
          <DialogDescription>
            {selectedTemplate 
              ? `Detalhes do template: ${selectedTemplate.name}`
              : "Escolha um template para começar seu projeto rapidamente"
            }
          </DialogDescription>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates?.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {template.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredTemplates?.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum template encontrado</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                <Badge variant="secondary">{selectedTemplate.category}</Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm">Funcionalidades Incluídas</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedTemplate.default_features as string[] || []).map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm">Stack Tecnológica</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedTemplate.default_stack as string[] || []).map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedTemplate.business_rules && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Regras de Negócio</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.business_rules}</p>
                </div>
              )}

              {selectedTemplate.user_flow && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Fluxo do Usuário</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.user_flow}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={handleCreateFromTemplate}
                disabled={createProject.isPending}
                className="flex-1 gap-2"
              >
                {createProject.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Usar Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}