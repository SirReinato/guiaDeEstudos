import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Aldrich&family=Almarai:wght@300;400;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    min-height: 100%;
    background-color: ${theme.colors.background.app};
    color: ${theme.colors.textos.claroPrincipal};
    font-family: ${theme.fontsFamily.paragrafos};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* Scrollbar customizada e integrada à paleta */
  ::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.preto};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.ambarQueimado};
    border-radius: 5px;
    border: 2px solid ${theme.colors.preto};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.marfim};
  }

  /* Seleção de texto temática com contraste perfeito */
  ::selection {
    background-color: ${theme.colors.ambarQueimado};
    color: ${theme.colors.marfim};
  }

  button, input, textarea, select {
    font-family: inherit;
    border: none;
    outline: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;
