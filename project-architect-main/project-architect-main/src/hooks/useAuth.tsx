import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { User, Session, AuthError, Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: AuthError | null; userAlreadyExists?: boolean }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Standalone audit log function to avoid hook dependency issues
const logAuditEvent = async (
  eventType: string,
  userId?: string,
  success: boolean = true,
  errorMessage?: string,
  metadata: object = {}
) => {
  try {
    const userAgent = navigator.userAgent;
    await supabase.from('audit_logs').insert([{
      user_id: userId,
      event_type: eventType,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: metadata as { [key: string]: string | number | boolean | null }
    }]);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

// Safety timeout to prevent infinite loading
const LOADING_TIMEOUT_MS = 10000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Safety timeout: if loading hasn't resolved after 10s, force it to false
    const safetyTimer = setTimeout(() => {
      if (!initializedRef.current) {
        console.warn('[Auth] Loading timeout reached. Forcing loading=false.');
        initializedRef.current = true;
        setLoading(false);
      }
    }, LOADING_TIMEOUT_MS);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[Auth] onAuthStateChange:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!initializedRef.current) {
          initializedRef.current = true;
          setLoading(false);
        }

        // Log auth events asynchronously (avoid Supabase deadlock by deferring)
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(() => {
            logAuditEvent('login_success', currentSession.user.id, true, undefined, {
              email: currentSession.user.email
            });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            logAuditEvent('logout', undefined, true);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (!initializedRef.current) {
        initializedRef.current = true;
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[Auth] getSession failed:', err);
      if (!initializedRef.current) {
        initializedRef.current = true;
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('[Auth] signIn unexpected error:', error);
      return { error: error as AuthError };
    }
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ error: AuthError | null; userAlreadyExists?: boolean }> => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone_number: phone,
          },
        },
      });

      // Supabase returns a user with empty identities array when email already exists
      // (when "Confirm email" is enabled). Detect this case.
      if (!error && data?.user && data.user.identities && data.user.identities.length === 0) {
        return {
          error: null,
          userAlreadyExists: true,
        };
      }

      return { error };
    } catch (error) {
      console.error('[Auth] signUp unexpected error:', error);
      return { error: error as AuthError };
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: Provider): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      return { error };
    } catch (error) {
      console.error('[Auth] signInWithOAuth unexpected error:', error);
      return { error: error as AuthError };
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      return { error };
    } catch (error) {
      console.error('[Auth] resendVerificationEmail unexpected error:', error);
      return { error: error as AuthError };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithOAuth, signOut, resendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
