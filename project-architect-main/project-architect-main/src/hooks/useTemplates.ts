import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  product_type: string;
  tags: string[] | null;
  default_features: string[] | null;
  default_stack: string[] | null;
  business_rules: string | null;
  user_flow: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as ProjectTemplate[];
    },
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("project_templates")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as ProjectTemplate;
    },
    enabled: !!id,
  });
}