import { supabase } from "../services/supabase";
import type { Edital, Disciplina, Topico } from "../types/database";

export interface EditalCompleto extends Edital {
  disciplinas?: DisciplinaCompleta[];
}

export interface DisciplinaCompleta extends Disciplina {
  topicos?: Topico[];
}

export const editaisService = {
  // 1. Listar todos os editais do usuário
  async listarEditais(): Promise<{ data: EditalCompleto[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("editais")
      .select(`
        *,
        disciplinas (
          *,
          topicos (*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error as Error };
    return { data: data as EditalCompleto[], error: null };
  },

  // 2. Criar novo edital
  async criarEdital(payload: {
    titulo: string;
    banca: string;
    orgao?: string;
    ano?: number;
    user_id: string;
  }): Promise<{ data: Edital | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("editais")
      .insert({
        titulo: payload.titulo,
        banca: payload.banca,
        orgao: payload.orgao || null,
        ano: payload.ano || new Date().getFullYear(),
        user_id: payload.user_id,
      })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as Edital, error: null };
  },

  // 3. Excluir edital (cascateia para disciplinas e tópicos)
  async excluirEdital(editalId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("editais").delete().eq("id", editalId);
    return { error: error as Error | null };
  },

  // 4. Adicionar disciplina a um edital
  async criarDisciplina(editalId: string, nome: string): Promise<{ data: Disciplina | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("disciplinas")
      .insert({ edital_id: editalId, nome })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as Disciplina, error: null };
  },

  // 5. Excluir disciplina
  async excluirDisciplina(disciplinaId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("disciplinas").delete().eq("id", disciplinaId);
    return { error: error as Error | null };
  },

  // 6. Adicionar tópico à disciplina
  async criarTopico(payload: {
    disciplinaId: string;
    titulo: string;
    relevanciaBanca: number;
  }): Promise<{ data: Topico | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("topicos")
      .insert({
        disciplina_id: payload.disciplinaId,
        titulo: payload.titulo,
        relevancia_banca: payload.relevanciaBanca,
      })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as Topico, error: null };
  },

  // 7. Excluir tópico
  async excluirTopico(topicoId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("topicos").delete().eq("id", topicoId);
    return { error: error as Error | null };
  },
};
