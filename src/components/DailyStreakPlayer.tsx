import React, { useState } from "react";
import styled from "styled-components";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  BadgeStl,
} from "../theme/theme";
import type { FlashcardComTopico } from "../services/flashcardsService";
import { useEdital } from "../contexts/EditalContext";

const FlashcardCenaStl = styled.div`
  width: 100%;
  max-width: 650px;
  min-height: 320px;
  perspective: 1000px;
  margin: 1.5rem auto;
  cursor: pointer;
`;

const FlashcardInnerStl = styled.div<{ $virado: boolean }>`
  position: relative;
  width: 100%;
  min-height: 320px;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  transform: ${(props) => (props.$virado ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

const FaceStl = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  min-height: 320px;
  backface-visibility: hidden;
  border-radius: 12px;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const FaceFrenteStl = styled(FaceStl)`
  background: ${theme.colors.gradients.btnSecundario};
  border: 1px solid ${theme.colors.ambarQueimado};
  color: ${theme.colors.textos.claroPrincipal};
`;

const FaceVersoStl = styled(FaceStl)`
  background: ${theme.colors.gradients.btnPrimario};
  border: 1px solid ${theme.colors.marfim};
  color: ${theme.colors.textos.claroPrincipal};
  transform: rotateY(180deg);
`;

const ControlesRepeticaoStl = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 650px;
  margin: 1rem auto;
`;

const BotaoAvaliacaoStl = styled.button<{ $cor: string }>`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.pp};
  font-weight: 700;
  padding: 0.85rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${theme.colors.preto};
  border: 1px solid ${(props) => props.$cor};
  color: ${(props) => props.$cor};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) => props.$cor};
    color: ${theme.colors.preto};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
`;

const BarraProgressoContainerStl = styled.div`
  width: 100%;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  border-radius: 999px;
  height: 18px;
  padding: 2px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0.5rem 0 1rem;
`;

const BarraPreenchimentoStl = styled.div<{ $porcentagem: number }>`
  height: 100%;
  width: ${(props) => props.$porcentagem}%;
  background: ${theme.colors.gradients.destaqueHorizontal};
  border-radius: 999px;
  transition: width 0.3s ease-in-out;
`;

interface Props {
  cards: FlashcardComTopico[];
  onResponder: (card: FlashcardComTopico, qualidade: 0 | 3 | 4 | 5) => Promise<void>;
  cardsRevisadosHoje: number;
  metaDiaria: number;
}

export const DailyStreakPlayer: React.FC<Props> = ({
  cards,
  onResponder,
  cardsRevisadosHoje,
  metaDiaria,
}) => {
  const { editalAtivo, topicoIdsEditalAtivo } = useEdital();
  const [filtrarPorEdital, setFiltrarPorEdital] = useState<boolean>(true);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [virado, setVirado] = useState(false);
  const [processando, setProcessando] = useState(false);

  // Filtra cards pertencentes ao edital ativo se houver
  const cardsParaEstudo = React.useMemo(() => {
    if (!filtrarPorEdital || !editalAtivo) return cards;
    const filtrados = cards.filter((c) => !c.topico_id || topicoIdsEditalAtivo.has(c.topico_id));
    return filtrados;
  }, [cards, filtrarPorEdital, editalAtivo, topicoIdsEditalAtivo]);

  const cardAtual = cardsParaEstudo[indiceAtual] || cardsParaEstudo[0];
  const progressoMeta = Math.min(100, Math.round((cardsRevisadosHoje / metaDiaria) * 100));

  const handleAvaliar = async (qualidade: 0 | 3 | 4 | 5) => {
    if (!cardAtual || processando) return;
    setProcessando(true);
    await onResponder(cardAtual, qualidade);
    setVirado(false);

    if (indiceAtual + 1 < cardsParaEstudo.length) {
      setIndiceAtual((prev) => prev + 1);
    } else {
      setIndiceAtual(0); // Reinicia ou finaliza a sessão
    }
    setProcessando(false);
  };

  if (!cardsParaEstudo || cardsParaEstudo.length === 0) {
    return (
      <CardStl $destaqueBorda style={{ maxWidth: "700px", margin: "1.5rem auto", textAlign: "center" }}>
        <BadgeStl>Revisão Concluída</BadgeStl>
        <TitulosSecundariosStl style={{ marginTop: "1rem" }}>
          {filtrarPorEdital && editalAtivo && cards.length > 0
            ? `🎉 Nenhum Flashcard Cadastrado para "${editalAtivo.titulo}"!`
            : "🎉 Nenhum Flashcard Pendente para Hoje!"}
        </TitulosSecundariosStl>
        <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
          {filtrarPorEdital && editalAtivo && cards.length > 0
            ? `Você possui ${cards.length} cards em outros editais ou gerais. Você pode mudar para outro edital ou desativar o filtro abaixo.`
            : "Você já revisou seus cards ou ainda não cadastrou nenhum na árvore de matérias."}
        </ParagrafosStl>

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <BadgeStl>Streak: {cardsRevisadosHoje}/{metaDiaria} Cards hoje</BadgeStl>
          {editalAtivo && cards.length > 0 && (
            <BotaoSecundarioStl
              style={{ fontSize: "0.8rem" }}
              onClick={() => setFiltrarPorEdital(!filtrarPorEdital)}
            >
              {filtrarPorEdital ? "👁️ Estudar Todos os Cards da Conta" : "🎯 Filtrar pelo Edital Ativo"}
            </BotaoSecundarioStl>
          )}
        </div>
      </CardStl>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "750px", margin: "1rem auto" }}>
      {/* Barra de Streak e Meta Diária */}
      <CardStl style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <BadgeStl>🔥 Streak de Estudos</BadgeStl>
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
            <TitulosSecundariosStl style={{ fontSize: "1.2rem", marginTop: "0.3rem" }}>
              Meta Diária: {cardsRevisadosHoje} de {metaDiaria} cards
            </TitulosSecundariosStl>
          </div>
          <span style={{ fontFamily: theme.fontsFamily.titulos, fontSize: "1.3rem", color: theme.colors.marfim }}>
            {progressoMeta}%
          </span>
        </div>
        <BarraProgressoContainerStl>
          <BarraPreenchimentoStl $porcentagem={progressoMeta} />
        </BarraProgressoContainerStl>
      </CardStl>

      {/* Card Interativo com Flip 3D */}
      {cardAtual && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Card {indiceAtual + 1} de {cards.length}
            </span>
            <span style={{ fontSize: "0.85rem", color: theme.colors.marfim }}>
              {cardAtual.topicos?.disciplinas?.nome ? `📖 ${cardAtual.topicos.disciplinas.nome}` : "TI Geral"}
            </span>
          </div>

          <FlashcardCenaStl onClick={() => setVirado(!virado)}>
            <FlashcardInnerStl $virado={virado}>
              {/* FRENTE DO CARD */}
              <FaceFrenteStl>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <BadgeStl>CONCEITO / PERGUNTA</BadgeStl>
                  <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>Toque para virar ↺</span>
                </div>

                <TitulosSecundariosStl style={{ margin: "auto 0", fontSize: "1.45rem" }}>
                  {cardAtual.frente}
                </TitulosSecundariosStl>

                <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                  💡 Tente lembrar a resposta antes de virar
                </ParagrafosStl>
              </FaceFrenteStl>

              {/* VERSO DO CARD */}
              <FaceVersoStl>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <BadgeStl>RESPOSTA / EXPLICAÇÃO</BadgeStl>
                  <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>Toque para desvirar ↻</span>
                </div>

                <ParagrafosStl style={{ margin: "auto 0", fontSize: "1.1rem", lineHeight: 1.6 }}>
                  {cardAtual.verso}
                </ParagrafosStl>

                <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                  Avalie a facilidade abaixo para o algoritmo SM-2:
                </ParagrafosStl>
              </FaceVersoStl>
            </FlashcardInnerStl>
          </FlashcardCenaStl>

          {/* Botões de Avaliação SM-2 */}
          {virado ? (
            <ControlesRepeticaoStl>
              <BotaoAvaliacaoStl $cor="#E57373" onClick={() => handleAvaliar(0)} disabled={processando}>
                ❌ Errei
                <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Rever amanhã</div>
              </BotaoAvaliacaoStl>

              <BotaoAvaliacaoStl $cor="#FFB74D" onClick={() => handleAvaliar(3)} disabled={processando}>
                ⚠️ Difícil
                <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Em 2-3 dias</div>
              </BotaoAvaliacaoStl>

              <BotaoAvaliacaoStl $cor="#81C784" onClick={() => handleAvaliar(4)} disabled={processando}>
                👍 Bom
                <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Intervalo normal</div>
              </BotaoAvaliacaoStl>

              <BotaoAvaliacaoStl $cor="#64B5F6" onClick={() => handleAvaliar(5)} disabled={processando}>
                ⚡ Fácil
                <div style={{ fontSize: "0.65rem", opacity: 0.8 }}>Intervalo longo</div>
              </BotaoAvaliacaoStl>
            </ControlesRepeticaoStl>
          ) : (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <BotaoPrimarioStl onClick={() => setVirado(true)}>
                👁️ Revelar Resposta
              </BotaoPrimarioStl>
            </div>
          )}
        </>
      )}
    </div>
  );
};
