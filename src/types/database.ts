export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  role: "admin" | "user";
  status: "active" | "pending" | "rejected";
  created_at: string;
}

export interface Edital {
  id: string;
  user_id: string;
  titulo: string;
  banca: string;
  orgao?: string;
  ano?: number;
  arquivo_edital_url?: string;
  created_at: string;
}

export interface Disciplina {
  id: string;
  edital_id: string;
  nome: string;
  created_at: string;
}

export interface Topico {
  id: string;
  disciplina_id: string;
  titulo: string;
  relevancia_banca: number; // 1 a 5
  created_at: string;
}

export interface TeoriaResumo {
  id: string;
  topico_id: string;
  conteudo_markdown: string;
  tempo_leitura_estimado_min: number;
  created_at: string;
}

export type TipoQuestao = "multipla_escolha" | "certo_errado";

export interface AlternativaItem {
  letra: string;
  texto: string;
  justificativa?: string;
}

export interface Questao {
  id: string;
  topico_id: string;
  enunciado: string;
  tipo: TipoQuestao;
  alternativas: AlternativaItem[];
  resposta_correta: string;
  explicacao_detalhada: string;
  banca_origem?: string;
  ano_origem?: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  topico_id: string;
  user_id: string;
  frente: string;
  verso: string;
  intervalo_dias: number;
  fator_facilidade: number;
  repeticoes: number;
  proxima_revisao: string;
  created_at: string;
}

export interface DesafioCodigo {
  id: string;
  topico_id: string;
  titulo: string;
  linguagem: "sql" | "python" | "javascript" | "java";
  enunciado: string;
  codigo_inicial: string;
  solucao_esperada?: string;
  dicas?: string[];
  created_at: string;
}

export interface TemaRedacao {
  id: string;
  topico_id: string;
  titulo: string;
  enunciado: string;
  limite_linhas: number;
  padrao_resposta: string;
  created_at: string;
}

export interface DailyStreak {
  id: string;
  user_id: string;
  data: string;
  cards_revisados: number;
  questoes_resolvidas: number;
  meta_concluida: boolean;
  streak_dias: number;
}

export interface ProvaFeita {
  id: string;
  user_id: string;
  edital_id?: string;
  nome_prova: string;
  total_questoes: number;           // total de questões da prova
  questoes_objetivas: number;       // quantas são objetivas
  questoes_gerais: number;          // quantas são de conhecimentos gerais
  peso_geral: number;               // peso da prova no cálculo geral (ex: 1 a 10)
  peso_objetivo: number;            // peso da parte objetiva (ex: 1 a 10)
  nota_minima_geral: number;        // nota mínima para aprovação geral (calculada)
  nota_minima_objetiva: number;     // nota mínima para aprovação objetiva (calculada)
  nota_corte: number;               // nota mínima de corte da prova
  data_realizacao: string;
  gabarito_preliminar?: Record<number, string>; // questão -> alternativa (A/B/C/D/E)
  gabarito_definitivo?: Record<number, string>;  // questão -> alternativa (A/B/C/D/E)
  respostas_usuario?: Record<number, string>;    // questão -> alternativa marcada pelo usuário
  created_at: string;
}
