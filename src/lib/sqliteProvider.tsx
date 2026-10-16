/**
 * GUIA DE ESTUDOS — SQLiteProvider
 * Inicializa o banco SQLite local (sql.js) assim que o app monta.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { initSQLite, saveSQLiteToStorage, getSQLite } from "./sqlite";

interface SQLiteContextType {
  inicializado: boolean;
  inicializando: boolean;
  erro: Error | null;
  db: ReturnType<typeof getSQLite> | null;
}

const SQLiteContext = createContext<SQLiteContextType | undefined>(undefined);

export const SQLiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inicializado, setInicializado] = useState<boolean>(false);
  const [inicializando, setInicializando] = useState<boolean>(true);
  const [erro, setErro] = useState<Error | null>(null);
  const [db, setDb] = useState<ReturnType<typeof getSQLite> | null>(null);

  useEffect(() => {
    let montado = true;

    const inicializar = async () => {
      try {
        console.log("[SQLiteProvider] Iniciando inicialização...");
        setInicializando(true);
        const database = await initSQLite();
        console.log("[SQLiteProvider] initSQLite concluído com sucesso");
        if (montado) {
          setDb(database);
          setInicializado(true);
          setInicializando(false);
          console.log("[SQLiteProvider] Banco inicializado com sucesso");
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[SQLiteProvider] Erro na inicialização:", errorMsg);
        if (montado) {
          setErro(err as Error);
          setInicializando(false);
        }
      }
    };

    inicializar();

    return () => {
      montado = false;
    };
  }, []);

  return (
    <SQLiteContext.Provider value={{ inicializado, inicializando, erro, db }}>
      {children}
    </SQLiteContext.Provider>
  );
};

export const useSQLite = (): SQLiteContextType => {
  const contexto = useContext(SQLiteContext);
  if (!contexto) {
    throw new Error("useSQLite deve ser usado dentro de um SQLiteProvider");
  }
  return contexto;
};
