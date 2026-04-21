-- TikTok Shopping Radar Module Tables

-- Categorias de produtos
CREATE TABLE public.tiktok_radar_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos do radar (cache de API externa ou importados)
CREATE TABLE public.tiktok_radar_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT, -- ID da API externa
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.tiktok_radar_categories(id),
  image_url TEXT,
  price_min NUMERIC,
  price_max NUMERIC,
  currency TEXT DEFAULT 'BRL',
  demand_level TEXT CHECK (demand_level IN ('baixo', 'medio', 'alto', 'explosivo')),
  trending_score INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  content_patterns JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'manual', -- 'api', 'manual', 'import'
  source_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pastas do usuário
CREATE TABLE public.tiktok_radar_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos salvos pelo usuário
CREATE TABLE public.tiktok_radar_saved_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.tiktok_radar_products(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.tiktok_radar_folders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ofertas geradas por IA
CREATE TABLE public.tiktok_radar_generated_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.tiktok_radar_products(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES public.tiktok_radar_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  script TEXT,
  headline TEXT,
  description TEXT,
  variations JSONB DEFAULT '[]'::jsonb,
  hooks JSONB DEFAULT '[]'::jsonb,
  ctas JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT,
  prompt_used TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Logs de acesso ao módulo
CREATE TABLE public.tiktok_radar_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurações de API do módulo (para admin configurar)
CREATE TABLE public.tiktok_radar_api_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  endpoint_url TEXT,
  api_key_name TEXT, -- nome do secret no Supabase
  is_active BOOLEAN DEFAULT false,
  rate_limit_per_minute INTEGER DEFAULT 60,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tiktok_radar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_radar_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_radar_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_radar_saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_radar_generated_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_radar_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_radar_api_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: readable by all authenticated users
CREATE POLICY "Categories are readable by authenticated users"
ON public.tiktok_radar_categories FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Products: readable by all authenticated users
CREATE POLICY "Products are readable by authenticated users"
ON public.tiktok_radar_products FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Folders: users can CRUD their own
CREATE POLICY "Users can CRUD own folders"
ON public.tiktok_radar_folders FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Saved products: users can CRUD their own
CREATE POLICY "Users can CRUD own saved products"
ON public.tiktok_radar_saved_products FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Generated offers: users can CRUD their own
CREATE POLICY "Users can CRUD own generated offers"
ON public.tiktok_radar_generated_offers FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Access logs: users can insert and view their own
CREATE POLICY "Users can insert own access logs"
ON public.tiktok_radar_access_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own access logs"
ON public.tiktok_radar_access_logs FOR SELECT
USING (auth.uid() = user_id);

-- API config: only admins can manage
CREATE POLICY "Admins can manage API config"
ON public.tiktok_radar_api_config FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_tiktok_radar_products_updated_at
BEFORE UPDATE ON public.tiktok_radar_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tiktok_radar_folders_updated_at
BEFORE UPDATE ON public.tiktok_radar_folders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tiktok_radar_generated_offers_updated_at
BEFORE UPDATE ON public.tiktok_radar_generated_offers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tiktok_radar_api_config_updated_at
BEFORE UPDATE ON public.tiktok_radar_api_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.tiktok_radar_categories (name, slug, icon) VALUES
('Beleza & Cosméticos', 'beleza', '💄'),
('Moda & Acessórios', 'moda', '👗'),
('Casa & Decoração', 'casa', '🏠'),
('Eletrônicos & Gadgets', 'eletronicos', '📱'),
('Fitness & Saúde', 'fitness', '💪'),
('Pet & Animais', 'pet', '🐾'),
('Infantil & Kids', 'infantil', '🧸'),
('Cozinha & Utensílios', 'cozinha', '🍳'),
('Automotivo', 'automotivo', '🚗'),
('Outros', 'outros', '📦');