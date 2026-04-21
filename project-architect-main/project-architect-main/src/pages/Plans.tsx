import { useState } from "react";
import { Crown, Check, Sparkles, Zap, Star, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlan } from "@/hooks/useSubscription";
import { usePerfectPayCheckout } from "@/hooks/usePerfectPayCheckout";
import { useNavigate } from "react-router-dom";
import { PLANS } from "@/config/pricing";

const planIcons = {
  monthly: Zap,
  quarterly: Sparkles,
  lifetime: Crown,
};

const planGradients = {
  monthly: "from-secondary to-accent",
  quarterly: "from-primary to-accent",
  lifetime: "from-primary via-secondary to-accent",
};
export default function Plans() {
  const navigate = useNavigate();
  const { redirectToCheckout } = usePerfectPayCheckout();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsRedirecting(true);
    redirectToCheckout(plan);
    
    setTimeout(() => {
      setIsRedirecting(false);
      setSelectedPlan(null);
    }, 2000);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30">
              <Star className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            Desbloqueie Todo o Potencial
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal e tenha acesso completo a todas as funcionalidades premium da nossa plataforma.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan, index) => {
            const Icon = planIcons[plan.id];
            const gradient = planGradients[plan.id];
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group ${
                  plan.popular
                    ? "border-primary bg-gradient-to-b from-primary/15 to-accent/5 scale-[1.02] md:scale-105 shadow-xl shadow-primary/20"
                    : "border-border/50 hover:border-primary/50 bg-card"
                }`}
              >
                {/* Glow effect for popular plan */}
                {plan.popular && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/20 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}

                {plan.badge && (
                  <Badge
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 text-xs font-bold whitespace-nowrap ${
                      plan.popular 
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30" 
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                )}

                <div className="text-center mb-6 relative">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    {plan.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-foreground/80">
                      <div className="mt-0.5 p-1 rounded-full bg-primary/20 shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full font-semibold transition-all duration-300 ${
                    plan.popular 
                      ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30" 
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isRedirecting}
                >
                  {selectedPlan === plan.id && isRedirecting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Redirecionando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Assinar Agora
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Pagamento seguro
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Cancele quando quiser
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Suporte dedicado
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao assinar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    </>
  );
}
