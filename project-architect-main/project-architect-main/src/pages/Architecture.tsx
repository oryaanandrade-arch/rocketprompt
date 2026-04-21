import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Copy, Download } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useProject } from "@/hooks/useProjects";
import { useSaveArchitectureAnswers, useArchitectureAnswers } from "@/hooks/useArchitectureAnswers";
import { useGenerateBlueprint, useBlueprintByProject, Blueprint } from "@/hooks/useBlueprints";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const architectureSteps = [
  { id: 1, title: "Estratégia", description: "Tipo e objetivo do produto" },
  { id: 2, title: "Público", description: "Quem vai usar seu produto" },
  { id: 3, title: "Monetização", description: "Como você vai ganhar dinheiro" },
  { id: 4, title: "Produto", description: "Funcionalidades essenciais" },
  { id: 5, title: "Tecnologia", description: "Preferências técnicas" },
  { id: 6, title: "Gerar", description: "IA gera o blueprint" },
];

const productTypes = [
  { value: "site", label: "Site / Landing Page" },
  { value: "saas", label: "SaaS" },
  { value: "app", label: "Aplicativo" },
  { value: "marketplace", label: "Marketplace" },
  { value: "sistema", label: "Sistema / Painel" },
];

const businessObjectives = [
  { value: "venda", label: "Vendas Diretas" },
  { value: "leads", label: "Geração de Leads" },
  { value: "retencao", label: "Retenção / Engajamento" },
  { value: "escala", label: "Escala / Crescimento" },
];

const audienceTypes = [
  { value: "b2b", label: "B2B (Empresas)" },
  { value: "b2c", label: "B2C (Consumidor Final)" },
  { value: "ambos", label: "Ambos" },
];

const monetizationModels = [
  { value: "assinatura", label: "Assinatura Recorrente" },
  { value: "one_time", label: "Pagamento Único" },
  { value: "freemium", label: "Freemium" },
  { value: "comissao", label: "Comissão / Marketplace" },
  { value: "hibrido", label: "Modelo Híbrido" },
];

const platformTypes = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "ambos", label: "Web + Mobile" },
];

const complexityLevels = [
  { value: "mvp", label: "MVP (2-4 semanas)" },
  { value: "produto_vendavel", label: "Produto Vendável (1-2 meses)" },
  { value: "escala", label: "Escala Completa (3+ meses)" },
];

interface WizardData {
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

const initialWizardData: WizardData = {
  productType: "",
  businessObjective: "",
  audienceType: "",
  targetUsers: "",
  problemDescription: "",
  coreFeatures: "",
  monetizationModel: "",
  pricingStrategy: "",
  platformType: "",
  complexityLevel: "",
  techPreferences: "",
  additionalNotes: "",
};

export default function Architecture() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const projectIdFromUrl = searchParams.get("project");
  const ideaFromUrl = searchParams.get("idea");
  
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdFromUrl || "");
  const { data: selectedProject } = useProject(selectedProjectId);
  const { data: existingAnswers } = useArchitectureAnswers(selectedProjectId);
  const { data: existingBlueprint } = useBlueprintByProject(selectedProjectId);
  
  const saveAnswers = useSaveArchitectureAnswers();
  const generateBlueprint = useGenerateBlueprint();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<Blueprint | null>(null);

  // Load existing answers or idea from URL
  useEffect(() => {
    if (existingAnswers) {
      setWizardData({
        productType: existingAnswers.product_type || "",
        businessObjective: existingAnswers.business_objective || "",
        audienceType: existingAnswers.audience_type || "",
        targetUsers: existingAnswers.target_users || "",
        problemDescription: existingAnswers.problem_description || "",
        coreFeatures: existingAnswers.core_features || "",
        monetizationModel: existingAnswers.monetization_model || "",
        pricingStrategy: existingAnswers.pricing_strategy || "",
        platformType: existingAnswers.platform_type || "",
        complexityLevel: existingAnswers.complexity_level || "",
        techPreferences: existingAnswers.tech_preferences || "",
        additionalNotes: existingAnswers.additional_notes || "",
      });
    } else if (ideaFromUrl) {
      setWizardData(prev => ({
        ...prev,
        problemDescription: decodeURIComponent(ideaFromUrl),
      }));
    }
  }, [existingAnswers, ideaFromUrl]);

  // Load existing blueprint
  useEffect(() => {
    if (existingBlueprint) {
      setGeneratedBlueprint(existingBlueprint);
      setCurrentStep(6);
    }
  }, [existingBlueprint]);

  // Update selected project from URL
  useEffect(() => {
    if (projectIdFromUrl) {
      setSelectedProjectId(projectIdFromUrl);
    }
  }, [projectIdFromUrl]);

  const updateWizardData = (field: keyof WizardData, value: string) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return wizardData.productType && wizardData.businessObjective;
      case 2:
        return wizardData.audienceType && wizardData.targetUsers && wizardData.problemDescription;
      case 3:
        return wizardData.monetizationModel;
      case 4:
        return wizardData.coreFeatures;
      case 5:
        return wizardData.platformType && wizardData.complexityLevel;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      
      // Auto-save answers
      if (selectedProjectId) {
        saveAnswers.mutate({
          project_id: selectedProjectId,
          user_id: "", // Will be set by hook
          step_number: currentStep,
          product_type: wizardData.productType as "site" | "saas" | "app" | "marketplace" | "sistema" | null,
          business_objective: wizardData.businessObjective as "venda" | "leads" | "retencao" | "escala" | null,
          audience_type: wizardData.audienceType as "b2b" | "b2c" | "ambos" | null,
          target_users: wizardData.targetUsers,
          problem_description: wizardData.problemDescription,
          core_features: wizardData.coreFeatures,
          monetization_model: wizardData.monetizationModel as "assinatura" | "one_time" | "freemium" | "comissao" | "hibrido" | null,
          pricing_strategy: wizardData.pricingStrategy,
          platform_type: wizardData.platformType as "web" | "mobile" | "ambos" | null,
          complexity_level: wizardData.complexityLevel as "mvp" | "produto_vendavel" | "escala" | null,
          tech_preferences: wizardData.techPreferences,
          additional_notes: wizardData.additionalNotes,
        });
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedProjectId || !selectedProject) {
      toast({
        title: "Selecione um projeto",
        description: "Você precisa selecionar ou criar um projeto primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blueprint = await generateBlueprint.mutateAsync({
        projectId: selectedProjectId,
        projectName: selectedProject.name,
        productType: wizardData.productType,
        businessObjective: wizardData.businessObjective,
        audienceType: wizardData.audienceType,
        targetUsers: wizardData.targetUsers,
        problemDescription: wizardData.problemDescription,
        coreFeatures: wizardData.coreFeatures,
        monetizationModel: wizardData.monetizationModel,
        pricingStrategy: wizardData.pricingStrategy,
        platformType: wizardData.platformType,
        complexityLevel: wizardData.complexityLevel,
        techPreferences: wizardData.techPreferences,
        additionalNotes: wizardData.additionalNotes,
      });
      
      setGeneratedBlueprint(blueprint);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Produto *</label>
              <Select value={wizardData.productType} onValueChange={(v) => updateWizardData("productType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de produto" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Objetivo Principal *</label>
              <Select value={wizardData.businessObjective} onValueChange={(v) => updateWizardData("businessObjective", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Qual o objetivo principal do projeto?" />
                </SelectTrigger>
                <SelectContent>
                  {businessObjectives.map((obj) => (
                    <SelectItem key={obj.value} value={obj.value}>{obj.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Público *</label>
              <Select value={wizardData.audienceType} onValueChange={(v) => updateWizardData("audienceType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Quem é seu público?" />
                </SelectTrigger>
                <SelectContent>
                  {audienceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descreva seus usuários *</label>
              <Textarea
                placeholder="Ex: Donos de pequenos negócios que precisam gerenciar vendas..."
                value={wizardData.targetUsers}
                onChange={(e) => updateWizardData("targetUsers", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Problema que resolve *</label>
              <Textarea
                placeholder="Qual problema principal seu produto resolve?"
                value={wizardData.problemDescription}
                onChange={(e) => updateWizardData("problemDescription", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Modelo de Monetização *</label>
              <Select value={wizardData.monetizationModel} onValueChange={(v) => updateWizardData("monetizationModel", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Como você vai ganhar dinheiro?" />
                </SelectTrigger>
                <SelectContent>
                  {monetizationModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estratégia de Preços (opcional)</label>
              <Textarea
                placeholder="Ex: Plano básico R$29/mês, Pro R$99/mês com features avançadas..."
                value={wizardData.pricingStrategy}
                onChange={(e) => updateWizardData("pricingStrategy", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Funcionalidades Core *</label>
              <Textarea
                placeholder="Liste as funcionalidades essenciais do seu produto...&#10;&#10;Ex:&#10;- Dashboard com métricas&#10;- Gestão de clientes&#10;- Relatórios automáticos&#10;- Integração com WhatsApp"
                value={wizardData.coreFeatures}
                onChange={(e) => updateWizardData("coreFeatures", e.target.value)}
                rows={6}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plataforma *</label>
              <Select value={wizardData.platformType} onValueChange={(v) => updateWizardData("platformType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Onde seu produto vai rodar?" />
                </SelectTrigger>
                <SelectContent>
                  {platformTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível de Complexidade *</label>
              <Select value={wizardData.complexityLevel} onValueChange={(v) => updateWizardData("complexityLevel", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Qual o escopo inicial?" />
                </SelectTrigger>
                <SelectContent>
                  {complexityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferências Técnicas (opcional)</label>
              <Textarea
                placeholder="Ex: Preferência por React, precisa de integração com Stripe..."
                value={wizardData.techPreferences}
                onChange={(e) => updateWizardData("techPreferences", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas Adicionais (opcional)</label>
              <Textarea
                placeholder="Algo mais que devemos considerar?"
                value={wizardData.additionalNotes}
                onChange={(e) => updateWizardData("additionalNotes", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 6:
        if (generatedBlueprint) {
          return <BlueprintView blueprint={generatedBlueprint} onCopy={copyToClipboard} />;
        }
        
        return (
          <div className="text-center py-8 space-y-6">
            <Sparkles className="h-16 w-16 text-primary mx-auto animate-pulse" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Pronto para gerar!</h3>
              <p className="text-muted-foreground">
                Clique no botão abaixo para a IA criar seu blueprint completo
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={handleGenerate}
              disabled={generateBlueprint.isPending}
              className="gap-2"
            >
              {generateBlueprint.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando Blueprint...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Gerar Blueprint com IA
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Arquitetura com IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Transforme sua ideia em um projeto estruturado e profissional
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateProjectModal 
              trigger={<Button variant="outline">Novo Projeto</Button>}
            />
          </div>
        </div>

        {/* Steps Progress */}
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle>Jornada de Arquitetura</CardTitle>
            <CardDescription>
              Responda as perguntas estratégicas para gerar seu blueprint completo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {architectureSteps.map((step, index) => (
                <div key={step.id} className="flex items-center min-w-fit">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                      disabled={step.id > currentStep}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        step.id < currentStep
                          ? "bg-primary border-primary text-primary-foreground cursor-pointer hover:opacity-80"
                          : step.id === currentStep
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-semibold">{step.id}</span>
                      )}
                    </button>
                    <span className="mt-2 text-xs text-center max-w-[70px] text-muted-foreground">
                      {step.title}
                    </span>
                  </div>
                  {index < architectureSteps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 sm:w-12 mx-1 sm:mx-2 ${
                        step.id < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>
              Passo {currentStep}: {architectureSteps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {architectureSteps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedProjectId ? (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Selecione ou crie um projeto para iniciar
                </p>
                <CreateProjectModal 
                  trigger={<Button>Criar Projeto</Button>}
                />
              </div>
            ) : (
              <>
                {renderStepContent()}

                {currentStep < 6 || !generatedBlueprint ? (
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                    {currentStep < 6 && (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="gap-2"
                      >
                        Próximo
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

// Blueprint View Component
function BlueprintView({ blueprint, onCopy }: { blueprint: Blueprint; onCopy: (text: string) => void }) {
  const featuresModules = blueprint.features_by_module as Array<{ module: string; features: string[]; priority: string }> | null;
  const recommendedStack = blueprint.recommended_stack as { frontend?: string[]; backend?: string[]; database?: string[]; integrations?: string[]; infrastructure?: string[] } | null;
  const dbStructure = blueprint.database_structure as Array<{ table: string; description: string; main_fields: string[] }> | null;
  const roadmap = blueprint.roadmap as Array<{ phase: string; duration: string; deliverables: string[] }> | null;
  const businessRules = blueprint.business_rules as string[] | null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Blueprint Gerado</h3>
            <p className="text-sm text-muted-foreground">Seu projeto foi estruturado pela IA</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => onCopy(blueprint.professional_prompt || "")}>
          <Copy className="h-4 w-4" />
          Copiar Prompt
        </Button>
      </div>

      {/* Vision */}
      <div className="space-y-2">
        <h4 className="font-semibold">Visão do Produto</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{blueprint.vision_overview}</p>
      </div>

      {/* Problem & Value */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-semibold">Problema Resolvido</h4>
          <p className="text-sm text-muted-foreground">{blueprint.problem_solved}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Proposta de Valor</h4>
          <p className="text-sm text-muted-foreground">{blueprint.value_proposition}</p>
        </div>
      </div>

      {/* Features by Module */}
      {featuresModules && (
        <div className="space-y-3">
          <h4 className="font-semibold">Funcionalidades por Módulo</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {featuresModules.map((mod, index) => (
              <Card key={index} className="bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{mod.module}</CardTitle>
                    <Badge variant={mod.priority === "alta" ? "destructive" : mod.priority === "média" ? "warning" : "secondary"}>
                      {mod.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {mod.features.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* User Flow */}
      {blueprint.user_flow && (
        <div className="space-y-2">
          <h4 className="font-semibold">Fluxo do Usuário</h4>
          <p className="text-sm text-muted-foreground">{blueprint.user_flow}</p>
        </div>
      )}

      {/* Business Rules */}
      {businessRules && (
        <div className="space-y-2">
          <h4 className="font-semibold">Regras de Negócio</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {businessRules.map((rule, index) => (
              <li key={index}>• {rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech Stack */}
      {recommendedStack && (
        <div className="space-y-3">
          <h4 className="font-semibold">Stack Recomendada</h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(recommendedStack).map(([category, techs]) => (
              <div key={category} className="space-y-1">
                <p className="text-xs text-muted-foreground capitalize">{category}</p>
                <div className="flex flex-wrap gap-1">
                  {(techs as string[])?.map((tech, i) => (
                    <Badge key={i} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Structure */}
      {dbStructure && (
        <div className="space-y-3">
          <h4 className="font-semibold">Estrutura do Banco de Dados</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dbStructure.map((table, index) => (
              <Card key={index} className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono">{table.table}</CardTitle>
                  <CardDescription className="text-xs">{table.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {table.main_fields.map((field, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-mono">{field}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      {roadmap && (
        <div className="space-y-3">
          <h4 className="font-semibold">Roadmap</h4>
          <div className="space-y-4">
            {roadmap.map((phase, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  {index < roadmap.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{phase.phase}</h5>
                    <Badge variant="secondary">{phase.duration}</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {phase.deliverables.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Professional Prompt */}
      {blueprint.professional_prompt && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Prompt Profissional</h4>
            <Button variant="ghost" size="sm" onClick={() => onCopy(blueprint.professional_prompt || "")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-line font-mono">
                {blueprint.professional_prompt}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}