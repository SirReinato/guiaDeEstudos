import React from "react";
import styled from "styled-components";
import { theme, BotaoSecundarioStl, PillBadgeStl } from "../theme/theme";
import { useAuth } from "../contexts/AuthContext";
import { useEdital } from "../contexts/EditalContext";

const NavHeaderStl = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: rgba(15, 10, 5, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(225, 220, 201, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const NavContentStl = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 0.65rem 1rem;
    flex-wrap: wrap;
  }
`;

const BrandLadoStl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const LogoIconeStl = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${theme.colors.gradients.btnPrimario};
  border: 1px solid ${theme.colors.marfim};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 0 10px rgba(225, 220, 201, 0.2);
`;

const LogoTextoWrapperStl = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTituloStl = styled.span`
  font-family: ${theme.fontsFamily.titulos};
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${theme.colors.marfim};
  line-height: 1.2;
`;

const LogoSubtituloStl = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(225, 220, 201, 0.6);
  font-family: ${theme.fontsFamily.titulos};
`;

const EditalAtivoChipStl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background-color: rgba(31, 21, 12, 0.7);
  border: 1px solid rgba(225, 220, 201, 0.2);
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${theme.colors.marfim};
    background-color: rgba(65, 45, 21, 0.5);
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

const UsuarioLadoStl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AvatarCirculoStl = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${theme.colors.gradients.btnPrimario};
  border: 1px solid rgba(225, 220, 201, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${theme.colors.marfim};
`;

const UserInfoTextStl = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  @media (max-width: ${theme.breakpoints.celular}) {
    display: none;
  }
`;

const PontoStatusStl = styled.span<{ $conectado: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${(props) => (props.$conectado ? "#81C784" : "#FFB74D")};
  box-shadow: 0 0 6px ${(props) => (props.$conectado ? "#81C784" : "#FFB74D")};
  display: inline-block;
`;

interface Props {
  conectado: boolean;
  mostrarPainelAdmin: boolean;
  onToggleAdmin: () => void;
  onAbrirEditais: () => void;
}

export const AppNavbar: React.FC<Props> = ({
  conectado,
  mostrarPainelAdmin,
  onToggleAdmin,
  onAbrirEditais,
}) => {
  const { user, profile, signOut } = useAuth();
  const { editalAtivo } = useEdital();

  const isAdmin = profile?.role === "admin" || profile?.username?.toLowerCase() === "sirreinato";
  const nomeUsuario = profile?.username || user?.email?.split("@")[0] || "Aluno";
  const inicial = nomeUsuario.charAt(0).toUpperCase();

  return (
    <NavHeaderStl>
      <NavContentStl>
        {/* Lado Esquerdo: Logo & Marca */}
        <BrandLadoStl>
          <LogoIconeStl title="Guia de Estudos TI">⚡</LogoIconeStl>
          <LogoTextoWrapperStl>
            <LogoTituloStl>GUIA DE ESTUDOS TI</LogoTituloStl>
            <LogoSubtituloStl>Alta Performance Concursos</LogoSubtituloStl>
          </LogoTextoWrapperStl>
          <span title={conectado ? "Supabase Operacional" : "Conectando ao Supabase"}>
            <PontoStatusStl $conectado={conectado} />
          </span>
        </BrandLadoStl>

        {/* Centro: Chip do Edital Ativo */}
        {editalAtivo ? (
          <EditalAtivoChipStl onClick={onAbrirEditais} title="Clique para gerenciar editais">
            <span style={{ color: "#FFD54F" }}>🎯</span>
            <span style={{ fontWeight: 600 }}>{editalAtivo.titulo}</span>
            <PillBadgeStl $variante="destaque" style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>
              {editalAtivo.banca}
            </PillBadgeStl>
          </EditalAtivoChipStl>
        ) : (
          <EditalAtivoChipStl onClick={onAbrirEditais}>
            <span style={{ color: "#FFB74D" }}>⚠️ Selecionar Edital Foco</span>
          </EditalAtivoChipStl>
        )}

        {/* Lado Direito: Perfil do Usuário e Ações */}
        <UsuarioLadoStl>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AvatarCirculoStl>{inicial}</AvatarCirculoStl>
            <UserInfoTextStl>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: theme.colors.marfim }}>
                {nomeUsuario}
              </span>
              <span style={{ fontSize: "0.65rem", color: isAdmin ? "#FFD54F" : "rgba(225, 220, 201, 0.6)" }}>
                {isAdmin ? "⭐ Administrador" : "Aluno Registrado"}
              </span>
            </UserInfoTextStl>
          </div>

          {isAdmin && (
            <BotaoSecundarioStl
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
              onClick={onToggleAdmin}
              title="Painel de controle e aprovação de alunos"
            >
              {mostrarPainelAdmin ? "✕ Fechar ADM" : "🛡️ Painel ADM"}
            </BotaoSecundarioStl>
          )}

          <BotaoSecundarioStl
            style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
            onClick={() => signOut()}
            title="Encerrar sessão"
          >
            🚪 Sair
          </BotaoSecundarioStl>
        </UsuarioLadoStl>
      </NavContentStl>
    </NavHeaderStl>
  );
};
