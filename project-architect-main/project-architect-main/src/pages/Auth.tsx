import { useEffect, useState, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, Mail, Lock, User, Phone, KeyRound, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import rocketLogo from "@/assets/rocketprompt-logo.png";

// --- Error translation helper ---
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos.",
    "Email not confirmed": "Seu email ainda não foi confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este email já está cadastrado. Tente fazer login.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Signup requires a valid password": "Por favor, informe uma senha válida.",
    "Unable to validate email address: invalid format": "Formato de email inválido.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "For security purposes, you can only request this after": "Por segurança, aguarde antes de tentar novamente.",
    "Network request failed": "Falha na conexão. Verifique sua internet.",
  };

  for (const [key, value] of Object.entries(map)) {
    if (message.includes(key)) return value;
  }
  return message;
}

// --- Social Icons ---
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

// --- Loading safety timeout ---
const FORM_LOADING_TIMEOUT_MS = 15000;

export default function Auth() {
  const [searchParams] = useSearchParams();
  const isPasswordReset = searchParams.get("reset") === "true";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(isPasswordReset);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  
  // Safety timeout ref
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const { user, loading, signIn, signUp, signInWithOAuth, resendVerificationEmail } = useAuth();
  const { toast } = useToast();
  const { logEvent } = useAuditLog();

  // Safety: auto-clear loading after timeout
  useEffect(() => {
    if (isLoading) {
      loadingTimerRef.current = setTimeout(() => {
        console.warn('[Auth] Form loading timeout reached. Clearing loading state.');
        setIsLoading(false);
        toast({
          title: "Tempo esgotado",
          description: "A operação demorou muito. Por favor, tente novamente.",
          variant: "destructive",
        });
      }, FORM_LOADING_TIMEOUT_MS);
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [isLoading, toast]);

  useEffect(() => {
    if (user && user.email_confirmed_at && !showResetPassword) {
      navigate("/");
    }
  }, [user, navigate, showResetPassword]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = ["Fraca", "Regular", "Boa", "Forte"];

  // --- OAuth Handler ---
  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        toast({
          title: "Erro ao conectar",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      }
      // If no error, Supabase redirects the user — no need to do anything else
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível conectar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Small delay since redirect may happen
      setTimeout(() => setOauthLoading(null), 3000);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        await logEvent({
          eventType: 'login_failed',
          success: false,
          errorMessage: error.message,
          metadata: { email }
        });
        
        toast({
          title: "Erro ao entrar",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível conectar ao servidor. Verifique sua internet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, email e senha.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error, userAlreadyExists } = await signUp(email, password, fullName, phone);

      if (error) {
        await logEvent({
          eventType: 'signup_failed',
          success: false,
          errorMessage: error.message,
          metadata: { email }
        });
        
        toast({
          title: "Erro ao criar conta",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else if (userAlreadyExists) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já possui uma conta. Tente fazer login ou recuperar sua senha.",
          variant: "destructive",
        });
      } else {
        await logEvent({
          eventType: 'signup_success',
          success: true,
          metadata: { email }
        });
        
        setRegistrationSuccess(true);
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      const { error } = await resendVerificationEmail(email);
      if (error) {
        toast({
          title: "Erro ao reenviar",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada e spam.",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email.",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      await logEvent({
        eventType: 'password_reset_requested',
        success: true,
        metadata: { email: resetEmail }
      });

      setResetEmailSent(true);
    } catch {
      // Don't reveal if email exists or not for security
      setResetEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      await logEvent({
        eventType: 'password_change_success',
        userId: user?.id,
        success: true
      });

      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Clear URL params and redirect
      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Password reset flow (from email link)
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                  <KeyRound className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Redefinir Senha</h2>
              <p className="text-muted-foreground">
                Digite sua nova senha abaixo
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Força: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "Digite uma senha"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">As senhas não coincidem</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar nova senha"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Registration success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 border border-green-500/30">
              <Mail className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Verifique seu Email
          </h2>
          <p className="text-muted-foreground mb-4">
            Enviamos um link de verificação para <strong>{email}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Clique no link enviado para ativar sua conta e ter acesso à ferramenta.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleResendEmail}
              disabled={resendingEmail}
              className="w-full"
            >
              {resendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reenviar email de verificação
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setRegistrationSuccess(false);
                setIsSignUp(false);
              }}
            >
              Voltar para login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot password - email sent success
  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
            Se existe uma conta com o email <strong>{resetEmail}</strong>, você receberá um link para redefinir sua senha.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Verifique também sua caixa de spam.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setResetEmailSent(false);
              setShowForgotPassword(false);
              setResetEmail("");
            }}
          >
            Voltar para login
          </Button>
        </div>
      </div>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                  <KeyRound className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Esqueceu sua senha?</h2>
              <p className="text-muted-foreground">
                Digite seu email e enviaremos um link para redefinir sua senha
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar link de redefinição"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-primary hover:underline"
              >
                Voltar para login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background relative isolate overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 bg-card/50 backdrop-blur-sm border-r border-border">
        <div>
          <Link to="/landing" className="inline-flex items-center gap-3 group">
            <img 
              src={rocketLogo} 
              alt="RocketPrompt" 
              className="h-12 w-12 group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-bold">RocketPrompt</span>
          </Link>
        </div>
        
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Transforme suas ideias em{" "}
              <span className="text-primary">produtos digitais</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Utilize inteligência artificial para criar arquiteturas de software, 
              gerar prompts profissionais e acelerar seu desenvolvimento.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              "Geração de blueprints técnicos",
              "Prompts otimizados para IA",
              "Arquitetura de projetos completa",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2025 RocketPrompt. Todos os direitos reservados.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col relative z-20">
        {/* Header Mobile */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link 
            to="/landing" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img 
                src={rocketLogo} 
                alt="RocketPrompt" 
                className="h-16 w-16"
              />
            </div>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {isSignUp ? "Criar Conta" : "Bem-vindo de volta"}
                </h2>
                <p className="text-muted-foreground">
                  {isSignUp 
                    ? "Preencha seus dados para começar" 
                    : "Entre com sua conta para continuar"
                  }
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium gap-3 hover:bg-muted/50 transition-colors"
                  onClick={() => handleOAuth('google')}
                  disabled={!!oauthLoading || isLoading}
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon className="h-5 w-5" />
                  )}
                  Continuar com Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium gap-3 hover:bg-muted/50 transition-colors"
                  onClick={() => handleOAuth('github')}
                  disabled={!!oauthLoading || isLoading}
                >
                  {oauthLoading === 'github' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <GitHubIcon className="h-5 w-5" />
                  )}
                  Continuar com GitHub
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    ou continue com email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                {isSignUp && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Seu nome completo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (opcional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+55 (11) 99999-9999"
                          value={phone}
                          onChange={handlePhoneChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength */}
                  {isSignUp && password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Força: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "Digite uma senha"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive">As senhas não coincidem</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !!oauthLoading}
                  className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {isSignUp ? "Criando conta..." : "Entrando..."}
                    </>
                  ) : (
                    isSignUp ? "Criar Conta" : "Entrar"
                  )}
                </Button>
              </form>

              {/* Forgot Password Link (only on login) */}
              {!isSignUp && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
                  >
                    <KeyRound className="h-3 w-3" />
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* Toggle Auth Mode */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? "Faça login" : "Criar conta"}
                  </button>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Ao continuar, você concorda com nossos{" "}
                  <a href="#" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
