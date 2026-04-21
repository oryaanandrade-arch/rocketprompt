import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  Save,
  MessageSquare,
  Plus,
  Wand2,
  ArrowRight,
  LayoutTemplate,
  ChevronDown,
  X,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat, useConversations } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { promptTemplates, templateCategories, type PromptTemplate } from "@/data/promptTemplates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

const quickIdeas = [
  { text: "Criar prompt para SaaS", icon: Rocket, category: "SaaS" },
  { text: "Criar prompt para landing page", icon: Sparkles, category: "Marketing" },
  { text: "Criar prompt para automação", icon: Wand2, category: "Automação" },
  { text: "Criar prompt para IA criativa", icon: Sparkles, category: "IA" },
  { text: "Criar prompt para código", icon: Rocket, category: "Código" },
];

export default function PromptGenerator() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversation") || undefined;
  const initialIdea = searchParams.get("idea") || "";
  const templateIdParam = searchParams.get("template");
  const initialFromTemplate = templateIdParam
    ? promptTemplates.find((t) => t.id === templateIdParam)?.basePrompt || ""
    : "";
  const [input, setInput] = useState(initialFromTemplate || initialIdea);
  const [copied, setCopied] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(conversationId);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { 
    messages, 
    isStreaming, 
    generatedPrompt, 
    streamChat, 
    savePrompt,
    resetChat 
  } = useChat(currentConvId);

  const { data: conversations } = useConversations();

  // Auto-send initial idea if provided
  useEffect(() => {
    const sendInitialIdea = async () => {
      if (initialIdea && !hasSentInitial && messages.length === 0 && !isStreaming) {
        setHasSentInitial(true);
        const newConvId = await streamChat(initialIdea, currentConvId);
        setInput("");
        if (newConvId && newConvId !== currentConvId) {
          setCurrentConvId(newConvId);
          navigate(`/generator?conversation=${newConvId}`, { replace: true });
        }
      }
    };
    sendInitialIdea();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const message = input;
    setInput("");
    
    const newConvId = await streamChat(message, currentConvId);
    if (newConvId && newConvId !== currentConvId) {
      setCurrentConvId(newConvId);
      navigate(`/generator?conversation=${newConvId}`, { replace: true });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setInput(template.basePrompt);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const handleQuickIdea = (idea: string) => {
    setInput(idea);
    textareaRef.current?.focus();
  };

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({ title: "Prompt copiado para a área de transferência!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSavePrompt = async () => {
    if (generatedPrompt) {
      const title = messages.find(m => m.role === "user")?.content.slice(0, 50) || "Prompt sem título";
      await savePrompt.mutateAsync({ 
        title, 
        content: generatedPrompt, 
        convId: currentConvId 
      });
    }
  };

  const handleImprovePrompt = async () => {
    if (!generatedPrompt || isImproving) return;

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-prompt", {
        body: { prompt: generatedPrompt }
      });

      if (error) throw error;

      if (data?.improvedPrompt) {
        // Send the improved prompt as a new message
        await streamChat(`Aqui está uma versão melhorada do prompt:\n\n${data.improvedPrompt}`, currentConvId);
        toast({ title: "Prompt melhorado com sucesso!" });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao melhorar prompt",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleNewChat = () => {
    resetChat();
    setCurrentConvId(undefined);
    navigate("/generator");
  };

  const filteredTemplates = selectedCategory 
    ? promptTemplates.filter(t => t.category === selectedCategory)
    : promptTemplates;

  return (
    <SubscriptionGuard>
      <TooltipProvider delayDuration={100}>
        {/* Full screen immersive layout */}
        <div className="fixed inset-0 bg-background flex flex-col">
          {/* Floating background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="floating-orb w-96 h-96 -top-48 -left-48" />
            <div className="floating-orb w-80 h-80 top-1/2 -right-40" style={{ animationDelay: "2s" }} />
            <div className="floating-orb w-64 h-64 -bottom-32 left-1/3" style={{ animationDelay: "4s" }} />
          </div>

          {/* Header */}
          <div className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Voltar
                </Button>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg animate-pulse-glow">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold gradient-text">QIA - Gerador de Prompt</h1>
                    <p className="text-xs text-muted-foreground">Crie prompts profissionais com IA</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Templates Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowTemplates(true)}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Templates
                </Button>

                <Button onClick={handleNewChat} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Conversa
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden relative z-10">
            {/* Sidebar - Conversations */}
            <div className="w-64 hidden lg:flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Conversas recentes</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-3 space-y-1">
                  {conversations?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma conversa</p>
                    </div>
                  )}
                  {conversations?.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setCurrentConvId(conv.id);
                        navigate(`/generator?conversation=${conv.id}`);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-300",
                        "hover:bg-primary/10 flex items-center gap-2 group",
                        currentConvId === conv.id && "bg-primary/15 border border-primary/30"
                      )}
                    >
                      <MessageSquare className={cn(
                        "h-4 w-4 shrink-0",
                        currentConvId === conv.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="truncate">{conv.title || "Conversa"}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 animate-fade-up">
                      {/* Hero */}
                      <div className="relative mb-12">
                        <div className="h-24 w-24 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-glow">
                          <Sparkles className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 gradient-text">
                          O que você quer criar hoje?
                        </h2>
                        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                          Descreva sua ideia e eu vou gerar o prompt perfeito para transformá-la em realidade.
                        </p>
                      </div>

                      {/* Quick Ideas */}
                      <div className="mb-12">
                        <p className="text-sm font-medium text-muted-foreground mb-4">
                          💡 Ideias rápidas para começar
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                          {quickIdeas.map((idea) => (
                            <button
                              key={idea.text}
                              onClick={() => handleQuickIdea(idea.text)}
                              className={cn(
                                "group flex items-center gap-3 px-5 py-3 rounded-2xl text-sm",
                                "border border-border/50 bg-card/50 backdrop-blur-sm",
                                "hover:border-primary/50 hover:bg-primary/10 hover:scale-105",
                                "transition-all duration-300 shadow-sm hover:shadow-lg"
                              )}
                            >
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <idea.icon className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{idea.text}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Categories Preview */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-4">
                          📂 Ou explore por categoria
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {templateCategories.slice(0, 6).map((cat) => (
                            <Button
                              key={cat.name}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(cat.name);
                                setShowTemplates(true);
                              }}
                              className="gap-2 hover:bg-primary/10 hover:border-primary/50"
                            >
                              <cat.icon className="h-3 w-3" />
                              {cat.name}
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTemplates(true)}
                            className="gap-1"
                          >
                            Ver todos
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex gap-4 animate-fade-up",
                          message.role === "user" && "justify-end"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {message.role === "assistant" && (
                          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl p-5 transition-all",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "glass-card border border-border/50"
                          )}
                        >
                          <div className={cn(
                            "text-sm whitespace-pre-wrap leading-relaxed",
                            message.role === "assistant" && "prose prose-sm max-w-none dark:prose-invert"
                          )}>
                            {message.content || (
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <div className="flex gap-1">
                                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                                Gerando...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Generated Prompt Banner */}
              {generatedPrompt && (
                <div className="border-t border-border/50 p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <span className="font-semibold">Prompt gerado com sucesso!</span>
                          <p className="text-xs text-muted-foreground">Copie ou melhore com IA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleImprovePrompt}
                              disabled={isImproving}
                              className="gap-2"
                            >
                              {isImproving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                              Melhorar com IA
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>A IA vai reescrever o prompt de forma mais completa e técnica</p>
                          </TooltipContent>
                        </Tooltip>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSavePrompt}
                          disabled={savePrompt.isPending}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCopyPrompt}
                          className="gap-2 glow-effect"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? "Copiado!" : "Copiar Prompt"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area - Always visible, well-spaced at bottom */}
              <div className="shrink-0 border-t border-border/50 p-6 bg-card/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto">
                  {/* Textarea Container - Isolated with generous spacing */}
                  <div className="relative flex flex-col gap-4">
                    {/* Textarea - Primary visual element */}
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva sua ideia de produto digital..."
                        className={cn(
                          "min-h-[120px] max-h-[180px] resize-none w-full",
                          "bg-background border-2 border-border/60",
                          "focus:border-primary focus:ring-2 focus:ring-primary/30",
                          "placeholder:text-muted-foreground/70",
                          "text-base leading-relaxed p-4 rounded-xl",
                          "shadow-sm"
                        )}
                        disabled={isStreaming}
                      />
                    </div>
                    
                    {/* Action buttons - Completely separate container below textarea */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Pressione Enter para enviar, Shift+Enter para nova linha
                      </span>
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        size="lg"
                        className="gap-2 glow-effect px-6"
                      >
                        {isStreaming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Library - Completely isolated full-screen overlay layer */}
          {showTemplates && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col">
              {/* Header */}
              <div className="shrink-0 border-b border-border/50 p-4 bg-card/50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <LayoutTemplate className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Biblioteca de Templates</h2>
                      <p className="text-sm text-muted-foreground">Escolha um template para começar</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowTemplates(false)}
                    className="h-10 w-10 rounded-full hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Category filters */}
              <div className="shrink-0 border-b border-border/30 py-4 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Todos
                    </Button>
                    {templateCategories.map((cat) => (
                      <Button
                        key={cat.name}
                        variant={selectedCategory === cat.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.name)}
                        className="gap-2"
                      >
                        <cat.icon className="h-3 w-3" />
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Templates grid - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={cn(
                          "text-left p-5 rounded-xl border-2 border-border/50 bg-card",
                          "hover:border-primary hover:bg-primary/5 transition-all duration-300",
                          "group w-full shadow-sm hover:shadow-lg"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <template.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold">{template.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {template.category}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {template.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    </SubscriptionGuard>
  );
}
