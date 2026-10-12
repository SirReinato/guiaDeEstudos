import { GoogleGenAI } from "@google/genai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export const geminiAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export const geminiService = {
  temChave(): boolean {
    return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  },

  // 1. Gerar Nova Questão de TI Inédita no Padrão da Banca
  async gerarQuestaoInedita(payload: {
    topico: string;
    banca: string;
    tipo: "multipla_escolha" | "certo_errado";
  }): Promise<{
    enunciado: string;
    alternativas: Array<{ letra: string; texto: string }>;
    respostaCorreta: string;
    explicacaoDetalhada: string;
  } | null> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `Você é um elaborador de questões sênior para concursos públicos de Tecnologia da Informação (TI).
Elabore 1 questão inédita de alto nível técnico sobre o tópico "${payload.topico}", seguindo rigorosamente o estilo da banca "${payload.banca}".
Tipo da questão: ${payload.tipo === "certo_errado" ? "Certo ou Errado (estilo Cebraspe)" : "Múltipla Escolha com alternativas A, B, C, D e E"}.

Responda OBRIGATORIAMENTE em formato JSON válido contendo exatamente as seguintes chaves:
{
  "enunciado": "Texto da questão contextualizada...",
  "alternativas": [
    {"letra": "A", "texto": "Texto..."},
    {"letra": "B", "texto": "Texto..."}
  ],
  "respostaCorreta": "A",
  "explicacaoDetalhada": "Fundamentação completa do gabarito..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return parsed;
    } catch (err) {
      console.error("Erro ao converter JSON do Gemini:", err);
      return null;
    }
  },

  // 2. Corrigir Redação / Discursiva Técnica com Critérios de Concurso
  async avaliarRedacao(payload: {
    tema: string;
    enunciado: string;
    textoCandidato: string;
    padraoResposta: string;
  }): Promise<{
    notaFinal: number; // 0 a 100
    analiseGramatical: string;
    analiseTecnica: string;
    sugestoesMelhoria: string;
  } | null> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `Você é o examinador chefe da banca de um concurso de TI avaliando uma discursiva.
Tema: ${payload.tema}
Enunciado da Prova:
${payload.enunciado}

Padrão de Resposta Esperado:
${payload.padraoResposta}

Texto Redigido pelo Candidato:
${payload.textoCandidato}

Avalie o texto com rigor de banca examinadora e responda OBRIGATORIAMENTE em JSON válido:
{
  "notaFinal": 85,
  "analiseGramatical": "Avaliação de coesão, clareza e norma culta...",
  "analiseTecnica": "Se os conceitos técnicos obrigatórios do espelho foram contemplados...",
  "sugestoesMelhoria": "O que faltou para atingir a nota máxima 100..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const parsed = JSON.parse(response.text || "{}");
      return parsed;
    } catch (err) {
      console.error("Erro ao converter JSON de avaliação:", err);
      return null;
    }
  },
};
