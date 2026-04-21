import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Crown, Calendar, Loader2, CreditCard, Receipt, Copy, Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePayments } from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { logAuditEvent } from "@/hooks/useAuditLog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhoneNumber(profile.phone_number || "");
    }
  }, [profile]);

  // Format phone number as user types
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 20) {
      setPhoneNumber(formatted);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate inputs
    if (!fullName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Log successful profile update
      await logAuditEvent({
        eventType: 'profile_update_success',
        userId: user.id,
        success: true,
        metadata: { updatedFields: ['full_name', 'phone_number'] }
      });

      // Invalidate profile cache to reflect changes
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      // Log failed profile update
      await logAuditEvent({
        eventType: 'profile_update_failed',
        userId: user.id,
        success: false,
        errorMessage: error.message
      });

      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validate current password is provided
    if (!currentPassword) {
      toast({
        title: "Senha atual obrigatória",
        description: "Por favor, informe sua senha atual.",
        variant: "destructive",
      });
      return;
    }

    // Validate new password
    if (newPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        await logAuditEvent({
          eventType: 'password_change_failed',
          userId: user.id,
          success: false,
          errorMessage: 'Invalid current password'
        });
        
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual informada está incorreta.",
          variant: "destructive",
        });
        setIsSavingPassword(false);
        return;
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Log successful password change
      await logAuditEvent({
        eventType: 'password_change_success',
        userId: user.id,
        success: true
      });

      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    } catch (error: any) {
      await logAuditEvent({
        eventType: 'password_change_failed',
        userId: user.id,
        success: false,
        errorMessage: error.message
      });

      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      await logAuditEvent({
        eventType: 'password_reset_requested',
        userId: user.id,
        success: true
      });

      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email.",
        variant: "destructive",
      });
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "monthly": return "Mensal";
      case "quarterly": return "Trimestral";
      case "lifetime": return "Vitalício";
      default: return plan;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "cancelled": return "Cancelado";
      case "expired": return "Expirado";
      case "trialing": return "Período de teste";
      default: return status;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copiado!",
      description: "ID da transação copiado para a área de transferência.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "pending": return "Pendente";
      case "failed": return "Falhou";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  return (
    <TooltipProvider>
    <div className="space-y-8 animate-fade-up max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      {/* Account Info */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Dados da sua conta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de criação
                  </Label>
                  <Input
                    value={
                      user?.created_at
                        ? format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : "—"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Assinatura</CardTitle>
              <CardDescription>Seu plano atual e histórico</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando...</span>
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <p className="text-lg font-semibold">{getPlanLabel(subscription.plan)}</p>
                </div>
                <Badge
                  variant={subscription.status === "active" ? "default" : "secondary"}
                  className={subscription.status === "active" ? "bg-green-600" : ""}
                >
                  {getStatusLabel(subscription.status)}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Início</p>
                  <p className="font-medium">
                    {format(new Date(subscription.starts_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                {subscription.ends_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Válido até</p>
                    <p className="font-medium">
                      {format(new Date(subscription.ends_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {subscription.plan === "lifetime" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Válido até</p>
                    <p className="font-medium text-green-600">Vitalício</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">Nenhuma assinatura ativa</p>
              <Button onClick={() => navigate("/plans")}>Ver Planos</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Suas transações realizadas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando...</span>
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getPlanLabel(payment.plan)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant={payment.status === "completed" ? "default" : "secondary"}
                        className={payment.status === "completed" ? "bg-green-600" : ""}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </Badge>
                    </div>
                    {payment.transaction_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(payment.transaction_id!, payment.id)}
                        title="Copiar ID da transação"
                      >
                        {copiedId === payment.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhum pagamento realizado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Notificações por Email</CardTitle>
                <CardDescription>Configure como você recebe atualizações</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between group cursor-not-allowed opacity-60">
            <div>
              <p className="font-medium">Notificações por email</p>
              <p className="text-sm text-muted-foreground">
                Receba atualizações sobre seus projetos
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch 
                    checked={false}
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🚀 Disponível em breve</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator />
          <div className="flex items-center justify-between group cursor-not-allowed opacity-60">
            <div>
              <p className="font-medium">Resumo semanal</p>
              <p className="text-sm text-muted-foreground">
                Relatório semanal de progresso
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch 
                    checked={false}
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🚀 Disponível em breve</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Separator />
          <div className="flex items-center justify-between group cursor-not-allowed opacity-60">
            <div>
              <p className="font-medium">Atualizações de projeto</p>
              <p className="text-sm text-muted-foreground">
                Notificações quando projetos são atualizados
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch 
                    checked={false}
                    disabled={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>🚀 Disponível em breve</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Configurações de segurança da conta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChangingPassword ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mín. 8 caracteres)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 8 && (
                  <p className="text-xs text-destructive">A senha deve ter pelo menos 8 caracteres</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">As senhas não coincidem</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleChangePassword} disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar nova senha"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <Separator />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <KeyRound className="h-3 w-3" />
                Esqueci minha senha atual
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Alterar senha
              </Button>
              <p className="text-sm text-muted-foreground">
                Recomendamos trocar sua senha periodicamente para manter sua conta segura.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
