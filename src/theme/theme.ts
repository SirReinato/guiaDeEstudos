import styled from "styled-components";

export const theme = {
  colors: {
    // Cores puras da paleta solicitada
    preto: "#000000",
    cafeProfundo: "#1F150C",
    ambarQueimado: "#412D15",
    marfim: "#E1DCC9",

    // Papéis funcionais de fundo
    background: {
      app: "#000000",          // Fundo mais externo da aplicação
      card: "#1F150C",         // Cards de questões, flashcards e modais
      superficie: "#412D15",   // Headers, seções e barras de ferramentas
      invertido: "#E1DCC9",    // Papel claro/folha para redação e contrastes
    },

    // Papéis funcionais de texto com garantia rigorosa de contraste
    textos: {
      claroPrincipal: "#E1DCC9",                   // 100% legível sobre fundos escuros
      claroSecundario: "rgba(225, 220, 201, 0.78)", // Texto de apoio/legendas
      escuroPrincipal: "#000000",                  // 100% legível sobre fundos marfim
      escuroSecundario: "#1F150C",                 // Texto de apoio sobre marfim
      destaque: "#412D15",
    },

    // Gradientes temáticos do projeto
    gradients: {
      // Tipo 1: Botão Primário (Ação principal, destaque intenso)
      btnPrimario: "linear-gradient(135deg, #412D15 0%, #1F150C 100%)",
      btnPrimarioHover: "linear-gradient(135deg, #593D1E 0%, #2A1D11 100%)",

      // Tipo 2: Botão Secundário (Ação neutra, contorno contrastante)
      btnSecundario: "linear-gradient(135deg, #1F150C 0%, #000000 100%)",
      btnSecundarioHover: "linear-gradient(135deg, #412D15 0%, #1F150C 100%)",

      // Gradientes decorativos de destaque (barras de progresso, divisórias, bordas)
      destaqueHorizontal: "linear-gradient(90deg, #1F150C 0%, #412D15 50%, #E1DCC9 100%)",
      destaqueBrilho: "linear-gradient(135deg, #E1DCC9 0%, #412D15 50%, #1F150C 100%)",
      linhaDivisoria: "linear-gradient(90deg, transparent 0%, #412D15 25%, #E1DCC9 50%, #412D15 75%, transparent 100%)",
      cardBorda: "linear-gradient(180deg, rgba(225, 220, 201, 0.3) 0%, rgba(65, 45, 21, 0.2) 100%)",
    },

    // Bordas padronizadas
    borders: {
      suave: "1px solid rgba(225, 220, 201, 0.15)",
      destaque: "1px solid #412D15",
      ativo: "1px solid #E1DCC9",
    },
  },

  fontsFamily: {
    titulos: "'Aldrich', sans-serif",
    paragrafos: "'Almarai', sans-serif",
    codigo: "'JetBrains Mono', 'Fira Code', monospace",
  },

  fontSize: {
    titulos: {
      gg: "2.8rem",
      mm: "2.2rem",
      pp: "1.8rem",
    },
    titulosSecundarios: {
      gg: "1.8rem",
      mm: "1.5rem",
      pp: "1.25rem",
    },
    paragrafos: {
      gg: "1.15rem",
      mm: "1rem",
      pp: "0.875rem",
      micro: "0.75rem",
    },
  },

  spacing: {
    pp: "0.5rem",
    mm: "1rem",
    gg: "2rem",
    xg: "3.5rem",
  },

  breakpoints: {
    celular: "480px",
    tablet: "768px",
    notebook: "1200px",
    desktop: "1400px",
  },
};

export type AppTheme = typeof theme;

// ==========================================
// COMPONENTES STYLED BASE REUTILIZÁVEIS
// ==========================================

export const TitulosPrincipaisStl = styled.h1<{ $fundoInvertido?: boolean }>`
  font-size: ${theme.fontSize.titulos.gg};
  font-family: ${theme.fontsFamily.titulos};
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
  margin: 0;
  
  color: ${(props) =>
    props.$fundoInvertido
      ? theme.colors.textos.escuroPrincipal
      : theme.colors.textos.claroPrincipal};

  @media (max-width: ${theme.breakpoints.notebook}) {
    font-size: ${theme.fontSize.titulos.mm};
  }
  @media (max-width: ${theme.breakpoints.celular}) {
    font-size: ${theme.fontSize.titulosSecundarios.pp};
    text-align: center;
  }
`;

export const TitulosSecundariosStl = styled.h2<{
  $fundoInvertido?: boolean;
  $centro?: boolean;
}>`
  font-size: ${theme.fontSize.titulosSecundarios.gg};
  font-family: ${theme.fontsFamily.titulos};
  font-weight: 700;
  line-height: 1.3;
  text-align: ${(props) => (props.$centro ? "center" : "start")};
  margin: 0;
  
  color: ${(props) =>
    props.$fundoInvertido
      ? theme.colors.textos.escuroPrincipal
      : theme.colors.textos.claroPrincipal};

  @media (max-width: ${theme.breakpoints.notebook}) {
    font-size: ${theme.fontSize.titulosSecundarios.mm};
  }
  @media (max-width: ${theme.breakpoints.celular}) {
    font-size: 1.35rem;
    text-align: center;
  }
`;

export const ParagrafosStl = styled.p<{
  $grande?: boolean;
  $fundoInvertido?: boolean;
  $secundario?: boolean;
  $centro?: boolean;
}>`
  font-size: ${(props) =>
    props.$grande ? theme.fontSize.paragrafos.gg : theme.fontSize.paragrafos.mm};
  font-family: ${theme.fontsFamily.paragrafos};
  font-weight: 400;
  line-height: 1.6;
  text-align: ${(props) => (props.$centro ? "center" : "start")};
  margin: 0;
  
  color: ${(props) => {
    if (props.$fundoInvertido) {
      return props.$secundario
        ? theme.colors.textos.escuroSecundario
        : theme.colors.textos.escuroPrincipal;
    }
    return props.$secundario
      ? theme.colors.textos.claroSecundario
      : theme.colors.textos.claroPrincipal;
  }};

  @media (max-width: ${theme.breakpoints.celular}) {
    font-size: ${theme.fontSize.paragrafos.pp};
  }
`;

export const ConteinerGeral = styled.div<{ $invertido?: boolean }>`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.gg};
  box-sizing: border-box;
  
  background-color: ${(props) =>
    props.$invertido
      ? theme.colors.background.invertido
      : theme.colors.background.app};

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.mm};
  }
`;

// Botão Primário: Gradiente Marcante com Destaque Âmbar/Marrom
export const BotaoPrimarioStl = styled.button`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.mm};
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  background: ${theme.colors.gradients.btnPrimario};
  color: ${theme.colors.textos.claroPrincipal};
  border: ${theme.colors.borders.suave};
  
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${theme.colors.gradients.btnPrimarioHover};
    border-color: ${theme.colors.marfim};
    box-shadow: 0 6px 20px rgba(65, 45, 21, 0.7);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Botão Secundário: Gradiente Suave com Borda Contrastante
export const BotaoSecundarioStl = styled.button`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.mm};
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 0.85rem 1.75rem;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  background: ${theme.colors.gradients.btnSecundario};
  color: ${theme.colors.textos.claroPrincipal};
  border: ${theme.colors.borders.destaque};
  
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${theme.colors.gradients.btnSecundarioHover};
    border-color: ${theme.colors.marfim};
    color: ${theme.colors.marfim};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Card Base com Borda Sutil e Fundo Café Profundo
export const CardStl = styled.div<{ $destaqueBorda?: boolean }>`
  width: 100%;
  background-color: ${theme.colors.background.card};
  border-radius: 12px;
  padding: ${theme.spacing.gg};
  box-sizing: border-box;
  border: ${(props) =>
    props.$destaqueBorda
      ? `1px solid ${theme.colors.ambarQueimado}`
      : theme.colors.borders.suave};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.mm};
  }
`;

// Linha Divisória com Gradiente Suave
export const DividerGradienteStl = styled.hr`
  width: 100%;
  height: 1px;
  border: none;
  background: ${theme.colors.gradients.linhaDivisoria};
  margin: ${theme.spacing.gg} 0;
`;

// Tag/Badge com Gradiente
export const BadgeStl = styled.span`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.micro};
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  background: ${theme.colors.gradients.btnPrimario};
  color: ${theme.colors.textos.claroPrincipal};
  border: 1px solid rgba(225, 220, 201, 0.25);
  display: inline-block;
`;
