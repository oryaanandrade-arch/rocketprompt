// Centralized pricing configuration - Single source of truth for all plans

export type SubscriptionPlan = "monthly" | "quarterly" | "lifetime";

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  periodLabel: string;
  originalPrice?: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const PLANS: PlanConfig[] = [
  {
    id: "monthly",
    name: "Mensal",
    price: "R$ 47",
    priceValue: 47,
    period: "/mês",
    periodLabel: "por mês",
    features: [
      "Acesso completo à IA",
      "Geração ilimitada de prompts",
      "Histórico de conversas salvo",
      "10 seções estruturadas no prompt",
      "Suporte por email",
    ],
  },
  {
    id: "quarterly",
    name: "Trimestral",
    price: "R$ 117",
    priceValue: 117,
    period: "/trimestre",
    periodLabel: "R$ 39/mês",
    originalPrice: "R$ 141",
    badge: "Mais Popular",
    popular: true,
    features: [
      "Tudo do plano Mensal",
      "Economia de 17%",
      "Acesso prioritário a novidades",
      "Suporte prioritário",
      "Templates exclusivos",
    ],
  },
  {
    id: "lifetime",
    name: "Vitalício",
    price: "R$ 297",
    priceValue: 297,
    period: "único",
    periodLabel: "pagamento único",
    badge: "Oferta Limitada",
    features: [
      "Acesso vitalício completo",
      "Todas as atualizações futuras",
      "Suporte VIP prioritário",
      "Comunidade exclusiva",
      "Blueprint técnico incluso",
    ],
  },
];

export const getPlanById = (id: SubscriptionPlan): PlanConfig | undefined => {
  return PLANS.find((plan) => plan.id === id);
};

export const getPopularPlan = (): PlanConfig | undefined => {
  return PLANS.find((plan) => plan.popular);
};
