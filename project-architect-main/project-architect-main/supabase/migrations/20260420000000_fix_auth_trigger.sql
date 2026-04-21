CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, user_id, full_name, avatar_url)
    VALUES (
      new.id, 
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erro para não travar a criação de conta
  END;

  BEGIN
    INSERT INTO public.user_roles (id, user_id, role)
    VALUES (gen_random_uuid(), new.id, 'user');
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
