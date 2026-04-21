-- Add unique constraint on transaction_id for payments upsert to work correctly
ALTER TABLE public.payments ADD CONSTRAINT payments_transaction_id_unique UNIQUE (transaction_id);