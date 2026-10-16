import { supabase } from "./supabase";
import type { ProvaFeita } from "../types/database";

export interface ProvaFeitaComStats extends ProvaFeita {
  totalQuestoes?: number;
  acertosPreliminar?: number;
  acertosDefinitivo?: number;
  pontosPreliminar?: number;
  pontosDefinitivo?: number;
  pontosMaximos?: number;
  notaPreliminar?: number;
  notaDefinitivo?: number;
  aprovadoPreliminar?: boolean;
  aprovadoDefinitivo?: boolean;

  acertosPreliminarGerais?: number;
  acertosPreliminarEspecificas?: number;
  acertosDefinitivoGerais?: number;
  acertosDefinitivoEspecificas?: number;
  pontosPreliminarGerais?: number;
  pontosPreliminarEspecificas?: number;
  pontosDefinitivoGerais?: number;
  pontosDefinitivoEspecificas?: number;
  pontosMaximosGerais?: number;
  pontosMaximosEspecificas?: number;
}

const STORAGE_KEY = "guia_estudos_provas_feitas";

function gerarUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function lerLocalStorage(): ProvaFeita[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function salvarLocalStorage(provas: ProvaFeita[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(provas));
  } catch {
    // ignorar se storage cheio
  }
}

async function supabaseListar(userId: string): Promise<ProvaFeita[] | null> {
  const { data, error } = await supabase
    .from("provas_feitas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return null;
  return (data || []) as ProvaFeita[];
}

async function supabaseCriar(payload: {
  nome_prova: string; total_questoes: number; questoes_objetivas: number;
  questoes_gerais: number; user_id: string; edital_id?: string;
  peso_geral?: number; peso_objetivo?: number; nota_minima_geral?: number;
  nota_minima_objetiva?: number; nota_corte?: number; data_realizacao?: string;
  gabarito_preliminar?: Record<number, string>;
  gabarito_definitivo?: Record<number, string>;
  respostas_usuario?: Record<number, string>;
}): Promise<ProvaFeita | null> {
  const { data, error } = await supabase
    .from("provas_feitas")
    .insert({
      nome_prova: payload.nome_prova,
      total_questoes: payload.total_questoes,
      questoes_objetivas: payload.questoes_objetivas,
      questoes_gerais: payload.questoes_gerais,
      edital_id: payload.edital_id || null,
      peso_geral: payload.peso_geral ?? 1,
      peso_objetivo: payload.peso_objetivo ?? 1,
      nota_minima_geral: payload.nota_minima_geral ?? 6,
      nota_minima_objetiva: payload.nota_minima_objetiva ?? 6,
      nota_corte: payload.nota_corte ?? 6,
      data_realizacao: payload.data_realizacao || new Date().toISOString(),
      user_id: payload.user_id,
      gabarito_preliminar: payload.gabarito_preliminar || null,
      gabarito_definitivo: payload.gabarito_definitivo || null,
      respostas_usuario: payload.respostas_usuario || null,
    })
    .select()
    .single();
  if (error) return null;
  return data as ProvaFeita;
}

async function supabaseAtualizar(provaId: string, payload: Record<string, unknown>): Promise<ProvaFeita | null> {
  const { data, error } = await supabase
    .from("provas_feitas")
    .update(payload)
    .eq("id", provaId)
    .select()
    .single();
  if (error) return null;
  return data as ProvaFeita;
}

async function supabaseExcluir(provaId: string): Promise<boolean> {
  const { error } = await supabase.from("provas_feitas").delete().eq("id", provaId);
  return !error;
}

async function supabaseObter(provaId: string): Promise<ProvaFeita | null> {
  const { data, error } = await supabase.from("provas_feitas").select("*").eq("id", provaId).single();
  if (error) return null;
  return data as ProvaFeita;
}

function calcularEstatisticas(prova: ProvaFeita): ProvaFeitaComStats {
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
}

export const provasFeitasService = {
  async inicializar(): Promise<{ error: Error | null }> {
    return { error: null };
  },

  async listarProvasFeitas(userId: string): Promise<{ data: ProvaFeita[] | null; error: Error | null }> {
    try {
      const supabaseData = await supabaseListar(userId);
      if (supabaseData) {
        return { data: supabaseData, error: null };
      }
    } catch {
      // fallback para localStorage
    }
    const localData = lerLocalStorage().filter((p) => p.user_id === userId);
    localData.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { data: localData, error: null };
  },

  async criarProvaFeita(payload: {
    nome_prova: string; total_questoes: number; questoes_objetivas: number;
    questoes_gerais: number; user_id: string; edital_id?: string;
    peso_geral?: number; peso_objetivo?: number; nota_minima_geral?: number;
    nota_minima_objetiva?: number; nota_corte?: number; data_realizacao?: string;
    gabarito_preliminar?: Record<number, string>;
    gabarito_definitivo?: Record<number, string>;
    respostas_usuario?: Record<number, string>;
  }): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const supabaseData = await supabaseCriar(payload);
      if (supabaseData) return { data: supabaseData, error: null };
    } catch {
      // fallback
    }

    const id = gerarUUID();
    const agora = new Date().toISOString();
    const prova: ProvaFeita = {
      id, user_id: payload.user_id, edital_id: payload.edital_id,
      nome_prova: payload.nome_prova, total_questoes: payload.total_questoes,
      questoes_objetivas: payload.questoes_objetivas, questoes_gerais: payload.questoes_gerais,
      peso_geral: payload.peso_geral ?? 1, peso_objetivo: payload.peso_objetivo ?? 1,
      nota_minima_geral: payload.nota_minima_geral ?? 6,
      nota_minima_objetiva: payload.nota_minima_objetiva ?? 6,
      nota_corte: payload.nota_corte ?? 6,
      data_realizacao: payload.data_realizacao || agora,
      gabarito_preliminar: payload.gabarito_preliminar,
      gabarito_definitivo: payload.gabarito_definitivo,
      respostas_usuario: payload.respostas_usuario,
      created_at: agora,
    };
    const todas = lerLocalStorage();
    todas.push(prova);
    salvarLocalStorage(todas);
    return { data: prova, error: null };
  },

  async atualizarProvaFeita(provaId: string, payload: {
    nome_prova?: string; total_questoes?: number; questoes_objetivas?: number;
    questoes_gerais?: number; peso_geral?: number; peso_objetivo?: number;
    nota_minima_geral?: number; nota_minima_objetiva?: number; nota_corte?: number;
    data_realizacao?: string; gabarito_preliminar?: Record<number, string>;
    gabarito_definitivo?: Record<number, string>;
    respostas_usuario?: Record<number, string>;
  }): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const supabaseData = await supabaseAtualizar(provaId, {
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
      });
      if (supabaseData) return { data: supabaseData, error: null };
    } catch {
      // fallback
    }

    const todas = lerLocalStorage();
    const idx = todas.findIndex((p) => p.id === provaId);
    if (idx === -1) return { data: null, error: new Error("Prova não encontrada") };

    const atualizada: ProvaFeita = {
      ...todas[idx],
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
    todas[idx] = atualizada;
    salvarLocalStorage(todas);
    return { data: atualizada, error: null };
  },

  async excluirProvaFeita(provaId: string): Promise<{ error: Error | null }> {
    try {
      const ok = await supabaseExcluir(provaId);
      if (ok) return { error: null };
    } catch {
      // fallback
    }
    const todas = lerLocalStorage();
    const filtradas = todas.filter((p) => p.id !== provaId);
    salvarLocalStorage(filtradas);
    return { error: null };
  },

  async obterProvaPorId(provaId: string): Promise<{ data: ProvaFeita | null; error: Error | null }> {
    try {
      const supabaseData = await supabaseObter(provaId);
      if (supabaseData) return { data: supabaseData, error: null };
    } catch {
      // fallback
    }
    const todas = lerLocalStorage();
    const prova = todas.find((p) => p.id === provaId);
    return { data: prova || null, error: null };
  },

  calcularEstatisticas,
};