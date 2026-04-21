import { SubscriptionPlan } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Links de checkout do Perfect Pay - Configure com seus links reais
// Estes links devem ser criados no painel da Perfect Pay para cada plano
const PERFECTPAY_CHECKOUT_LINKS: Record<SubscriptionPlan, string> = {
  // IMPORTANTE: Substitua pelos seus links reais do Perfect Pay
  // Você encontra esses links em: Perfect Pay > Produtos > Seu Produto > Links de Checkout
  monthly: "https://pay.perfectpay.com.br/PMM/architect-ai-mensal",
  quarterly: "https://pay.perfectpay.com.br/PMM/architect-ai-trimestral",
  lifetime: "https://pay.perfectpay.com.br/PMM/architect-ai-vitalicio",
};

export function usePerfectPayCheckout() {
  const { user } = useAuth();
  const { toast } = useToast();

  const redirectToCheckout = (plan: SubscriptionPlan) => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para assinar.",
        variant: "destructive",
      });
      return;
    }

    const checkoutUrl = PERFECTPAY_CHECKOUT_LINKS[plan];
    
    if (!checkoutUrl || checkoutUrl.includes("PMM/architect")) {
      toast({
        title: "Configuração pendente",
        description: "Os links de checkout ainda não foram configurados. Entre em contato com o suporte.",
        variant: "destructive",
      });
      return;
    }

    // Adicionar email do usuário como parâmetro para pré-preencher
    const urlWithEmail = `${checkoutUrl}?email=${encodeURIComponent(user.email)}`;
    
    // Abrir checkout em nova aba
    window.open(urlWithEmail, "_blank");
    
    toast({
      title: "Redirecionando...",
      description: "Você será direcionado para a página de pagamento seguro.",
    });
  };

  return { redirectToCheckout };
}

// Exportar os links para configuração
export const CHECKOUT_LINKS = PERFECTPAY_CHECKOUT_LINKS;
