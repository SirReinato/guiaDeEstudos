import React from "react";
import styled from "styled-components";
import { theme, BotaoSecundarioStl, PillBadgeStl } from "../theme/theme";
import { useEdital } from "../contexts/EditalContext";

const HubWrapperStl = styled.div`
  width: 100%;
  background: linear-gradient(135deg, rgba(31, 21, 12, 0.95) 0%, rgba(15, 10, 5, 0.98) 100%);
  border: 1px solid rgba(225, 220, 201, 0.15);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(225, 220, 201, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HubHeaderStl = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid rgba(225, 220, 201, 0.08);
  padding-bottom: 0.85rem;
`;

const FocoSelectorLadoStl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
`;

const TituloFocoStl = styled.span`
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${theme.colors.marfim};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const SelectConcursoStl = styled.select`
  padding: 0.55rem 1rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: 1px solid ${theme.colors.ambarQueimado};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  min-width: 280px;
  max-width: 450px;
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${theme.colors.marfim};
    box-shadow: 0 0 10px rgba(225, 220, 201, 0.25);
  }
`;

const MetricasGridStl = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
`;

const MetricaCardStl = styled.div<{ $destaque?: boolean }>`
  background-color: ${(props) =>
    props.$destaque ? "rgba(65, 45, 21, 0.35)" : "rgba(0, 0, 0, 0.45)"};
  border: 1px solid
    ${(props) => (props.$destaque ? theme.colors.marfim : "rgba(225, 220, 201, 0.12)")};
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${theme.colors.marfim};
    transform: translateY(-1px);
  }
`;

const MetricaLabelStl = styled.span`
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  color: rgba(225, 220, 201, 0.65);
`;

const MetricaValorStl = styled.span`
  font-family: ${theme.fontsFamily.titulos};
  font-size: 1.15rem;
  font-weight: 700;
  color: ${theme.colors.marfim};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const VazioAvisoStl = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
`;

interface Props {
  onAbrirAbaEditais: () => void;
}

export const EditalSelectorBar: React.FC<Props> = ({ onAbrirAbaEditais }) => {
  const { editais, editalAtivo, metricasEdital, selecionarEdital } = useEdital();

  if (editais.length === 0) {
    return (
      <HubWrapperStl>
        <VazioAvisoStl>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎯</span>
            <div>
              <strong style={{ color: theme.colors.marfim, display: "block" }}>
                Nenhum Concurso/Edital Ativo Cadastrado
              </strong>
              <span style={{ fontSize: "0.85rem", color: "rgba(225, 220, 201, 0.7)" }}>
                Faça o upload do seu edital em PDF na aba de Editais para a IA estruturar as disciplinas e calibrar suas questões.
              </span>
            </div>
          </div>
          <BotaoSecundarioStl style={{ fontSize: "0.8rem", padding: "0.5rem 1.25rem" }} onClick={onAbrirAbaEditais}>
            📑 Cadastrar & Dissecar Edital
          </BotaoSecundarioStl>
        </VazioAvisoStl>
      </HubWrapperStl>
    );
  }

  const ehCebraspe =
    editalAtivo?.banca?.toLowerCase().includes("cebraspe") ||
    editalAtivo?.banca?.toLowerCase().includes("cespe");

  return (
    <HubWrapperStl>
      <HubHeaderStl>
        <FocoSelectorLadoStl>
          <TituloFocoStl>
            <span>🎯</span>
            <span>Edital Foco:</span>
          </TituloFocoStl>

          <SelectConcursoStl
            value={editalAtivo?.id || ""}
            onChange={(e) => selecionarEdital(e.target.value)}
            aria-label="Selecionar Edital Ativo"
          >
            {editais.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.titulo} — {ed.banca} {ed.ano ? `(${ed.ano})` : ""}
              </option>
            ))}
          </SelectConcursoStl>

          <PillBadgeStl $variante="destaque">
            {ehCebraspe ? "Estilo: Certo / Errado" : "Estilo: Múltipla Escolha"}
          </PillBadgeStl>
        </FocoSelectorLadoStl>

        <BotaoSecundarioStl
          style={{ fontSize: "0.75rem", padding: "0.4rem 0.9rem" }}
          onClick={onAbrirAbaEditais}
          title="Ver disciplinas, tópicos ou carregar novo edital"
        >
          ⚙️ Ajustar Edital & Provas
        </BotaoSecundarioStl>
      </HubHeaderStl>

      {metricasEdital && (
        <MetricasGridStl>
          <MetricaCardStl $destaque>
            <MetricaLabelStl>🏛️ Banca Examinadora</MetricaLabelStl>
            <MetricaValorStl>{metricasEdital.banca.toUpperCase()}</MetricaValorStl>
          </MetricaCardStl>

          <MetricaCardStl>
            <MetricaLabelStl>📚 Disciplinas Cadastradas</MetricaLabelStl>
            <MetricaValorStl>{metricasEdital.totalDisciplinas} Matérias</MetricaValorStl>
          </MetricaCardStl>

          <MetricaCardStl>
            <MetricaLabelStl>📑 Tópicos Mapeados</MetricaLabelStl>
            <MetricaValorStl>{metricasEdital.totalTopicos} Tópicos</MetricaValorStl>
          </MetricaCardStl>

          <MetricaCardStl>
            <MetricaLabelStl>⭐ Tópicos de Alta Incidência</MetricaLabelStl>
            <MetricaValorStl style={{ color: "#FFD54F" }}>
              {metricasEdital.topicosAltaRelevancia} Críticos (4-5★)
            </MetricaValorStl>
          </MetricaCardStl>
        </MetricasGridStl>
      )}
    </HubWrapperStl>
  );
};
