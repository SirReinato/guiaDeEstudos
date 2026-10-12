import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  BadgeStl,
  DividerGradienteStl,
} from "../theme/theme";
import {
  cicloEstudosService,
  type QuestaoComDetalhes,
} from "../services/cicloEstudosService";
import { geminiService } from "../services/geminiService";
import { useEdital } from "../contexts/EditalContext";
import type { EditalCompleto } from "../services/editaisService";
import type { TeoriaResumo } from "../types/database";

const LayoutCicloStl = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SeletorTopicoBarStl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: linear-gradient(135deg, rgba(31, 21, 12, 0.9) 0%, rgba(15, 10, 5, 0.95) 100%);
  border: 1px solid rgba(225, 220, 201, 0.15);
  padding: 1.15rem 1.4rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

const SelectStl = styled.select`
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: 1px solid ${theme.colors.ambarQueimado};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.mm};
  box-sizing: border-box;
  min-width: 280px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:focus {
    border-color: ${theme.colors.marfim};
    box-shadow: 0 0 10px rgba(225, 220, 201, 0.2);
  }
`;

const Divisao3070ContainerStl = styled.div`
  display: grid;
  grid-template-columns: 38% 62%;
  gap: 1.25rem;
  width: 100%;

  @media (max-width: ${theme.breakpoints.notebook}) {
    grid-template-columns: 1fr;
  }
`;

const PainelTeoriaStl = styled.div`
  background: linear-gradient(135deg, rgba(31, 21, 12, 0.85) 0%, rgba(15, 10, 5, 0.95) 100%);
  border: 1px solid rgba(225, 220, 201, 0.12);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 800px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
`;

const ConteudoTeoriaRenderStl = styled.div`
  line-height: 1.7;
  font-size: 0.95rem;
  color: ${theme.colors.textos.claroPrincipal};

  h3 {
    font-family: ${theme.fontsFamily.titulos};
    color: ${theme.colors.marfim};
    margin: 1.2rem 0 0.5rem;
    font-size: 1.15rem;
  }

  p {
    margin-bottom: 0.85rem;
    color: rgba(225, 220, 201, 0.9);
  }

  ul {
    padding-left: 1.25rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.35rem;
  }

  strong {
    color: ${theme.colors.marfim};
    font-weight: 700;
  }

  code {
    background-color: ${theme.colors.preto};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: ${theme.fontsFamily.codigo};
    font-size: 0.85rem;
    border: 1px solid rgba(225, 220, 201, 0.2);
  }
`;

const PegadinhaBancaBoxStl = styled.div`
  background-color: rgba(255, 183, 77, 0.12);
  border-left: 4px solid #ffb74d;
  padding: 0.85rem 1rem;
  border-radius: 0 8px 8px 0;
  margin: 1rem 0;
  font-size: 0.9rem;
`;

const PainelQuestoesStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const QuestaoCardStl = styled.div`
  background: linear-gradient(135deg, rgba(31, 21, 12, 0.85) 0%, rgba(15, 10, 5, 0.95) 100%);
  border: 1px solid rgba(225, 220, 201, 0.12);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: rgba(225, 220, 201, 0.25);
  }
`;

const AlternativaBotaoStl = styled.button<{
  $selecionada: boolean;
  $revelada: boolean;
  $correta: boolean;
}>`
  width: 100%;
  text-align: left;
  padding: 0.95rem 1.15rem;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  background-color: ${(props) => {
    if (!props.$revelada) {
      return props.$selecionada ? "rgba(65, 45, 21, 0.85)" : "rgba(0, 0, 0, 0.5)";
    }
    if (props.$correta) return "rgba(40, 160, 80, 0.25)";
    if (props.$selecionada && !props.$correta) return "rgba(220, 50, 50, 0.25)";
    return "rgba(0, 0, 0, 0.5)";
  }};

  border: 1px solid
    ${(props) => {
      if (!props.$revelada) {
        return props.$selecionada ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)";
      }
      if (props.$correta) return "#81C784";
      if (props.$selecionada && !props.$correta) return "#E57373";
      return "rgba(225, 220, 201, 0.1)";
    }};

  color: ${theme.colors.textos.claroPrincipal};
  box-shadow: ${(props) =>
    props.$selecionada && !props.$revelada
      ? "0 4px 15px rgba(65, 45, 21, 0.6)"
      : "none"};

  &:hover {
    border-color: ${theme.colors.marfim};
    transform: ${(props) => (!props.$revelada ? "translateY(-1px)" : "none")};
  }
`;

const ComentarioGabaritoStl = styled.div<{ $acertou: boolean }>`
  background-color: ${(props) =>
    props.$acertou ? "rgba(40, 160, 80, 0.15)" : "rgba(220, 50, 50, 0.15)"};
  border: 1px solid ${(props) => (props.$acertou ? "#81C784" : "#E57373")};
  border-radius: 10px;
  padding: 1.25rem;
  margin-top: 0.5rem;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface Props {
  editalAtivo?: EditalCompleto | null;
}

export const CicloEstudos3070: React.FC<Props> = ({ editalAtivo: propEditalAtivo }) => {
  const { editalAtivo: ctxEditalAtivo } = useEdital();
  const editalAtivo = propEditalAtivo !== undefined ? propEditalAtivo : ctxEditalAtivo;

  // Lista todos os tópicos disponíveis no edital ativo
  const topicosDisponiveis =
    editalAtivo?.disciplinas?.flatMap((d) =>
      (d.topicos || []).map((t) => ({ ...t, disciplinaNome: d.nome }))
    ) || [];

  const [topicoSelecionadoId, setTopicoSelecionadoId] = useState<string>("");
  const [teoria, setTeoria] = useState<TeoriaResumo | null>(null);
  const [questoes, setQuestoes] = useState<QuestaoComDetalhes[]>([]);
  const [respostasUsuario, setRespostasUsuario] = useState<{ [questaoId: string]: string }>({});
  const [questoesReveladas, setQuestoesReveladas] = useState<{ [questaoId: string]: boolean }>({});
  const [placar, setPlacar] = useState<{ acertos: number; total: number }>({ acertos: 0, total: 0 });

  // Sincroniza seleção de tópico quando muda o edital ativo
  useEffect(() => {
    if (topicosDisponiveis.length > 0) {
      const existeNoEdital = topicosDisponiveis.some((t) => t.id === topicoSelecionadoId);
      if (!existeNoEdital) {
        setTopicoSelecionadoId(topicosDisponiveis[0].id);
      }
    } else {
      setTopicoSelecionadoId("");
      setTeoria(null);
      setQuestoes([]);
    }
  }, [topicosDisponiveis, topicoSelecionadoId]);

  // Carregar Teoria e Questões ao mudar o tópico
  useEffect(() => {
    if (!topicoSelecionadoId) return;

    const carregar = async () => {
      // 1. Carregar Teoria (30%)
      const { data: teoriaData } = await cicloEstudosService.obterTeoriaPorTopico(topicoSelecionadoId);
      setTeoria(teoriaData);

      // 2. Carregar Questões (70%)
      const { data: questoesData } = await cicloEstudosService.listarQuestoes(topicoSelecionadoId);
      setQuestoes(questoesData || []);

      // Resetar respostas e placar
      setRespostasUsuario({});
      setQuestoesReveladas({});
      setPlacar({ acertos: 0, total: 0 });
    };

    carregar();
  }, [topicoSelecionadoId]);

  // Semear exemplo de teoria e questões caso o banco esteja vazio para aquele tópico
  const handleSemearCicloDemonstracao = async () => {
    if (!topicoSelecionadoId) return;

    // 1. Teoria de demonstração
    await cicloEstudosService.salvarTeoria({
      topicoId: topicoSelecionadoId,
      tempoLeituraMin: 4,
      conteudoMarkdown: `
### 📌 Síntese Essencial: Modelagem e Normalização
A **Normalização de Dados** tem como objetivo eliminar anomalias de inserção, atualização e exclusão, além de minimizar a redundância.

* **1FN (Primeira Forma Normal):** Exige atributos atômicos (indivisíveis), sem grupos repetitivos ou vetores/tabelas aninhadas.
* **2FN (Segunda Forma Normal):** Deve estar na 1FN e **não possuir dependência funcional parcial**. Todos os atributos não-chave devem depender da totalidade da Chave Primária (relevante apenas para chaves compostas!).
* **3FN (Terceira Forma Normal):** Deve estar na 2FN e **não possuir dependência transitiva**. Nenhum atributo não-chave pode depender de outro atributo não-chave.
* **FNBC (Boyce-Codd):** Caso especial estrito da 3FN: todo determinante deve ser uma superchave candidata.
      `,
    });

    // 2. Questão Múltipla Escolha (FGV)
    await cicloEstudosService.criarQuestao({
      topicoId: topicoSelecionadoId,
      tipo: "multipla_escolha",
      bancaOrigem: "FGV",
      anoOrigem: 2025,
      enunciado:
        "Considere uma relação R(A, B, C, D) em que {A, B} é a chave primária composta. Sabe-se que a dependência funcional B -> C existe nessa tabela. Em qual Forma Normal a relação R se encontra no máximo?",
      respostaCorreta: "A",
      alternativas: [
        {
          letra: "A",
          texto: "Na 1FN, pois viola a 2FN devido à dependência parcial do atributo C em relação à parte da chave primária (B).",
        },
        {
          letra: "B",
          texto: "Na 2FN, pois a 2FN permite que atributos não-chave dependam de partes da chave.",
        },
        {
          letra: "C",
          texto: "Na 3FN, visto que não há dependência funcional transitiva demonstrada.",
        },
        {
          letra: "D",
          texto: "Na Forma Normal de Boyce-Codd (FNBC).",
        },
      ],
      explicacaoDetalhada:
        "GABARITO: A. Como a chave primária é composta {A, B} e o atributo não-chave C depende apenas de B (parte da chave), temos uma DEPENDÊNCIA PARCIAL. A 2FN proíbe dependências parciais. Logo, a tabela está apenas na 1FN.",
    });

    // 3. Questão Certo/Errado (Cebraspe)
    await cicloEstudosService.criarQuestao({
      topicoId: topicoSelecionadoId,
      tipo: "certo_errado",
      bancaOrigem: "Cebraspe",
      anoOrigem: 2026,
      enunciado:
        "Julgue o item a seguir: Uma relação que possui chave primária simples (composta por um único atributo) e já se encontra na 1FN estará automaticamente e obrigatoriamente na 2FN.",
      respostaCorreta: "Certo",
      alternativas: [
        { letra: "Certo", texto: "Certo" },
        { letra: "Errado", texto: "Errado" },
      ],
      explicacaoDetalhada:
        "GABARITO: CERTO. A 2FN proíbe a dependência parcial da chave primária. Como a chave primária é simples (possui apenas 1 atributo), é matematicamente impossível um atributo depender de 'parte' da chave. Portanto, estando na 1FN, ela atinge a 2FN de forma automática.",
    });

    // Recarregar
    const { data: teoriaNova } = await cicloEstudosService.obterTeoriaPorTopico(topicoSelecionadoId);
    const { data: questoesNovas } = await cicloEstudosService.listarQuestoes(topicoSelecionadoId);
    setTeoria(teoriaNova);
    setQuestoes(questoesNovas || []);
  };

  const handleGerarQuestaoComIA = async () => {
    if (!topicoSelecionadoId) return;
    const topicoObj = topicosDisponiveis.find((t) => t.id === topicoSelecionadoId);
    if (!topicoObj) return;

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      alert("Para gerar questões com IA em tempo real, informe sua chave em VITE_GEMINI_API_KEY no arquivo .env");
      return;
    }

    try {
      const bancaNome = editalAtivo?.banca || "Cebraspe";
      const ehCebraspe =
        bancaNome.toLowerCase().includes("cebraspe") ||
        bancaNome.toLowerCase().includes("cespe");
      const tipoEscolhido = ehCebraspe ? "certo_errado" : "multipla_escolha";

      const nova = await geminiService.gerarQuestaoInedita({
        topico: topicoObj.titulo,
        banca: bancaNome,
        tipo: tipoEscolhido,
      });

      if (nova) {
        await cicloEstudosService.criarQuestao({
          topicoId: topicoSelecionadoId,
          enunciado: nova.enunciado,
          tipo: tipoEscolhido,
          alternativas: nova.alternativas,
          respostaCorreta: nova.respostaCorreta,
          explicacaoDetalhada: nova.explicacaoDetalhada,
          bancaOrigem: `${bancaNome} (Inédita IA)`,
          anoOrigem: new Date().getFullYear(),
        });

        const { data: questoesNovas } = await cicloEstudosService.listarQuestoes(topicoSelecionadoId);
        setQuestoes(questoesNovas || []);
        alert(`✨ Nova questão estilo ${bancaNome} (${tipoEscolhido === "certo_errado" ? "Certo/Errado" : "Múltipla Escolha"}) gerada com sucesso pela IA!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha na IA: ${msg}`);
    }
  };

  const handleSelecionarAlternativa = (questaoId: string, letra: string) => {
    if (questoesReveladas[questaoId]) return; // Já respondida
    setRespostasUsuario((prev) => ({ ...prev, [questaoId]: letra }));
  };

  const handleConfirmarResposta = (questao: QuestaoComDetalhes) => {
    const resposta = respostasUsuario[questao.id];
    if (!resposta) {
      alert("Selecione uma alternativa antes de confirmar.");
      return;
    }

    const acertou = resposta.trim().toUpperCase() === questao.resposta_correta.trim().toUpperCase();
    setQuestoesReveladas((prev) => ({ ...prev, [questao.id]: true }));
    setPlacar((prev) => ({
      acertos: acertou ? prev.acertos + 1 : prev.acertos,
      total: prev.total + 1,
    }));
  };

  return (
    <LayoutCicloStl>
      {/* Barra de Seleção de Tópico do Edital */}
      <SeletorTopicoBarStl>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <BadgeStl>Ciclo de Estudos 30/70</BadgeStl>
            {editalAtivo && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(65, 45, 21, 0.6)",
                  border: "1px solid rgba(225, 220, 201, 0.2)",
                  color: theme.colors.textos.claroPrincipal,
                }}
              >
                🎯 Edital: <strong>{editalAtivo.titulo}</strong> ({editalAtivo.banca})
              </span>
            )}
          </div>
          <TitulosSecundariosStl style={{ fontSize: "1.25rem", marginTop: "0.25rem" }}>
            Selecione o Tópico para Estudo Completo
          </TitulosSecundariosStl>
        </div>

        {topicosDisponiveis.length > 0 ? (
          <SelectStl
            value={topicoSelecionadoId}
            onChange={(e) => setTopicoSelecionadoId(e.target.value)}
          >
            {topicosDisponiveis.map((top) => (
              <option key={top.id} value={top.id}>
                {top.disciplinaNome} ➔ {top.titulo} ({"★".repeat(top.relevancia_banca)})
              </option>
            ))}
          </SelectStl>
        ) : (
          <ParagrafosStl $secundario>
            Nenhum tópico cadastrado no Edital ativo. Cadastre disciplinas e tópicos na aba "Editais".
          </ParagrafosStl>
        )}

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <BotaoPrimarioStl style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }} onClick={handleGerarQuestaoComIA}>
            ✨ Gerar Questão Inédita com IA
          </BotaoPrimarioStl>
          <BotaoSecundarioStl style={{ fontSize: "0.8rem" }} onClick={handleSemearCicloDemonstracao}>
            ⚡ Carregar Teoria & Questões de Exemplo
          </BotaoSecundarioStl>
        </div>
      </SeletorTopicoBarStl>

      {/* Placar de Aproveitamento das Questões */}
      {placar.total > 0 && (
        <CardStl style={{ padding: "1rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <ParagrafosStl style={{ fontWeight: 600 }}>
              🎯 Desempenho na Bateria: {placar.acertos} de {placar.total} acertos (
              {Math.round((placar.acertos / placar.total) * 100)}%)
            </ParagrafosStl>
            <BadgeStl>
              {placar.acertos / placar.total >= 0.7 ? "Aprovado (>=70%)" : "Reforçar Teoria"}
            </BadgeStl>
          </div>
        </CardStl>
      )}

      {/* Grid 30% Teoria / 70% Questões */}
      <Divisao3070ContainerStl>
        {/* COLUNA ESQUERDA: 30% TEORIA CONDENSADA */}
        <PainelTeoriaStl>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <BadgeStl>30% TEORIA ATIVA</BadgeStl>
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              ⏱️ {teoria?.tempo_leitura_estimado_min || 4} min leitura
            </span>
          </div>

          <TitulosSecundariosStl style={{ fontSize: "1.2rem" }}>
            Resumo Teórico do Tópico
          </TitulosSecundariosStl>

          {teoria ? (
            <ConteudoTeoriaRenderStl>
              <div dangerouslySetInnerHTML={{ __html: formatarMarkdownSimples(teoria.conteudo_markdown) }} />

              <PegadinhaBancaBoxStl>
                <strong>⚠️ Pegadinha Clássica de Banca:</strong>
                <br />
                Chave primária simples elimina automaticamente qualquer chance de violação da 2FN!
              </PegadinhaBancaBoxStl>
            </ConteudoTeoriaRenderStl>
          ) : (
            <ParagrafosStl $secundario style={{ padding: "1rem 0" }}>
              Nenhum resumo teórico salvo para este tópico. Clique no botão acima para carregar a demonstração técnica.
            </ParagrafosStl>
          )}
        </PainelTeoriaStl>

        {/* COLUNA DIREITA: 70% BATERIA DE QUESTÕES */}
        <PainelQuestoesStl>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <BadgeStl>70% PRÁTICA EM QUESTÕES</BadgeStl>
            <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              {questoes.length} Questões disponíveis
            </span>
          </div>

          {questoes.length === 0 ? (
            <CardStl $destaqueBorda style={{ textAlign: "center", padding: "2.5rem" }}>
              <TitulosSecundariosStl style={{ fontSize: "1.2rem" }}>
                Nenhuma questão cadastrada para este tema
              </TitulosSecundariosStl>
              <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                Clique em "⚡ Carregar Teoria & Questões de Exemplo" para carregar questões reais das bancas FGV e Cebraspe.
              </ParagrafosStl>
            </CardStl>
          ) : (
            questoes.map((q, idx) => {
              const resposta = respostasUsuario[q.id];
              const revelada = questoesReveladas[q.id] || false;
              const acertou = resposta?.trim().toUpperCase() === q.resposta_correta?.trim().toUpperCase();

              return (
                <QuestaoCardStl key={q.id}>
                  {/* Cabeçalho da Questão */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <BadgeStl>{q.banca_origem || "Banca"}</BadgeStl>
                      <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Ano {q.ano_origem || 2026}</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Questão {idx + 1} de {questoes.length}</span>
                  </div>

                  {/* Enunciado */}
                  <ParagrafosStl style={{ fontSize: "1rem", lineHeight: 1.6 }}>
                    {q.enunciado}
                  </ParagrafosStl>

                  {/* Alternativas */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {q.alternativas.map((alt) => {
                      const isSelected = resposta === alt.letra;
                      const isCorrect = alt.letra.trim().toUpperCase() === q.resposta_correta.trim().toUpperCase();

                      return (
                        <AlternativaBotaoStl
                          key={alt.letra}
                          $selecionada={isSelected}
                          $revelada={revelada}
                          $correta={isCorrect}
                          onClick={() => handleSelecionarAlternativa(q.id, alt.letra)}
                          disabled={revelada}
                        >
                          <strong style={{ minWidth: "22px" }}>({alt.letra})</strong>
                          <span>{alt.texto}</span>
                        </AlternativaBotaoStl>
                      );
                    })}
                  </div>

                  {/* Ação de Resposta e Gabarito Comentado */}
                  {!revelada ? (
                    <div style={{ marginTop: "0.5rem" }}>
                      <BotaoPrimarioStl onClick={() => handleConfirmarResposta(q)}>
                        Responder Questão
                      </BotaoPrimarioStl>
                    </div>
                  ) : (
                    <ComentarioGabaritoStl $acertou={acertou}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "1.05rem", color: acertou ? "#81C784" : "#E57373" }}>
                          {acertou ? "✓ RESPOSTA CORRETA!" : "✕ RESPOSTA INCORRETA"}
                        </strong>
                        <BadgeStl>Gabarito Oficial: ({q.resposta_correta})</BadgeStl>
                      </div>
                      <DividerGradienteStl style={{ margin: "0.75rem 0" }} />
                      <ParagrafosStl style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                        {q.explicacao_detalhada}
                      </ParagrafosStl>
                    </ComentarioGabaritoStl>
                  )}
                </QuestaoCardStl>
              );
            })
          )}
        </PainelQuestoesStl>
      </Divisao3070ContainerStl>
    </LayoutCicloStl>
  );
};

// Parser simples para Markdown em HTML puro seguro sem bibliotecas pesadas
function formatarMarkdownSimples(md: string): string {
  if (!md) return "";
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/\n\n/gim, "<p></p>")
    .replace(/\n/gim, "<br/>");
}
