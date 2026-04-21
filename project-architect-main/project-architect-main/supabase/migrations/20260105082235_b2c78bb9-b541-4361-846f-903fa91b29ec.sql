-- Tabela de templates de projetos
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  product_type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  default_features JSONB DEFAULT '[]',
  default_stack JSONB DEFAULT '[]',
  business_rules TEXT,
  user_flow TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Policy for reading templates (public read)
CREATE POLICY "Anyone can read active templates" 
ON public.project_templates 
FOR SELECT 
USING (is_active = true);

-- Inserir templates padrão
INSERT INTO public.project_templates (name, description, category, product_type, tags, default_features, default_stack, business_rules, user_flow) VALUES
(
  'SaaS Starter',
  'Template completo para aplicações SaaS com autenticação, dashboard e billing',
  'SaaS',
  'saas',
  ARRAY['React', 'Supabase', 'Stripe'],
  '["Autenticação", "Dashboard", "Billing/Assinaturas", "Perfil de usuário", "Notificações"]',
  '["React", "TypeScript", "Supabase", "Stripe", "Tailwind CSS"]',
  'Modelo de assinatura mensal/anual. Trial de 14 dias. Diferentes planos com features limitadas.',
  'Registro → Onboarding → Dashboard → Uso do produto → Upgrade de plano'
),
(
  'E-commerce',
  'Loja virtual com carrinho, checkout e integração de pagamentos',
  'E-commerce',
  'site',
  ARRAY['React', 'Supabase', 'Mercado Pago'],
  '["Catálogo de produtos", "Carrinho", "Checkout", "Pagamentos", "Gestão de pedidos", "Avaliações"]',
  '["React", "TypeScript", "Supabase", "Mercado Pago", "Tailwind CSS"]',
  'Vendas diretas com margem sobre produtos. Frete calculado por CEP. Cupons de desconto.',
  'Home → Catálogo → Produto → Carrinho → Checkout → Pagamento → Confirmação'
),
(
  'Landing Page',
  'Landing page de alta conversão com formulários e analytics',
  'Marketing',
  'site',
  ARRAY['React', 'Tailwind', 'Analytics'],
  '["Hero section", "Benefícios", "Depoimentos", "FAQ", "CTA", "Formulário de captura"]',
  '["React", "TypeScript", "Tailwind CSS", "Google Analytics", "Meta Pixel"]',
  'Captura de leads para nutrição via email. Conversão para vendas ou agendamentos.',
  'Visita → Scroll → Interesse → Formulário → Lead capturado'
),
(
  'Admin Dashboard',
  'Painel administrativo com gráficos, tabelas e gestão de usuários',
  'Admin',
  'sistema',
  ARRAY['React', 'Charts', 'CRUD'],
  '["Dashboard com KPIs", "Gestão de usuários", "CRUD de entidades", "Relatórios", "Logs de auditoria"]',
  '["React", "TypeScript", "Supabase", "Recharts", "Tailwind CSS"]',
  'Controle de acesso por roles (admin, editor, viewer). Logs de todas ações.',
  'Login → Dashboard → Navegação por módulos → Ações → Logout'
),
(
  'Marketplace',
  'Plataforma de marketplace com vendedores, produtos e comissões',
  'Marketplace',
  'marketplace',
  ARRAY['React', 'Multi-tenant', 'Payments'],
  '["Cadastro de vendedores", "Catálogo multi-vendor", "Sistema de comissões", "Split de pagamentos", "Avaliações"]',
  '["React", "TypeScript", "Supabase", "Stripe Connect", "Tailwind CSS"]',
  'Comissão de X% sobre vendas. Vendedores pagam taxa mensal opcional. Destaque pago.',
  'Vendedor: Cadastro → Aprovação → Listagem → Vendas → Recebimentos | Comprador: Busca → Produto → Compra'
),
(
  'Blog/CMS',
  'Sistema de blog com editor rich-text e categorias',
  'Conteúdo',
  'site',
  ARRAY['React', 'Markdown', 'SEO'],
  '["Editor de posts", "Categorias/Tags", "Comentários", "SEO automático", "Newsletter"]',
  '["React", "TypeScript", "Supabase", "TipTap Editor", "Tailwind CSS"]',
  'Monetização via ads, newsletter patrocinada ou conteúdo premium.',
  'Admin: Escrita → Publicação → Promoção | Leitor: Descoberta → Leitura → Engajamento'
);

-- Criar função base update_updated_at_column (indispensável para os triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON public.project_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();