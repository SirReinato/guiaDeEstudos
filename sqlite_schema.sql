-- ====================================================================
-- GUIA DE ESTUDOS TI — SCHEMA SQLITE PARA TESTES LOCAIS (PROVAS FEITAS)
-- ====================================================================

PRAGMA foreign_keys = ON;

-- Tabela de provas feitas (espelho da tabela Supabase public.provas_feitas)
CREATE TABLE IF NOT EXISTS provas_feitas (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    edital_id TEXT,
    nome_prova TEXT NOT NULL,
    total_questoes INTEGER NOT NULL DEFAULT 0 CHECK (total_questoes >= 0),
    questoes_objetivas INTEGER NOT NULL DEFAULT 0 CHECK (questoes_objetivas >= 0),
    questoes_gerais INTEGER NOT NULL DEFAULT 0 CHECK (questoes_gerais >= 0),
    peso_geral REAL NOT NULL DEFAULT 1 CHECK (peso_geral BETWEEN 1 AND 10),
    peso_objetivo REAL NOT NULL DEFAULT 1 CHECK (peso_objetivo BETWEEN 1 AND 10),
    nota_minima_geral REAL NOT NULL DEFAULT 6 CHECK (nota_minima_geral BETWEEN 0 AND 10),
    nota_minima_objetiva REAL NOT NULL DEFAULT 6 CHECK (nota_minima_objetiva BETWEEN 0 AND 10),
    nota_corte REAL NOT NULL DEFAULT 6 CHECK (nota_corte BETWEEN 0 AND 10),
    data_realizacao TEXT NOT NULL,
    gabarito_preliminar TEXT DEFAULT '{}',  -- JSON armazenado como TEXT
    gabarito_definitivo TEXT DEFAULT '{}',  -- JSON armazenado como TEXT
    respostas_usuario TEXT DEFAULT '{}',    -- JSON armazenado como TEXT
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_provas_feitas_user_id ON provas_feitas(user_id);
CREATE INDEX IF NOT EXISTS idx_provas_feitas_edital_id ON provas_feitas(edital_id);
CREATE INDEX IF NOT EXISTS idx_provas_feitas_data ON provas_feitas(data_realizacao);

-- ====================================================================
-- COMO TESTAR:
--   1. npm install better-sqlite3
--   2. node sqlite_test.js
-- ====================================================================
