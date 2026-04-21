-- Add is_blocked column to profiles table for user blocking functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- Add blocked_at and blocked_reason columns for audit
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone DEFAULT null;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_reason text DEFAULT null;

-- Comment on columns
COMMENT ON COLUMN public.profiles.is_blocked IS 'Whether the user is blocked from accessing the application';
COMMENT ON COLUMN public.profiles.blocked_at IS 'Timestamp when the user was blocked';
COMMENT ON COLUMN public.profiles.blocked_reason IS 'Reason for blocking the user';