/**
 * Algoritmo de Repetição Espaçada SuperMemo-2 (SM-2 adaptado)
 * 
 * Avaliações:
 * 0: Errei (Blackout total)
 * 3: Difícil (Lembrei com muito esforço)
 * 4: Bom (Lembrei com hesitação leve)
 * 5: Fácil (Lembrei imediatamente com clareza)
 */

export interface SM2Input {
  repeticoes: number;       // Quantas vezes o card foi revisado com sucesso consecutivamente
  intervaloDias: number;    // Intervalo atual em dias
  fatorFacilidade: number;  // Multiplicador de facilidade (padrão inicial: 2.5)
  qualidade: 0 | 3 | 4 | 5; // Avaliação do usuário
}

export interface SM2Output {
  novasRepeticoes: number;
  novoIntervaloDias: number;
  novoFatorFacilidade: number;
  proximaRevisaoData: Date;
}

export const calcularSM2 = ({
  repeticoes,
  intervaloDias,
  fatorFacilidade,
  qualidade,
}: SM2Input): SM2Output => {
  let novasRepeticoes = repeticoes;
  let novoIntervaloDias = intervaloDias;
  let novoFatorFacilidade = fatorFacilidade;

  // Se o aluno errou (qualidade < 3), reseta o ciclo para reforço imediato
  if (qualidade < 3) {
    novasRepeticoes = 0;
    novoIntervaloDias = 1; // Revisar amanhã
  } else {
    // Acertou (qualidade >= 3)
    if (novasRepeticoes === 0) {
      novoIntervaloDias = 1;
    } else if (novasRepeticoes === 1) {
      novoIntervaloDias = qualidade === 5 ? 4 : 2; // Fácil avança mais
    } else {
      novoIntervaloDias = Math.round(intervaloDias * fatorFacilidade);
    }
    novasRepeticoes += 1;
  }

  // Fórmula original de atualização do Ease Factor (EF) do SM-2:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02);
  novoFatorFacilidade = Math.max(1.3, Number((fatorFacilidade + deltaEF).toFixed(2)));

  // Calcular data da próxima revisão somando novoIntervaloDias à data atual
  const proximaRevisaoData = new Date();
  proximaRevisaoData.setDate(proximaRevisaoData.getDate() + novoIntervaloDias);

  return {
    novasRepeticoes,
    novoIntervaloDias,
    novoFatorFacilidade,
    proximaRevisaoData,
  };
};
