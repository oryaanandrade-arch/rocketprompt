import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  Copy, 
  ArrowRight, 
  Check,
  Brain,
  Target,
  Layers,
  Rocket,
  Menu,
  X,
  Wand2,
  FileText,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import rocketLogo from "@/assets/rocketprompt-logo.png";
import { PLANS } from "@/config/pricing";

const features = [
  {
    icon: MessageSquare,
    title: "IA Conversacional Guiada",
    description: "Converse naturalmente com a IA que te guia com perguntas estratégicas para extrair o máximo da sua ideia.",
  },
  {
    icon: Sparkles,
    title: "Geração de Prompt Profissional",
    description: "Receba um prompt completo, estruturado e otimizado especificamente para uso no Lovable.",
  },
  {
    icon: Brain,
    title: "Sugestões Inteligentes",
    description: "A IA sugere funcionalidades, tecnologias e abordagens baseadas em melhores práticas do mercado.",
  },
  {
    icon: Layers,
    title: "Blueprint e Arquitetura",
    description: "Transforme seu prompt em blueprint técnico completo com fluxos, regras e roadmap.",
  },
];

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Converse com a IA",
    description: "Descreva sua ideia livremente. A IA vai te guiar com perguntas estratégicas para entender seu projeto.",
  },
  {
    number: "02",
    icon: Lightbulb,
    title: "Responda e Refine",
    description: "Responda às perguntas e veja sua ideia ganhar forma, estrutura e clareza profissional.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Receba o Prompt Completo",
    description: "A IA gera um prompt profissional com 10 seções estruturadas, otimizado para o Lovable.",
  },
  {
    number: "04",
    icon: Wand2,
    title: "Copie e Execute",
    description: "Cole o prompt diretamente no Lovable e veja seu produto ganhar vida em minutos.",
  },
];


const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Recursos", href: "#recursos" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative isolate">
      {/* Background Effects - z-0 stays behind content */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm" : ""
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={rocketLogo} 
                alt="RocketPrompt Logo" 
                className="h-10 w-10 rounded-xl transition-transform duration-300 hover:scale-110 hover:rotate-3" 
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RocketPrompt
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
                className="transition-all duration-300 hover:bg-primary/10"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate("/auth")} 
                className="glow-effect transition-all duration-300 hover:scale-105"
              >
                Começar Agora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-96 mt-4" : "max-h-0"
          }`}>
            <nav className="flex flex-col gap-2 pb-4">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-3 text-left text-sm font-medium rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button onClick={() => navigate("/auth")} className="glow-effect">
                  Começar Agora
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative z-10 pt-28 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Powered by AI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Converse com uma IA e gere{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              prompts profissionais
            </span>{" "}
            para seus produtos
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Transforme ideias em projetos estruturados e prontos para execução. 
            A IA te guia do zero até um documento técnico completo em minutos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="glow-effect text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => scrollToSection("#como-funciona")}
              className="transition-all duration-300 hover:bg-accent/50"
            >
              Ver Como Funciona
            </Button>
          </div>

          {/* Demo Preview */}
          <div className="mt-16 relative animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="glass-card rounded-2xl p-4 md:p-8 max-w-4xl mx-auto border border-border/50 shadow-2xl">
              {/* Window Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="px-4 py-1 rounded-full bg-accent/30 text-xs text-muted-foreground">
                  RocketPrompt - Gerador de Prompts
                </div>
              </div>

              {/* Chat Interface Preview */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1 text-left border border-border/30">
                    <p className="text-sm text-muted-foreground">
                      Olá! Sou seu assistente de criação de prompts. Me conte: <span className="text-foreground font-medium">o que você quer criar hoje?</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-none p-4 max-w-md text-left">
                    <p className="text-sm">
                      Quero criar um app de delivery para pet shops com agendamento de banho e tosa
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-none p-4 flex-1 text-left border border-border/30">
                    <p className="text-sm text-muted-foreground">
                      Ótima ideia! Para criar o prompt perfeito, preciso entender melhor seu projeto. 
                      <span className="text-foreground font-medium"> Qual é o público-alvo principal?</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground shadow-lg glow-effect">
              <Copy className="h-4 w-4" />
              <span className="text-sm font-medium">Prompt pronto para copiar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 border border-accent/50 mb-4">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Recursos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Tudo que você precisa para transformar ideias em produtos reais
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group glass-card rounded-2xl p-8 border border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="relative z-10 py-20 md:py-32 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Como Funciona</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              4 Passos Simples
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Do zero ao produto em minutos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div className="text-6xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                    {step.number}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 border border-accent/50 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Planos</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Planos e Preços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Escolha o plano ideal para você e comece a criar hoje
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, index) => (
              <div
                key={plan.name}
                className={`group relative glass-card rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-2 animate-fade-in ${
                  plan.popular 
                    ? "border-primary shadow-xl shadow-primary/20 scale-105 z-10" 
                    : "border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                    plan.popular 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-accent text-accent-foreground"
                  }`}>
                    {plan.badge}
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-sm text-muted-foreground mt-2">{plan.periodLabel}</p>
                  )}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full transition-all duration-300 ${
                    plan.popular 
                      ? "glow-effect hover:scale-105" 
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  Assinar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-32 bg-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-12 md:p-16 max-w-4xl mx-auto border border-border/50 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Comece Agora</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Pronto para transformar{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                suas ideias
              </span>
              ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Comece agora e tenha seu primeiro prompt profissional estruturado em minutos. 
              Sem complicação, sem enrolação.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="glow-effect text-lg px-10 py-6 transition-all duration-300 hover:scale-105"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={rocketLogo} alt="RocketPrompt Logo" className="h-8 w-8 rounded-lg" />
              <span className="font-bold">RocketPrompt</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 RocketPrompt. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
