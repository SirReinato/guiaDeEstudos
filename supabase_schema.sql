-- ====================================================================
-- GUIA DE ESTUDOS TI — SCHEMA COMPLETO DO BANCO DE DADOS (SUPABASE POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/tfsvfipsijtrzovbmmeq/sql
-- ====================================================================

-- 1. Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Editais
CREATE TABLE IF NOT EXISTS public.editais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    banca TEXT NOT NULL,
    orgao TEXT,
    ano INTEGER,
    arquivo_edital_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Provas Anteriores
CREATE TABLE IF NOT EXISTS public.provas_anteriores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edital_id UUID NOT NULL REFERENCES public.editais(id) ON DELETE CASCADE,
    ano INTEGER,
    orgao TEXT,
    banca TEXT,
    arquivo_prova_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Disciplinas
CREATE TABLE IF NOT EXISTS public.disciplinas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edital_id UUID NOT NULL REFERENCES public.editais(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Tópicos do Conteúdo Programático
CREATE TABLE IF NOT EXISTS public.topicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    relevancia_banca INTEGER DEFAULT 3 CHECK (relevancia_banca BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Resumos Teóricos (Ciclo 30%)
CREATE TABLE IF NOT EXISTS public.teoria_resumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topico_id UUID NOT NULL REFERENCES public.topicos(id) ON DELETE CASCADE,
    conteudo_markdown TEXT NOT NULL,
    tempo_leitura_estimado_min INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Questões (Ciclo 70%)
CREATE TABLE IF NOT EXISTS public.questoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topico_id UUID NOT NULL REFERENCES public.topicos(id) ON DELETE CASCADE,
    enunciado TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('multipla_escolha', 'certo_errado')),
    alternativas JSONB NOT NULL DEFAULT '[]'::jsonb,
    resposta_correta TEXT NOT NULL,
    explicacao_detalhada TEXT NOT NULL,
    banca_origem TEXT,
    ano_origem INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabela de Flashcards (Dose Diária / Anki)
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topico_id UUID REFERENCES public.topicos(id) ON DELETE SET NULL,
    frente TEXT NOT NULL,
    verso TEXT NOT NULL,
    intervalo_dias NUMERIC DEFAULT 1,
    fator_facilidade NUMERIC DEFAULT 2.5,
    repeticoes INTEGER DEFAULT 0,
    proxima_revisao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabela de Desafios de Código (Mini-IDE para TI)
CREATE TABLE IF NOT EXISTS public.desafios_codigo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topico_id UUID REFERENCES public.topicos(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    linguagem TEXT NOT NULL CHECK (linguagem IN ('sql', 'python', 'javascript', 'java')),
    enunciado TEXT NOT NULL,
    codigo_inicial TEXT NOT NULL,
    solucao_esperada TEXT,
    dicas JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabela de Redações / Discursivas Técnicas
CREATE TABLE IF NOT EXISTS public.temas_redacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topico_id UUID REFERENCES public.topicos(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    enunciado TEXT NOT NULL,
    limite_linhas INTEGER DEFAULT 30,
    padrao_resposta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Tabela de Streaks Diários
CREATE TABLE IF NOT EXISTS public.daily_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    cards_revisados INTEGER DEFAULT 0,
    questoes_resolvidas INTEGER DEFAULT 0,
    meta_concluida BOOLEAN DEFAULT FALSE,
    streak_dias INTEGER DEFAULT 0,
    UNIQUE(user_id, data)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) — SEGURANÇA POR USUÁRIO
-- ====================================================================

ALTER TABLE public.editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para Editais
CREATE POLICY "Usuarios podem gerenciar seus proprios editais"
ON public.editais FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas de acesso para Flashcards
CREATE POLICY "Usuarios podem gerenciar seus proprios flashcards"
ON public.flashcards FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas de acesso para Streaks
CREATE POLICY "Usuarios podem gerenciar seus proprios streaks"
ON public.daily_streaks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
