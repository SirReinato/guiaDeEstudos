/**
 * GUIA DE ESTUDOS — Serviço SQLite para Provas Feitas
 * Mesma interface do provasFeitasService (Supabase), mas rodando localmente no navegador.
 */

import { initSQLite, saveSQLiteToStorage, getSQLite } from "../lib/sqlite";
import type { ProvaFeita, ProvaFeitaComStats } from "./provasFeitasService";

function gerarUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function rowToProva(row: any): ProvaFeita {
  return {
    id: row.id,
    user_id: row.user_id,
    edital_id: row.edital_id || undefined,
    nome_prova: row.nome_prova,
    total_questoes: row.total_questoes,
    questoes_objetivas: row.questoes_objetivas,
    questoes_gerais: row.questoes_gerais,
    peso_geral: row.peso_geral,
    peso_objetivo: row.peso_objetivo,
    nota_minima_geral: row.nota_minima_geral,
    nota_minima_objetiva: row.nota_minima_objetiva,
    nota_corte: row.nota_corte,
    data_realizacao: row.data_realizacao,
    gabarito_preliminar: row.gabarito_preliminar ? JSON.parse(row.gabarito_preliminar) : undefined,
    gabarito_definitivo: row.gabarito_definitivo ? JSON.parse(row.gabarito_definitivo) : undefined,
    respostas_usuario: row.respostas_usuario ? JSON.parse(row.respostas_usuario) : undefined,
    created_at: row.created_at,
  };
}

export const provasFeitasSQLiteService = {
  // Inicializa o banco (deve ser chamado uma vez no app)
  async inicializar(): Promise<{ error: Error | null }> {
    try {
      await initSQLite();
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  },

  // 1. Listar provas do usuário
  async listarProvasFeitas(userId: string): Promise<{ data: ProvaFeita[] | null; error: Error | null }> {
    try {
      const db = getSQLite();
      if (!db) throw new Error("SQLite não inicializado. Chame inicializar() primeiro.");

      const rows = db.exec(
        {
          sql: `SELECT * FROM provas_feitas WHERE user_id = ? ORDER BY created_at DESC`,
          params: [userId],
        }
      );

      if (!rows || rows.length === 0) return { data: [], error: null };

      const result = rows[0];
      const columns = result.columns;
      const valores = result.values;

      const provas: ProvaFeita[] = valores.map((v: any[]) => {
        const row: any = {};
        columns.forEach((col, i) => {
          row[col] = v[i];
        });
        return rowToProva(row);
      });

      return { data: provas, error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

  // 2. Criar nova prova
  async criarProvaFeita(payload: {
    nome_prova: string;
    total_questoes: number;
    questoes_objetivas: number;
    questoes_gerais: number;
    user_id: string;
    edital_id?: string;
    peso_geral?: number;
    peso_objetivo?: number;
    nota_minima_geral?: number;
    nota_minima_objetiva?: number;
    nota_corte?: number;
    data_realizacao?: string;
    gabarito_preliminar?: Record<number, string>;
    gabarito_definitivo?: Record<number, string>;
    respostas_usuario?: Record<number, string>;
  }): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const db = getSQLite();
      if (!db) throw new Error("SQLite não inicializado. Chame inicializar() primeiro.");

      const id = gerarUUID();
      const agora = new Date().toISOString();

      db.run(
        `INSERT INTO provas_feitas (
          id, user_id, edital_id, nome_prova, total_questoes, questoes_objetivas, questoes_gerais,
          peso_geral, peso_objetivo, nota_minima_geral, nota_minima_objetiva, nota_corte,
          data_realizacao, gabarito_preliminar, gabarito_definitivo, respostas_usuario, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          payload.user_id,
          payload.edital_id || null,
          payload.nome_prova,
          payload.total_questoes,
          payload.questoes_objetivas,
          payload.questoes_gerais,
          payload.peso_geral ?? 1,
          payload.peso_objetivo ?? 1,
          payload.nota_minima_geral ?? 6,
          payload.nota_minima_objetiva ?? 6,
          payload.nota_corte ?? 6,
          payload.data_realizacao || agora,
          payload.gabarito_preliminar ? JSON.stringify(payload.gabarito_preliminar) : "{}",
          payload.gabarito_definitivo ? JSON.stringify(payload.gabarito_definitivo) : "{}",
          payload.respostas_usuario ? JSON.stringify(payload.respostas_usuario) : "{}",
          agora,
        ]
      );

      await saveSQLiteToStorage(db);

      const criada = db.exec({
        sql: `SELECT * FROM provas_feitas WHERE id = ?`,
        params: [id],
      });

      if (!criada || criada.length === 0 || criada[0].values.length === 0) {
        return { data: null, error: new Error("Prova não encontrada após criação") };
      }

      const row: any = {};
      criada[0].columns.forEach((col: string, i: number) => {
        row[col] = criada[0].values[0][i];
      });

      return { data: rowToProva(row), error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

  // 3. Atualizar prova existente
  async atualizarProvaFeita(provaId: string, payload: {
    nome_prova?: string;
    total_questoes?: number;
    questoes_objetivas?: number;
    questoes_gerais?: number;
    peso_geral?: number;
    peso_objetivo?: number;
    nota_minima_geral?: number;
    nota_minima_objetiva?: number;
    nota_corte?: number;
    data_realizacao?: string;
    gabarito_preliminar?: Record<number, string>;
    gabarito_definitivo?: Record<number, string>;
    respostas_usuario?: Record<number, string>;
  }): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const db = getSQLite();
      if (!db) throw new Error("SQLite não inicializado. Chame inicializar() primeiro.");

      const campos: string[] = [];
      const valores: any[] = [];

      const addCampo = (nome: string, valor: any) => {
        if (valor !== undefined) {
          campos.push(`${nome} = ?`);
          valores.push(valor);
        }
      };

      addCampo("nome_prova", payload.nome_prova);
      addCampo("total_questoes", payload.total_questoes);
      addCampo("questoes_objetivas", payload.questoes_objetivas);
      addCampo("questoes_gerais", payload.questoes_gerais);
      addCampo("peso_geral", payload.peso_geral);
      addCampo("peso_objetivo", payload.peso_objetivo);
      addCampo("nota_minima_geral", payload.nota_minima_geral);
      addCampo("nota_minima_objetiva", payload.nota_minima_objetiva);
      addCampo("nota_corte", payload.nota_corte);
      addCampo("data_realizacao", payload.data_realizacao);
      addCampo("gabarito_preliminar", payload.gabarito_preliminar !== undefined ? JSON.stringify(payload.gabarito_preliminar) : undefined);
      addCampo("gabarito_definitivo", payload.gabarito_definitivo !== undefined ? JSON.stringify(payload.gabarito_definitivo) : undefined);
      addCampo("respostas_usuario", payload.respostas_usuario !== undefined ? JSON.stringify(payload.respostas_usuario) : undefined);

      if (campos.length === 0) {
        // Nada para atualizar, retorna o registro atual
        return this.obterProvaPorId(provaId);
      }

      valores.push(provaId);

      db.run(
        `UPDATE provas_feitas SET ${campos.join(", ")} WHERE id = ?`,
        valores
      );

      await saveSQLiteToStorage(db);

      return this.obterProvaPorId(provaId);
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

  // Busca uma prova por ID (uso interno)
  async obterProvaPorId(provaId: string): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const db = getSQLite();
      if (!db) throw new Error("SQLite não inicializado.");

      const result = db.exec({
        sql: `SELECT * FROM provas_feitas WHERE id = ?`,
        params: [provaId],
      });

      if (!result || result.length === 0 || result[0].values.length === 0) {
        return { data: null, error: null };
      }

      const row: any = {};
      result[0].columns.forEach((col: string, i: number) => {
        row[col] = result[0].values[0][i];
      });

      return { data: rowToProva(row), error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

  // 4. Excluir prova
  async excluirProvaFeita(provaId: string): Promise<{ error: Error | null }> {
    try {
      const db = getSQLite();
      if (!db) throw new Error("SQLite não inicializado.");

      db.run(`DELETE FROM provas_feitas WHERE id = ?`, [provaId]);
      await saveSQLiteToStorage(db);
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  },

  // 5. Calcular estatísticas
  calcularEstatisticas(prova: ProvaFeita): ProvaFeitaComStats {
    const respostas = prova.respostas_usuario || {};
    const gabPreliminar = prova.gabarito_preliminar || {};
    const gabDefinitivo = prova.gabarito_definitivo || {};

    const questoesNumeros = Object.keys(respostas).map(Number);
    const totalQuestoes = questoesNumeros.length;

    let acertosPreliminar = 0;
    let acertosDefinitivo = 0;

    for (const num of questoesNumeros) {
      const respostaUser = respostas[num];
      if (!respostaUser) continue;

      if (gabPreliminar[num] && gabPreliminar[num] === respostaUser) {
        acertosPreliminar++;
      }
      if (gabDefinitivo[num] && gabDefinitivo[num] === respostaUser) {
        acertosDefinitivo++;
      }
    }

    const notaPreliminar = totalQuestoes > 0 ? (acertosPreliminar / totalQuestoes) * 10 : 0;
    const notaDefinitivo = totalQuestoes > 0 ? (acertosDefinitivo / totalQuestoes) * 10 : 0;

    return {
      ...prova,
      totalQuestoes,
      acertosPreliminar,
      acertosDefinitivo,
      notaPreliminar: Math.round(notaPreliminar * 100) / 100,
      notaDefinitivo: Math.round(notaDefinitivo * 100) / 100,
      aprovadoPreliminar: notaPreliminar >= prova.nota_minima_geral,
      aprovadoDefinitivo: notaDefinitivo >= prova.nota_minima_geral,
    };
  },
};
