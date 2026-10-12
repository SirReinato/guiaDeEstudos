import { supabase } from "./supabase";
import type { Questao, TeoriaResumo } from "../types/database";

export interface QuestaoComDetalhes extends Questao {
  topicos?: {
    titulo: string;
    disciplina_id: string;
    disciplinas?: {
      nome: string;
      edital_id: string;
    };
  };
}

export const cicloEstudosService = {
  // 1. Obter ou criar resumo teórico de um tópico (Os 30%)
  async obterTeoriaPorTopico(topicoId: string): Promise<{ data: TeoriaResumo | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("teoria_resumos")
      .select("*")
      .eq("topico_id", topicoId)
      .maybeSingle();

    if (error) return { data: null, error: error as Error };
    return { data: data as TeoriaResumo | null, error: null };
  },

  // 2. Salvar resumo teórico
  async salvarTeoria(payload: {
    topicoId: string;
    conteudoMarkdown: string;
    tempoLeituraMin: number;
  }): Promise<{ data: TeoriaResumo | null; error: Error | null }> {
    const { data: existente } = await supabase
      .from("teoria_resumos")
      .select("id")
      .eq("topico_id", payload.topicoId)
      .maybeSingle();

    if (existente) {
      const { data, error } = await supabase
        .from("teoria_resumos")
        .update({
          conteudo_markdown: payload.conteudoMarkdown,
          tempo_leitura_estimado_min: payload.tempoLeituraMin,
        })
        .eq("id", existente.id)
        .select()
        .single();
      return { data: data as TeoriaResumo, error: error as Error | null };
    } else {
      const { data, error } = await supabase
        .from("teoria_resumos")
        .insert({
          topico_id: payload.topicoId,
          conteudo_markdown: payload.conteudoMarkdown,
          tempo_leitura_estimado_min: payload.tempoLeituraMin,
        })
        .select()
        .single();
      return { data: data as TeoriaResumo, error: error as Error | null };
    }
  },

  // 3. Listar questões de um tópico ou gerais (Os 70%)
  async listarQuestoes(topicoId?: string): Promise<{ data: QuestaoComDetalhes[] | null; error: Error | null }> {
    let query = supabase.from("questoes").select(`
      *,
      topicos (
        titulo,
        disciplina_id,
        disciplinas (
          nome,
          edital_id
        )
      )
    `);

    if (topicoId) {
      query = query.eq("topico_id", topicoId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { data: null, error: error as Error };
    return { data: data as QuestaoComDetalhes[], error: null };
  },

  // 4. Criar nova questão de concurso
  async criarQuestao(payload: {
    topicoId: string;
    enunciado: string;
    tipo: "multipla_escolha" | "certo_errado";
    alternativas: Array<{ letra: string; texto: string; justificativa?: string }>;
    respostaCorreta: string;
    explicacaoDetalhada: string;
    bancaOrigem?: string;
    anoOrigem?: number;
  }): Promise<{ data: Questao | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("questoes")
      .insert({
        topico_id: payload.topicoId,
        enunciado: payload.enunciado,
        tipo: payload.tipo,
        alternativas: payload.alternativas,
        resposta_correta: payload.respostaCorreta,
        explicacao_detalhada: payload.explicacaoDetalhada,
        banca_origem: payload.bancaOrigem || "Inédita IA / Banca",
        ano_origem: payload.anoOrigem || new Date().getFullYear(),
      })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as Questao, error: null };
  },

  // 5. Excluir questão
  async excluirQuestao(questaoId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("questoes").delete().eq("id", questaoId);
    return { error: error as Error | null };
  },
};
