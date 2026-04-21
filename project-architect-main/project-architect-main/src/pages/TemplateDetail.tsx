import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { promptTemplates } from "@/data/promptTemplates";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  Layers,
  FileText,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const template = useMemo(
    () => promptTemplates.find((t) => t.id === id),
    [id]
  );

  const related = useMemo(() => {
    if (!template) return [];
    return promptTemplates
      .filter((t) => t.id !== template.id && t.category === template.category)
      .slice(0, 3);
  }, [template]);

  if (!template) {
    return (
      <MainLayout>
        <div className="text-center py-20 space-y-4">
          <h1 className="text-2xl font-bold">Template não encontrado</h1>
          <Button onClick={() => navigate("/templates")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para galeria
          </Button>
        </div>
      </MainLayout>
    );
  }

  const Icon = template.icon;

  // Generate examples based on the base prompt by replacing placeholders
  const examples = generateExamples(template);
  const variations = generateVariations(template);

  const handleUseTemplate = () => {
    navigate(`/generator?template=${template.id}`);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Prompt copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full mx-auto">
        {/* Back link */}
        <Link
          to="/templates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a galeria
        </Link>

        {/* Hero */}
        <Card className="overflow-hidden border-border bg-card">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] bg-muted">
              {template.imageUrl ? (
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <Icon className="h-24 w-24 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/40" />
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="border border-border">
                    <Icon className="h-3 w-3 mr-1" />
                    {template.category}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {template.name}
                </h1>
                <p className="text-muted-foreground">{template.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleUseTemplate} size="lg" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Usar este modelo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={() => handleCopy(template.basePrompt)}
                  size="lg"
                  variant="outline"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="prompt" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="prompt">
              <FileText className="h-4 w-4 mr-1.5" />
              Prompt
            </TabsTrigger>
            <TabsTrigger value="examples">
              <Lightbulb className="h-4 w-4 mr-1.5" />
              Exemplos
            </TabsTrigger>
            <TabsTrigger value="variations">
              <Layers className="h-4 w-4 mr-1.5" />
              Variações
            </TabsTrigger>
          </TabsList>

          {/* Prompt completo */}
          <TabsContent value="prompt" className="space-y-3">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Prompt base
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(template.basePrompt)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1.5" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1.5" />
                  )}
                  Copiar
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg border border-border font-mono">
                {template.basePrompt}
              </pre>
              <p className="text-xs text-muted-foreground mt-3">
                Os marcadores entre <code className="px-1 py-0.5 bg-muted rounded">[COLCHETES]</code> são os pontos onde você personaliza o prompt antes de gerar.
              </p>
            </Card>
          </TabsContent>

          {/* Exemplos de uso */}
          <TabsContent value="examples" className="space-y-3">
            {examples.map((ex, i) => (
              <Card key={i} className="p-5 bg-card border-border">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Exemplo {i + 1}
                    </Badge>
                    <h3 className="font-semibold text-foreground">{ex.title}</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(ex.prompt)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{ex.context}</p>
                <pre className="whitespace-pre-wrap text-xs leading-relaxed bg-muted/50 p-3 rounded-md border border-border font-mono">
                  {ex.prompt}
                </pre>
              </Card>
            ))}
          </TabsContent>

          {/* Variações */}
          <TabsContent value="variations" className="space-y-3">
            {variations.map((v, i) => (
              <Card key={i} className="p-5 bg-card border-border">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {v.label}
                    </Badge>
                    <h3 className="font-semibold text-foreground">{v.title}</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(v.prompt)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {v.description}
                </p>
                <pre className="whitespace-pre-wrap text-xs leading-relaxed bg-muted/50 p-3 rounded-md border border-border font-mono">
                  {v.prompt}
                </pre>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* CTA fixo final */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center space-y-3">
          <h3 className="text-xl font-bold">Pronto para gerar?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Envie esse modelo para o gerador, personalize as informações e receba
            o prompt profissional completo em segundos.
          </p>
          <Button onClick={handleUseTemplate} size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Enviar para o gerador
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Card>

        {/* Relacionados */}
        {related.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Modelos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map((r) => {
                const RIcon = r.icon;
                return (
                  <Link
                    key={r.id}
                    to={`/templates/${r.id}`}
                    className="block group"
                  >
                    <Card className="p-4 bg-card border-border hover:border-primary/50 transition-all hover:shadow-md h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <RIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {r.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                        {r.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.description}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Helpers ---------------------------------------------------------------

function generateExamples(template: { basePrompt: string; name: string; category: string }) {
  const base = template.basePrompt;
  // Build 3 contextual fillings by replacing common bracket placeholders
  const fills = [
    {
      title: "Negócio local de pequeno porte",
      context:
        "Ideal quando o cliente é um empreendedor local que precisa começar rápido com baixo orçamento.",
      replacements: {
        "[PRODUTO/SERVIÇO]": "uma pizzaria artesanal de bairro",
        "[PÚBLICO]": "famílias e jovens de 18 a 45 anos da região",
        "[OBJETIVO]": "aumentar pedidos pelo WhatsApp em 50% nos próximos 60 dias",
        "[TIPO DE NEGÓCIO]": "pizzaria artesanal",
        "[PRODUTO]": "rodízio de pizza premium",
        "[TOM]": "acolhedor e familiar",
        "[PRIORIDADE]": "fidelização e recompra",
      },
    },
    {
      title: "Negócio digital escalável (SaaS)",
      context:
        "Foco em produto digital recorrente, com público mais técnico e funil de aquisição online.",
      replacements: {
        "[PRODUTO/SERVIÇO]": "um SaaS de gestão financeira para freelancers",
        "[PÚBLICO]": "freelancers e prestadores de serviço de 25 a 40 anos",
        "[OBJETIVO]": "captar trials qualificados e converter em assinatura mensal",
        "[TIPO DE NEGÓCIO]": "micro SaaS B2C",
        "[PRODUTO]": "plano mensal de gestão financeira",
        "[TOM]": "direto, técnico e confiante",
        "[PRIORIDADE]": "ativação no primeiro uso",
      },
    },
    {
      title: "Marca premium com posicionamento de autoridade",
      context:
        "Quando o cliente precisa transmitir alto valor percebido e ticket médio elevado.",
      replacements: {
        "[PRODUTO/SERVIÇO]": "uma consultoria estratégica para CEOs",
        "[PÚBLICO]": "fundadores de empresas faturando acima de R$ 1M/ano",
        "[OBJETIVO]": "agendar diagnósticos qualificados com decisores",
        "[TIPO DE NEGÓCIO]": "consultoria de alto ticket",
        "[PRODUTO]": "mentoria executiva trimestral",
        "[TOM]": "premium, sóbrio e estratégico",
        "[PRIORIDADE]": "geração de autoridade e prova social",
      },
    },
  ];

  return fills.map((f) => {
    let prompt = base;
    for (const [k, v] of Object.entries(f.replacements)) {
      prompt = prompt.split(k).join(v);
    }
    return { title: f.title, context: f.context, prompt };
  });
}

function generateVariations(template: { basePrompt: string; name: string }) {
  return [
    {
      label: "Versão curta",
      title: "Resumo direto ao ponto",
      description:
        "Use quando você precisa de uma resposta rápida e objetiva, sem rodeios.",
      prompt: `${template.basePrompt}\n\nFormato esperado: resposta resumida em até 5 bullets, sem introdução, focada apenas no essencial.`,
    },
    {
      label: "Versão detalhada",
      title: "Estrutura profissional completa",
      description:
        "Para entregar ao cliente um material robusto, com seções e justificativas.",
      prompt: `${template.basePrompt}\n\nFormato esperado: documento completo com seções (Visão Geral, Estratégia, Execução, Métricas e Próximos Passos), justificando cada decisão e incluindo exemplos práticos.`,
    },
    {
      label: "Versão com tom criativo",
      title: "Abordagem criativa e diferenciada",
      description:
        "Quando o objetivo é fugir do óbvio e gerar algo memorável e fora da curva.",
      prompt: `${template.basePrompt}\n\nDiretrizes adicionais: use uma abordagem criativa e ousada, com analogias inesperadas, copy provocativa e referências culturais relevantes para o público.`,
    },
  ];
}

export default TemplateDetail;
