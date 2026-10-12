import { supabase } from "./supabase";
import type { TemaRedacao } from "../types/database";

export interface TemaRedacaoComDetalhes extends TemaRedacao {
  topicos?: {
    titulo: string;
    disciplinas?: {
      nome: string;
      editais?: {
        titulo: string;
      };
    };
  };
}

export interface SubmissaoRedacao {
  id: string;
  user_id: string;
  tema_id: string;
  texto: string;
  total_linhas: number;
  total_palavras: number;
  nota_estimada?: number;
  feedback?: string;
  created_at: string;
}

export const redacoesService = {
  // 1. Listar temas de discursivas cadastrados
  async listarTemas(): Promise<{ data: TemaRedacaoComDetalhes[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("temas_redacao")
      .select(`
        *,
        topicos (
          titulo,
          disciplinas (
            nome,
            editais (
              titulo
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error as Error };
    return { data: data as TemaRedacaoComDetalhes[], error: null };
  },

  // 2. Criar novo tema de redação
  async criarTema(payload: {
    topicoId?: string | null;
    titulo: string;
    enunciado: string;
    limiteLinhas: number;
    padraoResposta: string;
  }): Promise<{ data: TemaRedacao | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("temas_redacao")
      .insert({
        topico_id: payload.topicoId || null,
        titulo: payload.titulo,
        enunciado: payload.enunciado,
        limite_linhas: payload.limiteLinhas || 30,
        padrao_resposta: payload.padraoResposta,
      })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as TemaRedacao, error: null };
  },

  // 3. Excluir tema
  async excluirTema(temaId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("temas_redacao").delete().eq("id", temaId);
    return { error: error as Error | null };
  },
};
