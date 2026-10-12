import React from "react";
import styled from "styled-components";
import { theme, BotaoSecundarioStl } from "../theme/theme";
import { useEdital } from "../contexts/EditalContext";

const BarContainerStl = styled.div`
  width: 100%;
  max-width: 1100px;
  background: linear-gradient(135deg, rgba(31, 21, 12, 0.95), rgba(15, 10, 5, 0.98));
  border: 1px solid ${theme.colors.ambarQueimado};
  border-radius: 12px;
  padding: 0.9rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(225, 220, 201, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InfoEsquerdaStl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const LabelFocoStl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${theme.colors.marfim};
  white-space: nowrap;
`;

const SelectEditalStl = styled.select`
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: 1px solid ${theme.colors.ambarQueimado};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  max-width: 380px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.marfim};
    box-shadow: 0 0 8px rgba(225, 220, 201, 0.25);
  }
`;

const MetricasContainerStl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const TagMetricaStl = styled.span<{ $destaque?: boolean }>`
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.75rem;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  background-color: ${(props) =>
    props.$destaque ? "rgba(65, 45, 21, 0.7)" : "rgba(0, 0, 0, 0.5)"};
  border: 1px solid
    ${(props) => (props.$destaque ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)")};
  color: ${theme.colors.textos.claroPrincipal};
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`;

const VazioAvisoStl = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: ${theme.colors.textos.claroPrincipal};
`;

interface Props {
  onAbrirAbaEditais: () => void;
}

export const EditalSelectorBar: React.FC<Props> = ({ onAbrirAbaEditais }) => {
  const { editais, editalAtivo, metricasEdital, selecionarEdital } = useEdital();

  if (editais.length === 0) {
    return (
      <BarContainerStl>
        <VazioAvisoStl>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚠️</span>
            <span>
              <strong>Nenhum Edital Ativo Cadastrado:</strong> As ferramentas (Discursivas, Mini-IDE, Ciclo 30/70 e Flashcards) precisam de um edital para personalizar questões e bancas.
            </span>
          </div>
          <BotaoSecundarioStl style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }} onClick={onAbrirAbaEditais}>
            📑 Cadastrar / Dissecar Edital Agora
          </BotaoSecundarioStl>
        </VazioAvisoStl>
      </BarContainerStl>
    );
  }

  return (
    <BarContainerStl>
      <InfoEsquerdaStl>
        <LabelFocoStl>
          <span>🎯</span>
          <span>Foco do Estudo:</span>
        </LabelFocoStl>

        <SelectEditalStl
          value={editalAtivo?.id || ""}
          onChange={(e) => selecionarEdital(e.target.value)}
          aria-label="Selecionar Edital Ativo"
        >
          {editais.map((ed) => (
            <option key={ed.id} value={ed.id}>
              {ed.titulo} — {ed.banca} {ed.ano ? `(${ed.ano})` : ""}
            </option>
          ))}
        </SelectEditalStl>
      </InfoEsquerdaStl>

      <MetricasContainerStl>
        {metricasEdital && (
          <>
            <TagMetricaStl $destaque>
              🏛️ <strong>{metricasEdital.banca.toUpperCase()}</strong>
            </TagMetricaStl>
            <TagMetricaStl>
              📚 <strong>{metricasEdital.totalDisciplinas}</strong> Matérias
            </TagMetricaStl>
            <TagMetricaStl>
              📑 <strong>{metricasEdital.totalTopicos}</strong> Tópicos
            </TagMetricaStl>
            <TagMetricaStl>
              ⭐ <strong>{metricasEdital.topicosAltaRelevancia}</strong> Alta Relevância
            </TagMetricaStl>
          </>
        )}

        <BotaoSecundarioStl
          style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem" }}
          onClick={onAbrirAbaEditais}
          title="Ver detalhes completos do edital ou adicionar novo"
        >
          ⚙️ Ajustar Edital
        </BotaoSecundarioStl>
      </MetricasContainerStl>
    </BarContainerStl>
  );
};
