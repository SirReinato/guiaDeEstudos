/**
 * GUIA DE ESTUDOS — Serviço Provas Feitas via localStorage
 * Síncrono, sem WASM, sem inicialização assíncrona. Funciona imediatamente.
 */

import type { ProvaFeita, ProvaFeitaComStats } from "./provasFeitasService";

const STORAGE_KEY = "guia_estudos_provas_feitas";

function gerarUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function lerProvas(userId: string): ProvaFeita[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const todas: ProvaFeita[] = JSON.parse(raw);
    return todas.filter((p) => p.user_id === userId).sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
  } catch {
    return [];
  }
}

function salvarTodas(provas: ProvaFeita[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(provas));
}

export const provasFeitasLocalStorageService = {
  // Inicialização não é necessária, mas mantida para compatibilidade
  async inicializar(): Promise<{ error: Error | null }> {
    return { error: null };
  },

  async listarProvasFeitas(userId: string): Promise<{ data: ProvaFeita[] | null; error: Error | null }> {
    try {
      return { data: lerProvas(userId), error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

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
      const id = gerarUUID();
      const agora = new Date().toISOString();

      const prova: ProvaFeita = {
        id,
        user_id: payload.user_id,
        edital_id: payload.edital_id,
        nome_prova: payload.nome_prova,
        total_questoes: payload.total_questoes,
        questoes_objetivas: payload.questoes_objetivas,
        questoes_gerais: payload.questoes_gerais,
        peso_geral: payload.peso_geral ?? 1,
        peso_objetivo: payload.peso_objetivo ?? 1,
        nota_minima_geral: payload.nota_minima_geral ?? 6,
        nota_minima_objetiva: payload.nota_minima_objetiva ?? 6,
        nota_corte: payload.nota_corte ?? 6,
        data_realizacao: payload.data_realizacao || agora,
        gabarito_preliminar: payload.gabarito_preliminar,
        gabarito_definitivo: payload.gabarito_definitivo,
        respostas_usuario: payload.respostas_usuario,
        created_at: agora,
      };

      const todas = lerProvas(payload.user_id);
      todas.push(prova);
      salvarTodas(todas);

      return { data: prova, error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

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
      const todas = lerProvas(""); // ler todas, depois filtramos
      // Precisamos saber o user_id — vamos ler tudo e encontrar
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { data: null, error: new Error("Prova não encontrada") };

      const todasProvas: ProvaFeita[] = JSON.parse(raw);
      const idx = todasProvas.findIndex((p) => p.id === provaId);
      if (idx === -1) return { data: null, error: new Error("Prova não encontrada") };

      const atualizada: ProvaFeita = {
        ...todasProvas[idx],
        ...(payload.nome_prova !== undefined && { nome_prova: payload.nome_prova }),
        ...(payload.total_questoes !== undefined && { total_questoes: payload.total_questoes }),
        ...(payload.questoes_objetivas !== undefined && { questoes_objetivas: payload.questoes_objetivas }),
        ...(payload.questoes_gerais !== undefined && { questoes_gerais: payload.questoes_gerais }),
        ...(payload.peso_geral !== undefined && { peso_geral: payload.peso_geral }),
        ...(payload.peso_objetivo !== undefined && { peso_objetivo: payload.peso_objetivo }),
        ...(payload.nota_minima_geral !== undefined && { nota_minima_geral: payload.nota_minima_geral }),
        ...(payload.nota_minima_objetiva !== undefined && { nota_minima_objetiva: payload.nota_minima_objetiva }),
        ...(payload.nota_corte !== undefined && { nota_corte: payload.nota_corte }),
        ...(payload.data_realizacao !== undefined && { data_realizacao: payload.data_realizacao }),
        ...(payload.gabarito_preliminar !== undefined && { gabarito_preliminar: payload.gabarito_preliminar }),
        ...(payload.gabarito_definitivo !== undefined && { gabarito_definitivo: payload.gabarito_definitivo }),
        ...(payload.respostas_usuario !== undefined && { respostas_usuario: payload.respostas_usuario }),
      };

      todasProvas[idx] = atualizada;
      salvarTodas(todasProvas);

      return { data: atualizada, error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

  async obterProvaPorId(provaId: string): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { data: null, error: null };
      const todas: ProvaFeita[] = JSON.parse(raw);
      const prova = todas.find((p) => p.id === provaId);
      return { data: prova || null, error: null };
    } catch (err: unknown) {
      return { data: null, error: err as Error };
    }
  },

  async excluirProvaFeita(provaId: string): Promise<{ error: Error | null }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { error: null };
      const todas: ProvaFeita[] = JSON.parse(raw);
      const filtradas = todas.filter((p) => p.id !== provaId);
      salvarTodas(filtradas);
      return { error: null };
    } catch (err: unknown) {
      return { error: err as Error };
    }
  },

  calcularEstatisticas(prova: ProvaFeita): ProvaFeitaComStats {
    const respostas = prova.respostas_usuario || {};
    const gabPreliminar = prova.gabarito_preliminar || {};
    const gabDefinitivo = prova.gabarito_definitivo || {};

    const questoesNumeros = Object.keys(respostas).map(Number);
    const totalQuestoes = questoesNumeros.length;
    const questoesGerais = prova.questoes_gerais || 0;
    const questoesEspecificas = prova.questoes_objetivas || 0;
    const pesoGeral = prova.peso_geral || 1;
    const pesoObjetivo = prova.peso_objetivo || 1;

    let acertosPreliminar = 0;
    let acertosDefinitivo = 0;
    let pontosPreliminar = 0;
    let pontosDefinitivo = 0;

    // Contadores por módulo
    let acertosPreliminarGerais = 0;
    let acertosPreliminarEspecificas = 0;
    let acertosDefinitivoGerais = 0;
    let acertosDefinitivoEspecificas = 0;
    let pontosPreliminarGerais = 0;
    let pontosPreliminarEspecificas = 0;
    let pontosDefinitivoGerais = 0;
    let pontosDefinitivoEspecificas = 0;

    for (const num of questoesNumeros) {
      const respostaUser = respostas[num];
      if (!respostaUser) continue;

      const ehGeral = num <= questoesGerais;
      const pesoQuestao = ehGeral ? pesoGeral : pesoObjetivo;

      // Preliminar
      if (gabPreliminar[num] && gabPreliminar[num] === respostaUser) {
        acertosPreliminar++;
        pontosPreliminar += pesoQuestao;
        if (ehGeral) {
          acertosPreliminarGerais++;
          pontosPreliminarGerais += pesoQuestao;
        } else {
          acertosPreliminarEspecificas++;
          pontosPreliminarEspecificas += pesoQuestao;
        }
      }

      // Definitivo
      if (gabDefinitivo[num] && gabDefinitivo[num] === respostaUser) {
        acertosDefinitivo++;
        pontosDefinitivo += pesoQuestao;
        if (ehGeral) {
          acertosDefinitivoGerais++;
          pontosDefinitivoGerais += pesoQuestao;
        } else {
          acertosDefinitivoEspecificas++;
          pontosDefinitivoEspecificas += pesoQuestao;
        }
      }
    }

    const pontosMaximosGerais = questoesGerais * pesoGeral;
    const pontosMaximosEspecificas = questoesEspecificas * pesoObjetivo;
    const pontosMaximos = pontosMaximosGerais + pontosMaximosEspecificas;

    const notaPreliminar = pontosMaximos > 0 ? (pontosPreliminar / pontosMaximos) * 10 : 0;
    const notaDefinitivo = pontosMaximos > 0 ? (pontosDefinitivo / pontosMaximos) * 10 : 0;

    return {
      ...prova,
      totalQuestoes,
      acertosPreliminar,
      acertosDefinitivo,
      pontosPreliminar: Math.round(pontosPreliminar * 100) / 100,
      pontosDefinitivo: Math.round(pontosDefinitivo * 100) / 100,
      pontosMaximos,
      notaPreliminar: Math.round(notaPreliminar * 100) / 100,
      notaDefinitivo: Math.round(notaDefinitivo * 100) / 100,
      aprovadoPreliminar: pontosPreliminar >= prova.nota_minima_geral,
      aprovadoDefinitivo: pontosDefinitivo >= prova.nota_minima_geral,

      // Detalhes por módulo
      acertosPreliminarGerais,
      acertosPreliminarEspecificas,
      acertosDefinitivoGerais,
      acertosDefinitivoEspecificas,
      pontosPreliminarGerais: Math.round(pontosPreliminarGerais * 100) / 100,
      pontosPreliminarEspecificas: Math.round(pontosPreliminarEspecificas * 100) / 100,
      pontosDefinitivoGerais: Math.round(pontosDefinitivoGerais * 100) / 100,
      pontosDefinitivoEspecificas: Math.round(pontosDefinitivoEspecificas * 100) / 100,
      pontosMaximosGerais,
      pontosMaximosEspecificas,
    };
  },
};
