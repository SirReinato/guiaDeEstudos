import React, { useState } from "react";
import styled from "styled-components";
import {
  theme,
  ConteinerGeral,
  TitulosPrincipaisStl,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  DividerGradienteStl,
  BadgeStl,
} from "./theme/theme";

// Componentes estilizados exclusivos para demonstração da Etapa 1
const HeaderStl = styled.header`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin-bottom: ${theme.spacing.gg};
`;

const GradeModulosStl = styled.div`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const AreaBotoesStl = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
`;

const BarraProgressoStl = styled.div`
  width: 100%;
  max-width: 1100px;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  border-radius: 999px;
  height: 22px;
  padding: 3px;
  box-sizing: border-box;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressoPreenchimentoStl = styled.div<{ $porcentagem: number }>`
  height: 100%;
  width: ${(props) => props.$porcentagem}%;
  background: ${theme.colors.gradients.destaqueHorizontal};
  border-radius: 999px;
  transition: width 0.4s ease-in-out;
`;

const PainelInvertidoStl = styled.div`
  background-color: ${theme.colors.background.invertido};
  color: ${theme.colors.textos.escuroPrincipal};
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 1.5rem;
  width: 100%;
  max-width: 1100px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
`;

export const App: React.FC = () => {
  const [cliques, setCliques] = useState(0);
  const [metaDiaria, setMetaDiaria] = useState(30);

  const aumentarMeta = () => {
    setMetaDiaria((prev) => (prev >= 100 ? 10 : prev + 10));
    setCliques((prev) => prev + 1);
  };

  const resetar = () => {
    setMetaDiaria(30);
    setCliques(0);
  };

  return (
    <ConteinerGeral>
      {/* Cabeçalho */}
      <HeaderStl>
        <BadgeStl>Etapa 1 • Design System & Validação Visual</BadgeStl>
        <TitulosPrincipaisStl>Guia de Estudos TI</TitulosPrincipaisStl>
        <ParagrafosStl $grande $secundario $centro>
          Plataforma de alta performance para concursos de TI e programação.
          Paleta terrosa escura com alto contraste e tipografia Aldrich & Almarai.
        </ParagrafosStl>
      </HeaderStl>

      {/* Demonstração dos 2 Tipos de Botões com Gradientes */}
      <CardStl $destaqueBorda style={{ maxWidth: "1100px" }}>
        <TitulosSecundariosStl>
          1. Demonstração dos Botões com Gradiente
        </TitulosSecundariosStl>
        <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
          Observe o contraste imediato sobre o fundo escuro, os estados de hover e os efeitos táteis.
        </ParagrafosStl>

        <AreaBotoesStl>
          <BotaoPrimarioStl onClick={aumentarMeta}>
            ⚡ Botão Primário (Ação Principal)
          </BotaoPrimarioStl>

          <BotaoSecundarioStl onClick={resetar}>
            ↺ Botão Secundário (Ação Neutra)
          </BotaoSecundarioStl>

          <BotaoPrimarioStl disabled>
            🔒 Primário Desabilitado
          </BotaoPrimarioStl>
        </AreaBotoesStl>

        <ParagrafosStl $centro $secundario>
          Cliques realizados no teste interativo: <strong>{cliques}</strong>
        </ParagrafosStl>
      </CardStl>

      <DividerGradienteStl />

      {/* Barra de Progresso com Gradiente de Destaque */}
      <div style={{ width: "100%", maxWidth: "1100px", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <TitulosSecundariosStl>
            2. Barra de Destaque Diário (Streak)
          </TitulosSecundariosStl>
          <BadgeStl>{metaDiaria}% Concluído</BadgeStl>
        </div>
        <BarraProgressoStl>
          <ProgressoPreenchimentoStl $porcentagem={metaDiaria} />
        </BarraProgressoStl>
      </div>

      {/* Grade com os 5 Módulos do Sistema */}
      <GradeModulosStl>
        <CardStl>
          <BadgeStl>Módulo 01</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
            Edital & Provas
          </TitulosSecundariosStl>
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            Extração inteligente de matérias, tópicos prioritários e análise de bancas (Cebraspe, FGV, FCC).
          </ParagrafosStl>
        </CardStl>

        <CardStl>
          <BadgeStl>Módulo 02</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
            Dose Diária (Anki)
          </TitulosSecundariosStl>
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            Micro-learning diário com repetição espaçada SM-2 para retenção sem cansaço.
          </ParagrafosStl>
        </CardStl>

        <CardStl>
          <BadgeStl>Módulo 03</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
            Ciclo 30/70
          </TitulosSecundariosStl>
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            30% Teoria condensada em markdown e 70% Bateria de Questões comentadas.
          </ParagrafosStl>
        </CardStl>

        <CardStl>
          <BadgeStl>Módulo 04</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
            Mini-IDE Concursos
          </TitulosSecundariosStl>
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            Ambiente prático para escrever queries SQL, scripts e algoritmos de prova.
          </ParagrafosStl>
        </CardStl>

        <CardStl>
          <BadgeStl>Módulo 05</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
            Oficina de Discursivas
          </TitulosSecundariosStl>
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            Simulação de redações de TI com contagem de linhas e espelho de banca.
          </ParagrafosStl>
        </CardStl>

        <CardStl>
          <BadgeStl>Supabase + IA</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
            Persistência & Nuvem
          </TitulosSecundariosStl>
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            PostgreSQL na nuvem com autenticação segura e conexão com IA generativa.
          </ParagrafosStl>
        </CardStl>
      </GradeModulosStl>

      {/* Teste do Modo Contraste Invertido (Folha de Redação / Fundo Claro) */}
      <PainelInvertidoStl>
        <TitulosSecundariosStl $fundoInvertido>
          3. Teste de Contraste Invertido (Papel Marfim #E1DCC9)
        </TitulosSecundariosStl>
        <ParagrafosStl $fundoInvertido style={{ marginTop: "0.5rem" }}>
          Este card valida o contraste reverso quando usamos a cor marfim como fundo (como na folha de redação discursiva). O texto preto e marrom café escuro se destaca perfeitamente, sem perda de leitura.
        </ParagrafosStl>
      </PainelInvertidoStl>
    </ConteinerGeral>
  );
};

export default App;
