import { supabase } from "./supabase";
import type { Flashcard, DailyStreak } from "../types/database";
import { calcularSM2 } from "../utils/sm2";

export interface FlashcardComTopico extends Flashcard {
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

export const flashcardsService = {
  // 1. Listar flashcards pendentes de revisão hoje ou no total
  async listarFlashcards(userId: string): Promise<{ data: FlashcardComTopico[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("flashcards")
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
      .eq("user_id", userId)
      .order("proxima_revisao", { ascending: true });

    if (error) return { data: null, error: error as Error };
    return { data: data as FlashcardComTopico[], error: null };
  },

  // 2. Criar novo flashcard
  async criarFlashcard(payload: {
    userId: string;
    topicoId?: string | null;
    frente: string;
    verso: string;
  }): Promise<{ data: Flashcard | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: payload.userId,
        topico_id: payload.topicoId || null,
        frente: payload.frente,
        verso: payload.verso,
        intervalo_dias: 1,
        fator_facilidade: 2.5,
        repeticoes: 0,
        proxima_revisao: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { data: null, error: error as Error };
    return { data: data as Flashcard, error: null };
  },

  // 3. Registrar revisão de flashcard aplicando SM-2
  async responderFlashcard(
    card: Flashcard,
    qualidade: 0 | 3 | 4 | 5
  ): Promise<{ error: Error | null }> {
    const resultado = calcularSM2({
      repeticoes: card.repeticoes || 0,
      intervaloDias: Number(card.intervalo_dias) || 1,
      fatorFacilidade: Number(card.fator_facilidade) || 2.5,
      qualidade,
    });

    const { error } = await supabase
      .from("flashcards")
      .update({
        repeticoes: resultado.novasRepeticoes,
        intervalo_dias: resultado.novoIntervaloDias,
        fator_facilidade: resultado.novoFatorFacilidade,
        proxima_revisao: resultado.proximaRevisaoData.toISOString(),
      })
      .eq("id", card.id);

    if (error) return { error: error as Error };

    // Incrementar streak diário
    await flashcardsService.incrementarStreak(card.user_id);
    return { error: null };
  },

  // 4. Excluir flashcard
  async excluirFlashcard(cardId: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.from("flashcards").delete().eq("id", cardId);
    return { error: error as Error | null };
  },

  // 5. Obter ou atualizar streak diário
  async obterStreak(userId: string): Promise<{ data: DailyStreak | null; error: Error | null }> {
    const hoje = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_streaks")
      .select("*")
      .eq("user_id", userId)
      .eq("data", hoje)
      .maybeSingle();

    if (error) return { data: null, error: error as Error };
    return { data: data as DailyStreak | null, error: null };
  },

  // 6. Incrementar contador diário
  async incrementarStreak(userId: string): Promise<void> {
    const hoje = new Date().toISOString().split("T")[0];
    const META_DIARIA = 5; // Mínimo de 5 cards diários para manter o streak ativo

    const { data: atual } = await supabase
      .from("daily_streaks")
      .select("*")
      .eq("user_id", userId)
      .eq("data", hoje)
      .maybeSingle();

    if (atual) {
      const novoTotal = (atual.cards_revisados || 0) + 1;
      const concluido = novoTotal >= META_DIARIA;
      await supabase
        .from("daily_streaks")
        .update({
          cards_revisados: novoTotal,
          meta_concluida: concluido,
        })
        .eq("id", atual.id);
    } else {
      await supabase.from("daily_streaks").insert({
        user_id: userId,
        data: hoje,
        cards_revisados: 1,
        questoes_resolvidas: 0,
        meta_concluida: false,
        streak_dias: 1,
      });
    }
  },
};
