-- ====================================================================
-- GUIA DE ESTUDOS TI — TABELA DE PERFIS DE USUÁRIOS E APROVAÇÃO ADMIN
-- Execute este script no SQL Editor do seu Supabase
-- ====================================================================

-- 1. Criar tabela pública de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso
-- Qualquer usuário autenticado pode ver seu próprio perfil
CREATE POLICY "Usuarios podem ver seu proprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio username no cadastro
CREATE POLICY "Usuarios podem inserir seu perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
);

-- Admins podem atualizar status de outros perfis (aprovar/rejeitar)
CREATE POLICY "Admins podem alterar perfis"
ON public.profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
);
