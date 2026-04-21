import { Loader2, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHasActiveSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <Lock className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Assinatura Necessária
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Você precisa de um plano ativo para acessar esta ferramenta. 
            Escolha um plano e desbloqueie todas as funcionalidades.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={() => navigate("/plans")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/30 transition-all hover:scale-105"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Ver Planos
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
