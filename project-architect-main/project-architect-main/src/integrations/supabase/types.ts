export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json
          job_type: string
          output_data: Json | null
          project_id: string
          retry_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          job_type?: string
          output_data?: Json | null
          project_id: string
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          job_type?: string
          output_data?: Json | null
          project_id?: string
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          model_used: string | null
          project_id: string | null
          prompt_sent: string
          request_type: string
          response_received: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          model_used?: string | null
          project_id?: string | null
          prompt_sent: string
          request_type: string
          response_received?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          model_used?: string | null
          project_id?: string | null
          prompt_sent?: string
          request_type?: string
          response_received?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      architecture_answers: {
        Row: {
          additional_notes: string | null
          audience_consciousness: string | null
          audience_type: Database["public"]["Enums"]["audience_type"] | null
          budget_range: string | null
          business_objective:
            | Database["public"]["Enums"]["business_objective"]
            | null
          complexity_level:
            | Database["public"]["Enums"]["complexity_level"]
            | null
          core_features: string | null
          created_at: string | null
          expected_deadline: string | null
          id: string
          integrations: string | null
          monetization_model:
            | Database["public"]["Enums"]["monetization_model"]
            | null
          platform_type: Database["public"]["Enums"]["platform_type"] | null
          pricing_strategy: string | null
          problem_description: string | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          project_id: string
          step_number: number
          success_metrics: string | null
          target_users: string | null
          team_size: string | null
          tech_preferences: string | null
          updated_at: string | null
          user_id: string
          user_pain_points: string | null
        }
        Insert: {
          additional_notes?: string | null
          audience_consciousness?: string | null
          audience_type?: Database["public"]["Enums"]["audience_type"] | null
          budget_range?: string | null
          business_objective?:
            | Database["public"]["Enums"]["business_objective"]
            | null
          complexity_level?:
            | Database["public"]["Enums"]["complexity_level"]
            | null
          core_features?: string | null
          created_at?: string | null
          expected_deadline?: string | null
          id?: string
          integrations?: string | null
          monetization_model?:
            | Database["public"]["Enums"]["monetization_model"]
            | null
          platform_type?: Database["public"]["Enums"]["platform_type"] | null
          pricing_strategy?: string | null
          problem_description?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          project_id: string
          step_number: number
          success_metrics?: string | null
          target_users?: string | null
          team_size?: string | null
          tech_preferences?: string | null
          updated_at?: string | null
          user_id: string
          user_pain_points?: string | null
        }
        Update: {
          additional_notes?: string | null
          audience_consciousness?: string | null
          audience_type?: Database["public"]["Enums"]["audience_type"] | null
          budget_range?: string | null
          business_objective?:
            | Database["public"]["Enums"]["business_objective"]
            | null
          complexity_level?:
            | Database["public"]["Enums"]["complexity_level"]
            | null
          core_features?: string | null
          created_at?: string | null
          expected_deadline?: string | null
          id?: string
          integrations?: string | null
          monetization_model?:
            | Database["public"]["Enums"]["monetization_model"]
            | null
          platform_type?: Database["public"]["Enums"]["platform_type"] | null
          pricing_strategy?: string | null
          problem_description?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          project_id?: string
          step_number?: number
          success_metrics?: string | null
          target_users?: string | null
          team_size?: string | null
          tech_preferences?: string | null
          updated_at?: string | null
          user_id?: string
          user_pain_points?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "architecture_answers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          status: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          client_email: string
          client_name: string
          client_notes: string | null
          contract_content: string
          contract_value: number
          created_at: string
          deadline: string | null
          id: string
          payment_conditions: string | null
          project_description: string
          service_type: string
          sign_token: string
          signed_at: string | null
          signed_ip: string | null
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_notes?: string | null
          contract_content: string
          contract_value: number
          created_at?: string
          deadline?: string | null
          id?: string
          payment_conditions?: string | null
          project_description: string
          service_type: string
          sign_token?: string
          signed_at?: string | null
          signed_ip?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_notes?: string | null
          contract_content?: string
          contract_value?: number
          created_at?: string
          deadline?: string | null
          id?: string
          payment_conditions?: string | null
          project_description?: string
          service_type?: string
          sign_token?: string
          signed_at?: string | null
          signed_ip?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          project_updates: boolean
          updated_at: string
          user_id: string
          weekly_reports: boolean
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          project_updates?: boolean
          updated_at?: string
          user_id: string
          weekly_reports?: boolean
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          project_updates?: boolean
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean
        }
        Relationships: []
      }
      generated_blueprints: {
        Row: {
          business_rules: Json | null
          created_at: string | null
          database_structure: Json | null
          features_by_module: Json | null
          id: string
          problem_solved: string | null
          professional_prompt: string | null
          project_id: string
          raw_ai_response: string | null
          recommended_stack: Json | null
          roadmap: Json | null
          updated_at: string | null
          user_flow: string | null
          user_id: string
          value_proposition: string | null
          vision_overview: string | null
        }
        Insert: {
          business_rules?: Json | null
          created_at?: string | null
          database_structure?: Json | null
          features_by_module?: Json | null
          id?: string
          problem_solved?: string | null
          professional_prompt?: string | null
          project_id: string
          raw_ai_response?: string | null
          recommended_stack?: Json | null
          roadmap?: Json | null
          updated_at?: string | null
          user_flow?: string | null
          user_id: string
          value_proposition?: string | null
          vision_overview?: string | null
        }
        Update: {
          business_rules?: Json | null
          created_at?: string | null
          database_structure?: Json | null
          features_by_module?: Json | null
          id?: string
          problem_solved?: string | null
          professional_prompt?: string | null
          project_id?: string
          raw_ai_response?: string | null
          recommended_stack?: Json | null
          roadmap?: Json | null
          updated_at?: string | null
          user_flow?: string | null
          user_id?: string
          value_proposition?: string | null
          vision_overview?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_blueprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_prompts: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          project_context: Json | null
          prompt_content: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          project_context?: Json | null
          prompt_content: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          project_context?: Json | null
          prompt_content?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_prompts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan: string
          status: string
          subscription_id: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan: string
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan?: string
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_blocked: boolean
          phone_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          phone_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      project_templates: {
        Row: {
          business_rules: string | null
          category: string
          created_at: string
          default_features: Json | null
          default_stack: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          product_type: string
          tags: string[] | null
          updated_at: string
          user_flow: string | null
        }
        Insert: {
          business_rules?: string | null
          category: string
          created_at?: string
          default_features?: Json | null
          default_stack?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          product_type: string
          tags?: string[] | null
          updated_at?: string
          user_flow?: string | null
        }
        Update: {
          business_rules?: string | null
          category?: string
          created_at?: string
          default_features?: Json | null
          default_stack?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          product_type?: string
          tags?: string[] | null
          updated_at?: string
          user_flow?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_radar_access_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tiktok_radar_api_config: {
        Row: {
          api_key_name: string | null
          created_at: string
          endpoint_url: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          provider: string
          rate_limit_per_minute: number | null
          updated_at: string
        }
        Insert: {
          api_key_name?: string | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider: string
          rate_limit_per_minute?: number | null
          updated_at?: string
        }
        Update: {
          api_key_name?: string | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider?: string
          rate_limit_per_minute?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tiktok_radar_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tiktok_radar_folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_radar_generated_offers: {
        Row: {
          created_at: string
          ctas: Json | null
          description: string | null
          folder_id: string | null
          headline: string | null
          hooks: Json | null
          id: string
          metadata: Json | null
          product_id: string | null
          prompt_used: string | null
          script: string | null
          target_audience: string | null
          title: string
          updated_at: string
          user_id: string
          variations: Json | null
        }
        Insert: {
          created_at?: string
          ctas?: Json | null
          description?: string | null
          folder_id?: string | null
          headline?: string | null
          hooks?: Json | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          prompt_used?: string | null
          script?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
          user_id: string
          variations?: Json | null
        }
        Update: {
          created_at?: string
          ctas?: Json | null
          description?: string | null
          folder_id?: string | null
          headline?: string | null
          hooks?: Json | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          prompt_used?: string | null
          script?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_radar_generated_offers_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "tiktok_radar_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_radar_generated_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "tiktok_radar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_radar_products: {
        Row: {
          category_id: string | null
          content_patterns: Json | null
          created_at: string
          currency: string | null
          demand_level: string | null
          description: string | null
          external_id: string | null
          id: string
          image_url: string | null
          is_trending: boolean | null
          metadata: Json | null
          name: string
          price_max: number | null
          price_min: number | null
          source: string | null
          source_url: string | null
          trending_score: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content_patterns?: Json | null
          created_at?: string
          currency?: string | null
          demand_level?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          metadata?: Json | null
          name: string
          price_max?: number | null
          price_min?: number | null
          source?: string | null
          source_url?: string | null
          trending_score?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content_patterns?: Json | null
          created_at?: string
          currency?: string | null
          demand_level?: string | null
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_trending?: boolean | null
          metadata?: Json | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          source?: string | null
          source_url?: string | null
          trending_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_radar_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tiktok_radar_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_radar_saved_products: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          notes: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          notes?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_radar_saved_products_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "tiktok_radar_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_radar_saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "tiktok_radar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      audience_type: "b2b" | "b2c" | "ambos"
      business_objective: "venda" | "leads" | "retencao" | "escala"
      complexity_level: "mvp" | "produto_vendavel" | "escala"
      contract_status: "draft" | "sent" | "viewed" | "signed" | "cancelled"
      job_status: "pending" | "processing" | "completed" | "error"
      monetization_model:
        | "assinatura"
        | "one_time"
        | "freemium"
        | "comissao"
        | "hibrido"
      platform_type: "web" | "mobile" | "ambos"
      product_type: "site" | "saas" | "app" | "marketplace" | "sistema"
      project_status: "draft" | "in_progress" | "completed" | "archived"
      subscription_plan: "monthly" | "quarterly" | "lifetime"
      subscription_status: "active" | "cancelled" | "expired" | "trialing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      audience_type: ["b2b", "b2c", "ambos"],
      business_objective: ["venda", "leads", "retencao", "escala"],
      complexity_level: ["mvp", "produto_vendavel", "escala"],
      contract_status: ["draft", "sent", "viewed", "signed", "cancelled"],
      job_status: ["pending", "processing", "completed", "error"],
      monetization_model: [
        "assinatura",
        "one_time",
        "freemium",
        "comissao",
        "hibrido",
      ],
      platform_type: ["web", "mobile", "ambos"],
      product_type: ["site", "saas", "app", "marketplace", "sistema"],
      project_status: ["draft", "in_progress", "completed", "archived"],
      subscription_plan: ["monthly", "quarterly", "lifetime"],
      subscription_status: ["active", "cancelled", "expired", "trialing"],
    },
  },
} as const
