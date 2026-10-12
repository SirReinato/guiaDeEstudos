-- 1. Limpar tentativas anteriores
DELETE FROM auth.users WHERE email LIKE 'sirreinato%';
DELETE FROM public.profiles WHERE username = 'SirReinato';

-- 2. Inserir usuário e identidade com provider_id preenchido
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone_change,
    email_change,
    email_change_token_current,
    email_change_confirm_status
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'sirreinato@guiadeestudos.com',
    crypt('Conta.guia@22', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"SirReinato"}',
    false,
    now(),
    now(),
    '',
    '',
    '',
    0
  );

  -- 3. Identidade com provider_id explícito
  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    'sirreinato@guiadeestudos.com',
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id, 'sirreinato@guiadeestudos.com')::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  -- 4. Inserir profile como admin
  INSERT INTO public.profiles (id, username, display_name, role, status)
  VALUES (
    new_user_id,
    'SirReinato',
    'Administrador SirReinato',
    'admin',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';

END $$;
