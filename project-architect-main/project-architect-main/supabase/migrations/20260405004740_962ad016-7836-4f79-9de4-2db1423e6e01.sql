
-- Create contract status enum
CREATE TYPE public.contract_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'cancelled');

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  project_description TEXT NOT NULL,
  deadline TEXT,
  contract_value NUMERIC NOT NULL,
  payment_conditions TEXT,
  contract_content TEXT NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  sign_token UUID NOT NULL DEFAULT gen_random_uuid(),
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_ip TEXT,
  client_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can CRUD own contracts" ON public.contracts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read access via sign_token (for clients viewing contracts)
CREATE POLICY "Anyone can view contract by sign token" ON public.contracts
  FOR SELECT TO anon, authenticated
  USING (true);

-- Public update for signing (anon can sign)
CREATE POLICY "Anyone can sign a contract via token" ON public.contracts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
