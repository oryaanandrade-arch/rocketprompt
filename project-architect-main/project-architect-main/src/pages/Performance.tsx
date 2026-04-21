import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceMetrics } from "@/hooks/usePerformance";
import {
  Users,
  TrendingUp,
  Target,
  CheckCircle2,
  Send,
  DollarSign,
  Wallet,
  Repeat,
  FileSignature,
  BarChart3,
  Award,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: boolean;
  loading?: boolean;
}

function MetricCard({ label, value, icon: Icon, hint, accent, loading }: MetricProps) {
  return (
    <Card
      className={cn(
        "p-5 border-border bg-card hover:shadow-lg transition-all",
        accent && "bg-primary text-primary-foreground border-primary"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            accent ? "bg-primary-foreground/20" : "bg-primary/10"
          )}
        >
          <Icon className={cn("h-5 w-5", accent ? "text-primary-foreground" : "text-primary")} />
        </div>
      </div>
      <div className="space-y-1">
        <p className={cn("text-xs uppercase tracking-wider font-medium", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-2xl font-bold leading-tight">{value}</p>
        )}
        {hint && (
          <p className={cn("text-xs", accent ? "text-primary-foreground/60" : "text-muted-foreground")}>
            {hint}
          </p>
        )}
      </div>
    </Card>
  );
}

const formatCurrency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Performance = () => {
  const { data, isLoading } = usePerformanceMetrics();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Painel de Desempenho
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Suas métricas em tempo real
          </h1>
          <p className="text-muted-foreground">
            Acompanhe leads, conversões e receita do seu negócio.
          </p>
        </div>

        {/* Score destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Score Total"
            value={`${data?.totalScore ?? 0}/100`}
            icon={Award}
            hint="Indicador de saúde do funil"
            accent
            loading={isLoading}
          />
          <MetricCard
            label="Receita Total"
            value={formatCurrency(data?.totalRevenue ?? 0)}
            icon={DollarSign}
            hint="Contratos assinados"
            loading={isLoading}
          />
          <MetricCard
            label="Taxa de Conversão"
            value={`${(data?.conversionRate ?? 0).toFixed(1)}%`}
            icon={TrendingUp}
            hint="Propostas aceitas / enviadas"
            loading={isLoading}
          />
        </div>

        {/* Leads */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Leads & Volume
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              label="Leads Hoje"
              value={data?.leadsToday ?? 0}
              icon={Calendar}
              loading={isLoading}
            />
            <MetricCard
              label="Leads no Mês"
              value={data?.leadsMonth ?? 0}
              icon={Users}
              loading={isLoading}
            />
            <MetricCard
              label="Convertidos"
              value={data?.converted ?? 0}
              icon={Target}
              hint="Total de fechamentos"
              loading={isLoading}
            />
          </div>
        </div>

        {/* Propostas */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Propostas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <MetricCard
              label="Propostas Enviadas"
              value={data?.proposalsSent ?? 0}
              icon={Send}
              loading={isLoading}
            />
            <MetricCard
              label="Propostas Aceitas"
              value={data?.proposalsAccepted ?? 0}
              icon={CheckCircle2}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Receita */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Receita & Contratos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              label="Ticket Médio"
              value={formatCurrency(data?.averageTicket ?? 0)}
              icon={Wallet}
              loading={isLoading}
            />
            <MetricCard
              label="Recorrentes"
              value={data?.recurringContracts ?? 0}
              icon={Repeat}
              hint="Contratos com mensalidade"
              loading={isLoading}
            />
            <MetricCard
              label="Contratos Ativos"
              value={data?.activeContracts ?? 0}
              icon={FileSignature}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Performance;
