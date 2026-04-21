import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user" | "ceo";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRole() {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Email do CEO (bypass total)
      if (user.email === "ryanzinho.andrade@gmail.com") {
        return {
          id: "ceo-bypass",
          user_id: user.id,
          role: "ceo",
          created_at: new Date().toISOString()
        } as UserRole;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserRole | null;
    },
  });
}

export function useIsAdmin() {
  const { data: role, isLoading } = useUserRole();
  // O painel admin da ferramenta só deve aparecer para quem tem acesso CEO
  return { isAdmin: role?.role === "ceo", isLoading };
}
