import { ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHasActiveSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import { logAuditEvent } from "@/hooks/useAuditLog";
import { Loader2, Lock, CreditCard, Mail, Ban, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Routes that don't require active subscription
const SUBSCRIPTION_EXEMPT_ROUTES = ["/settings", "/plans"];

const LOADING_TIMEOUT_MS = 20000;

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasActiveSubscription, isLoading: subscriptionLoading } = useHasActiveSubscription();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  // Track logged events to prevent duplicates
  const loggedEvents = useRef<Set<string>>(new Set());

  // Check if current route is exempt from subscription check
  const isExemptRoute = SUBSCRIPTION_EXEMPT_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (loading || profileLoading) {
      const timer = setTimeout(() => {
        console.warn('[ProtectedRoute] Loading timeout reached.');
        setLoadingTimedOut(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimedOut(false);
    }
  }, [loading, profileLoading]);

  // Log access denial events
  useEffect(() => {
    if (!user || loading || profileLoading || subscriptionLoading) return;
    
    const eventKey = `${location.pathname}-${user.id}`;
    
    if (profile?.is_blocked && !loggedEvents.current.has(`blocked-${eventKey}`)) {
      loggedEvents.current.add(`blocked-${eventKey}`);
      logAuditEvent({
        eventType: 'access_denied_blocked',
        userId: user.id,
        success: false,
        metadata: { path: location.pathname, reason: profile.blocked_reason }
      });
    } else if (!user.email_confirmed_at && !loggedEvents.current.has(`email-${eventKey}`)) {
      loggedEvents.current.add(`email-${eventKey}`);
      logAuditEvent({
        eventType: 'access_denied_email_not_verified',
        userId: user.id,
        success: false,
        metadata: { path: location.pathname }
      });
    } else if (!isExemptRoute && !hasActiveSubscription && !loggedEvents.current.has(`plan-${eventKey}`)) {
      loggedEvents.current.add(`plan-${eventKey}`);
      logAuditEvent({
        eventType: 'access_denied_no_plan',
        userId: user.id,
        success: false,
        metadata: { path: location.pathname }
      });
    }
  }, [user, profile, hasActiveSubscription, isExemptRoute, loading, profileLoading, subscriptionLoading, location.pathname]);

  if ((loading || profileLoading) && !loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (loadingTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-3">
            Problema ao carregar
          </h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={() => navigate("/auth")} className="w-full">
              Voltar para login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to landing
  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  // User is blocked - show blocked screen
  const isBlocked = profile?.is_blocked && user.email !== "ryanzinho.andrade@gmail.com";
  if (isBlocked) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-card border border-destructive/30 shadow-lg">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10 border border-destructive/30">
                <Ban className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Acesso Bloqueado
            </h2>
            <p className="text-muted-foreground mb-4">
              Sua conta foi bloqueada pelo administrador e você não pode acessar a ferramenta.
            </p>
            {profile.blocked_reason && (
              <p className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-lg mb-4">
                <strong>Motivo:</strong> {profile.blocked_reason}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Entre em contato com o suporte se acredita que isso é um erro.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if email is verified (for Supabase, email_confirmed_at indicates verification)
  const isEmailVerified = user.email_confirmed_at != null || user.email === "ryanzinho.andrade@gmail.com";
  
  // Email not verified - show verification screen but WITH layout for navigation
  if (!isEmailVerified) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Verifique seu Email
            </h2>
            <p className="text-muted-foreground mb-4">
              Enviamos um link de verificação para <strong>{user.email}</strong>. 
              Clique no link para ativar sua conta.
            </p>
            <p className="text-sm text-muted-foreground">
              Não recebeu? Verifique sua caixa de spam ou tente fazer login novamente.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // For exempt routes, render children with layout
  if (isExemptRoute) {
    return <MainLayout>{children}</MainLayout>;
  }

  // Loading subscription status
  if (subscriptionLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando assinatura...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // No active subscription - show block screen but WITH layout for navigation
  if (!hasActiveSubscription) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Lock className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Assinatura Necessária
            </h2>
            <p className="text-muted-foreground mb-6">
              Você precisa de um plano ativo para acessar esta ferramenta. 
              Escolha um plano e desbloqueie todas as funcionalidades.
            </p>
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
      </MainLayout>
    );
  }

  // Has active subscription - render children with layout
  return <MainLayout>{children}</MainLayout>;
}
