/**
 * GUIA DE ESTUDOS — SQLite local no navegador (sql.js / WASM)
 * Banco persistente em IndexedDB via localStorage fallback.
 * Usado exclusivamente para o módulo "Provas Feitas".
 */

import { Database } from "sql.js";

// Nome do arquivo de banco (salvo no localStorage como base64)
const DB_STORAGE_KEY = "guia_estudos_sqlite_provas_feitas";

// Schema compatível com a tabela public.provas_feitas do Supabase
const SCHEMA = `
PRAGMA foreign_keys = ON;

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
    gabarito_preliminar TEXT DEFAULT '{}',
    gabarito_definitivo TEXT DEFAULT '{}',
    respostas_usuario TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_provas_feitas_user_id ON provas_feitas(user_id);
CREATE INDEX IF NOT EXISTS idx_provas_feitas_edital_id ON provas_feitas(edital_id);
CREATE INDEX IF NOT EXISTS idx_provas_feitas_data ON provas_feitas(data_realizacao);
`;

let dbInstance: Database | null = null;
let isInitialized = false;
let initPromise: Promise<Database> | null = null;

/**
 * Carrega o WASM do sql.js e inicializa o banco.
 * Persiste os dados no localStorage (base64) para sobreviver a refresh.
 */
export async function initSQLite(): Promise<Database> {
  if (dbInstance && isInitialized) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // sql.js precisa do arquivo WASM servido da pasta public (MIME type correto)
      const SQL_WASM_URL = "/wasm/sql-wasm.wasm";

      const { default: initSqlJs } = await import("sql.js");
      const SQL = await initSqlJs({
        locateFile: (file: string) => {
          if (file === "sql-wasm.wasm") return SQL_WASM_URL;
          return file;
        },
      });

      // Tenta recuperar banco salvo no localStorage
      let savedData: Uint8Array | null = null;
      try {
        const base64 = localStorage.getItem(DB_STORAGE_KEY);
        if (base64) {
          const binary = atob(base64);
          savedData = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        }
      } catch {
        // localStorage indisponível — inicia vazio
      }

      const db = new SQL.Database(savedData);

      // Executa schema
      db.exec(SCHEMA);

      dbInstance = db;
      isInitialized = true;
      return db;
    } catch (err: unknown) {
      // Em caso de falha, reseta para permitir retry na próxima chamada
      initPromise = null;
      isInitialized = false;
      dbInstance = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Salva o banco atual no localStorage (base64) para persistência.
 */
export async function saveSQLiteToStorage(db: Database): Promise<void> {
  try {
    const data = db.export();
    const binary = String.fromCharCode(...data);
    localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
  } catch (err) {
    console.warn("Não foi possível persistir SQLite no localStorage:", err);
  }
}

/**
 * Retorna a instância ativa (deve ser chamada após initSQLite).
 */
export function getSQLite(): Database | null {
  return dbInstance;
}

/**
 * Limpa o banco e o storage (útil para testes).
 */
export async function resetSQLite(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  isInitialized = false;
  initPromise = null;
  try {
    localStorage.removeItem(DB_STORAGE_KEY);
  } catch {
    // ignore
  }
}
