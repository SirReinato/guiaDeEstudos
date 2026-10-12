-- ====================================================================
-- CORREÇÃO DEFINITIVA DE RLS (ROW LEVEL SECURITY) NO SUPABASE
-- Resolve erro 500: "infinite recursion detected in policy for relation profiles"
-- Resolve erro: "new row violates row-level security policy for table disciplinas"
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/tfsvfipsijtrzovbmmeq/sql
-- ====================================================================

-- 1. CORRIGIR RECURSÃO INFINITA NA TABELA PROFILES
-- O erro acontecia porque uma política do 'profiles' fazia SELECT no próprio 'profiles'.
-- A forma correta e recomendada pelo Supabase é uma função SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$;

-- Remover políticas antigas recursivas de profiles
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios podem inserir seu perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem alterar perfis" ON public.profiles;

-- Recriar políticas limpas para profiles sem recursão
CREATE POLICY "Leitura de perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Insercao de perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Atualizacao de perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- 2. HABILITAR POLÍTICAS PARA DISCIPLINAS, TÓPICOS E QUESTÕES
-- O erro "new row violates row-level security policy for table disciplinas" ocorreu
-- porque a tabela tinha RLS ativado ou herdado, mas não tinha política explícita de INSERT.

ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teoria_resumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desafios_codigo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temas_redacao ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Acesso total disciplinas do usuario" ON public.disciplinas;
DROP POLICY IF EXISTS "Acesso total topicos" ON public.topicos;
DROP POLICY IF EXISTS "Acesso total teoria" ON public.teoria_resumos;
DROP POLICY IF EXISTS "Acesso total questoes" ON public.questoes;
DROP POLICY IF EXISTS "Acesso total desafios" ON public.desafios_codigo;
DROP POLICY IF EXISTS "Acesso total redacoes" ON public.temas_redacao;

-- Políticas permissivas e seguras para usuários autenticados:
CREATE POLICY "Acesso total disciplinas do usuario"
ON public.disciplinas FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Acesso total topicos"
ON public.topicos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Acesso total teoria"
ON public.teoria_resumos FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Acesso total questoes"
ON public.questoes FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Acesso total desafios"
ON public.desafios_codigo FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Acesso total redacoes"
ON public.temas_redacao FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
