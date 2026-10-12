import { GoogleGenAI } from "@google/genai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export const geminiAI = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// Função auxiliar com Retry Exponencial e Fallback para contornar instabilidades e 503 (High Demand)
async function chamarGeminiComRetry(ai: GoogleGenAI, config: any, maxTentativas = 3) {
  let tentativa = 0;
  let ultimoErro: any = null;

  while (tentativa < maxTentativas) {
    try {
      return await ai.models.generateContent(config);
    } catch (err: any) {
      ultimoErro = err;
      const is503 = err?.message?.includes("503") || err?.message?.includes("high demand") || err?.message?.includes("UNAVAILABLE");

      if (is503 && tentativa < maxTentativas - 1) {
        tentativa++;
        const esperaMs = tentativa * 1800; // Aguarda 1.8s, 3.6s
        console.warn(`⚠️ Servidor do Gemini ocupado (503). Tentando novamente em ${esperaMs}ms (Tentativa ${tentativa + 1}/${maxTentativas})...`);
        await new Promise((resolve) => setTimeout(resolve, esperaMs));
      } else {
        throw err;
      }
    }
  }
  throw ultimoErro;
}

export const geminiService = {
  temChave(): boolean {
    return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  },

  // 0. Dissecação Automática do Edital (Extração de Disciplinas e Tópicos com pesos)
  async dissecarEditalComIA(textoEdital: string): Promise<{
    disciplinas: Array<{
      nome: string;
      topicos: Array<{
        titulo: string;
        relevancia_banca: number; // 1 a 5
      }>;
    }>;
  } | null> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });

    // Enviar trecho mais focado do conteúdo programático (15.000 chars) para evitar timeout
    const trechoOtimizado = textoEdital.slice(0, 15000);

    const prompt = `Você é um especialista em análise de editais de concursos públicos de Tecnologia da Informação (TI).
Analise o conteúdo programático do edital abaixo.
Extraia as Disciplinas principais e os Tópicos correspondentes.
Para cada tópico, estime a 'relevancia_banca' de 1 a 5 (onde 5 é tema de altíssima incidência nas provas e 1 é tema raro).

Conteúdo Programático:
"""
${trechoOtimizado}
"""

Responda OBRIGATORIAMENTE em JSON válido com esta estrutura exata:
{
  "disciplinas": [
    {
      "nome": "Nome da Disciplina",
      "topicos": [
        {
          "titulo": "Título do Tópico",
          "relevancia_banca": 5
        }
      ]
    }
  ]
}`;

    const response = await chamarGeminiComRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.error("Erro ao converter JSON do edital:", err);
      return null;
    }
  },

  // 0.1 Análise de Provas Anteriores
  async analisarProvasAnteriores(textoProvas: string, disciplinasAtuais: string[]): Promise<{
    topicosMaisCobrados: string[];
    recomendacoesEstudo: string;
    novosTopicosDetectados?: Array<{ disciplina: string; topico: string; relevancia: number }>;
  } | null> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `Você é um analista de bancas de concurso de TI.
Analise o texto das provas anteriores fornecido abaixo, considerando as seguintes disciplinas do edital:
${disciplinasAtuais.join(", ")}

Texto das Provas Anteriores:
"""
${textoProvas.slice(0, 15000)}
"""

Identifique o padrão de cobrança da banca, os temas com maior repetição de pegadinhas e gere recomendações práticas de estudo.
Responda OBRIGATORIAMENTE em JSON:
{
  "topicosMaisCobrados": ["Tópico 1", "Tópico 2"],
  "recomendacoesEstudo": "Análise estratégica do perfil da banca e pegadinhas...",
  "novosTopicosDetectados": [
    {"disciplina": "Banco de Dados", "topico": "Window Functions", "relevancia": 5}
  ]
}`;

    const response = await chamarGeminiComRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.error("Erro ao converter JSON de provas:", err);
      return null;
    }
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

Responda OBRIGATORIAMENTE em formato JSON válido:
{
  "enunciado": "Texto da questão contextualizada...",
  "alternativas": [
    {"letra": "A", "texto": "Texto..."},
    {"letra": "B", "texto": "Texto..."}
  ],
  "respostaCorreta": "A",
  "explicacaoDetalhada": "Fundamentação completa do gabarito..."
}`;

    const response = await chamarGeminiComRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.error("Erro ao converter JSON do Gemini:", err);
      return null;
    }
  },

  // 2. Corrigir Redação / Discursiva Técnica
  async avaliarRedacao(payload: {
    tema: string;
    enunciado: string;
    textoCandidato: string;
    padraoResposta: string;
  }): Promise<{
    notaFinal: number;
    analiseGramatical: string;
    analiseTecnica: string;
    sugestoesMelhoria: string;
  } | null> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });

    const prompt = `Você é o examinador chefe da banca de um concurso de TI avaliando uma discursiva.
Tema: ${payload.tema}
Enunciado: ${payload.enunciado}
Padrão de Resposta: ${payload.padraoResposta}
Texto do Candidato: ${payload.textoCandidato}

Responda OBRIGATORIAMENTE em JSON válido:
{
  "notaFinal": 85,
  "analiseGramatical": "Avaliação...",
  "analiseTecnica": "Avaliação...",
  "sugestoesMelhoria": "Sugestões..."
}`;

    const response = await chamarGeminiComRetry(ai, {
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (err) {
      console.error("Erro ao converter JSON de avaliação:", err);
      return null;
    }
  },
};
