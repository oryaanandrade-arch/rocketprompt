import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Loader2, Link, FileText, Sparkles, ArrowRight } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useImportIdea, ImportedIdea } from "@/hooks/useBlueprints";
import { useCreateProject } from "@/hooks/useProjects";

interface ImportIdeaModalProps {
  trigger?: React.ReactNode;
}

export function ImportIdeaModal({ trigger }: ImportIdeaModalProps) {
  const [open, setOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [result, setResult] = useState<ImportedIdea | null>(null);
  const navigate = useNavigate();
  
  const importIdea = useImportIdea();
  const createProject = useCreateProject();

  const handleImport = async (type: "text" | "url") => {
    const content = type === "text" ? textInput : urlInput;
    if (!content.trim()) return;

    try {
      const data = await importIdea.mutateAsync({ type, content });
      setResult(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateProject = async () => {
    if (!result) return;

    try {
      const project = await createProject.mutateAsync({
        name: result.projectName,
        description: result.description,
        status: "draft",
      });

      setOpen(false);
      setResult(null);
      setTextInput("");
      setUrlInput("");
      navigate(`/architecture?project=${project.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setTextInput("");
    setUrlInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Importar Ideia
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Importar Ideia com IA
          </DialogTitle>
          <DialogDescription>
            Cole uma ideia em texto ou URL e a IA vai estruturar em um projeto completo
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <Tabs defaultValue="text" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="gap-2">
                <FileText className="h-4 w-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <Link className="h-4 w-4" />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 mt-4">
              <Textarea
                placeholder="Descreva sua ideia de produto digital...&#10;&#10;Ex: Quero criar um app de delivery para pet shops que permite agendar banho e tosa, comprar ração e acessórios, com sistema de assinatura mensal."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button 
                onClick={() => handleImport("text")}
                disabled={!textInput.trim() || importIdea.isPending}
                className="w-full gap-2"
              >
                {importIdea.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Analisar com IA
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-4">
              <Input
                type="url"
                placeholder="https://exemplo.com/produto"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL de um site, landing page ou produto existente. A IA vai analisar e criar um projeto similar.
              </p>
              <Button 
                onClick={() => handleImport("url")}
                disabled={!urlInput.trim() || importIdea.isPending}
                className="w-full gap-2"
              >
                {importIdea.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Analisar URL com IA
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6 mt-4">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Interpretação da IA</p>
                  <p className="text-sm">{result.interpretation}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">{result.projectName}</h4>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Tipo</p>
                  <Badge variant="secondary">{result.productType}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Plataforma</p>
                  <Badge variant="secondary">{result.platformSuggestion}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Monetização</p>
                  <Badge variant="secondary">{result.monetizationSuggestion}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Complexidade</p>
                  <Badge variant="secondary">{result.complexityEstimate}</Badge>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-sm">Público-alvo</p>
                <p className="text-sm">{result.targetAudience}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-sm">Problema que resolve</p>
                <p className="text-sm">{result.problemSolved}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-sm">Features sugeridas</p>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedFeatures.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={createProject.isPending}
                className="flex-1 gap-2"
              >
                {createProject.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Criar Projeto
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}