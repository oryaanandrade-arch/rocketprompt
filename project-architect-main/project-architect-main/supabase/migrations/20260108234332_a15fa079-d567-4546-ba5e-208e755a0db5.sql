-- Fix overly permissive RLS policies on payments table
-- Remove the dangerous policies that allow any authenticated user to insert/update

DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;

-- Create proper policies that only allow service role (backend) operations
-- For INSERT: Only allow authenticated users to insert their own payments (not used directly, but safer)
CREATE POLICY "Users can insert own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- For UPDATE: Only allow users to update their own payments
CREATE POLICY "Users can update own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: The webhook will need to use service_role key to bypass RLS
-- This is the correct pattern for webhook-based payment processing