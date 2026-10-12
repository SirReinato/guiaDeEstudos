import { supabase } from "./supabase";
import type { DesafioCodigo } from "../types/database";

export interface DesafioComTopico extends DesafioCodigo {
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

export const desafiosCodigoService = {
  // 1. Listar desafios cadastrados
  async listarDesafios(topicoId?: string): Promise<{ data: DesafioComTopico[] | null; error: Error | null }> {
    let query = supabase.from("desafios_codigo").select(`
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
    `);

    if (topicoId) {
      query = query.eq("topico_id", topicoId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { data: null, error: error as Error };
    return { data: data as DesafioComTopico[], error: null };
  },

  // 2. Criar novo desafio prático
  async criarDesafio(payload: {
    topicoId?: string | null;
    titulo: string;
    linguagem: "sql" | "python" | "javascript" | "java";
    enunciado: string;
    codigoInicial: string;
    solucaoEsperada?: string;
    dicas?: string[];
  }): Promise<{ data: DesafioCodigo | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("desafios_codigo")
      .insert({
        topico_id: payload.topicoId || null,
        titulo: payload.titulo,
        linguagem: payload.linguagem,
        enunciado: payload.enunciado,
        codigo_inicial: payload.codigoInicial,
        solucao_esperada: payload.solucaoEsperada || null,
        dicas: payload.dicas || [],
      })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as DesafioCodigo, error: null };
  },

  // 3. Excluir desafio
  async excluirDesafio(desafioId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("desafios_codigo").delete().eq("id", desafioId);
    return { error: error as Error | null };
  },
};
