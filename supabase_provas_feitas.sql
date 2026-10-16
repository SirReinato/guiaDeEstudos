-- ====================================================================
-- GUIA DE ESTUDOS TI — TABELA DE PROVAS FEITAS (MODO SIMULADO/GABARITO)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/tfsvfipsijtrzovbmmeq/sql
-- ====================================================================

-- 1. Tabela de Provas Feitas (caderno de prova com gabarito preliminar/definitivo)
CREATE TABLE IF NOT EXISTS public.provas_feitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    edital_id UUID REFERENCES public.editais(id) ON DELETE SET NULL,
    nome_prova TEXT NOT NULL,
    total_questoes INTEGER NOT NULL DEFAULT 0 CHECK (total_questoes >= 0),
    questoes_objetivas INTEGER NOT NULL DEFAULT 0 CHECK (questoes_objetivas >= 0),
    questoes_gerais INTEGER NOT NULL DEFAULT 0 CHECK (questoes_gerais >= 0),
    peso_geral NUMERIC(3,1) DEFAULT 1 CHECK (peso_geral BETWEEN 1 AND 10),
    peso_objetivo NUMERIC(3,1) DEFAULT 1 CHECK (peso_objetivo BETWEEN 1 AND 10),
    nota_minima_geral NUMERIC(3,1) DEFAULT 6 CHECK (nota_minima_geral BETWEEN 0 AND 10),
    nota_minima_objetiva NUMERIC(3,1) DEFAULT 6 CHECK (nota_minima_objetiva BETWEEN 0 AND 10),
    nota_corte NUMERIC(3,1) DEFAULT 6 CHECK (nota_corte BETWEEN 0 AND 10),
    data_realizacao DATE NOT NULL,
    gabarito_preliminar JSONB DEFAULT '{}'::jsonb,
    gabarito_definitivo JSONB DEFAULT '{}'::jsonb,
    respostas_usuario JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índice para buscas rápidas por usuário
CREATE INDEX IF NOT EXISTS idx_provas_feitas_user_id ON public.provas_feitas(user_id);
CREATE INDEX IF NOT EXISTS idx_provas_feitas_edital_id ON public.provas_feitas(edital_id);
CREATE INDEX IF NOT EXISTS idx_provas_feitas_data ON public.provas_feitas(data_realizacao);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.provas_feitas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acesso — cada usuário gerencia só suas próprias provas
CREATE POLICY "Usuarios podem gerenciar suas proprias provas feitas"
ON public.provas_feitas FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- COMO USAR NO FRONTEND:
-- - provasFeitasService.criarProvaFeita(...) — cadastra nova prova
-- - provasFeitasService.listarProvasFeitas() — lista todas do usuário
-- - provasFeitasService.atualizarProvaFeita(id, {...}) — edita prova existente
-- - provasFeitasService.excluirProvaFeita(id) — remove prova
-- - provasFeitasService.calcularEstatisticas(prova) — calcula acertos/nota
-- ====================================================================
