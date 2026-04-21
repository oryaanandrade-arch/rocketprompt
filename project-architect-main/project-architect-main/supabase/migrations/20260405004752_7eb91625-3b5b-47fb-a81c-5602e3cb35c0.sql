
-- Drop the overly permissive anon update policy
DROP POLICY "Anyone can sign a contract via token" ON public.contracts;

-- Create a tighter policy: anon can only update contracts that are in 'sent' or 'viewed' status
CREATE POLICY "Anon can sign pending contracts" ON public.contracts
  FOR UPDATE TO anon
  USING (status IN ('sent', 'viewed'))
  WITH CHECK (status = 'signed');
