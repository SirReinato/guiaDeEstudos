import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  BadgeStl,
} from "../theme/theme";

const FormContainerStl = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  margin-top: 1.25rem;
`;

const CampoGrupoStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
`;

const RotuloStl = styled.label`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.pp};
  color: ${theme.colors.textos.claroPrincipal};
  letter-spacing: 0.5px;
`;

const InputStl = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.mm};
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: ${theme.colors.marfim};
    box-shadow: 0 0 0 2px rgba(225, 220, 201, 0.2);
  }

  &::placeholder {
    color: rgba(225, 220, 201, 0.35);
  }
`;

const MensagemFeedbackStl = styled.div<{ $tipo: "erro" | "sucesso" | "aviso" }>`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: ${theme.fontSize.paragrafos.pp};
  font-family: ${theme.fontsFamily.paragrafos};
  background-color: ${(props) => {
    if (props.$tipo === "erro") return "rgba(180, 40, 40, 0.25)";
    if (props.$tipo === "aviso") return "rgba(220, 160, 40, 0.25)";
    return "rgba(40, 160, 80, 0.25)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$tipo === "erro") return "#E57373";
      if (props.$tipo === "aviso") return "#FFD54F";
      return "#81C784";
    }};
  color: ${theme.colors.textos.claroPrincipal};
  text-align: center;
`;

export const AuthModal: React.FC = () => {
  const { signInWithUsername, signUpWithUsername, loading } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [feedback, setFeedback] = useState<{
    texto: string;
    tipo: "erro" | "sucesso" | "aviso";
  } | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setFeedback({ texto: "Informe o nome de usuário.", tipo: "erro" });
      return;
    }

    // Regra de cadastro para outros usuários: nome.sobrenome (exceto SirReinato)
    if (!isLogin && cleanUsername.toLowerCase() !== "sirreinato") {
      const padraoNomeSobrenome = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/;
      if (!padraoNomeSobrenome.test(cleanUsername)) {
        setFeedback({
          texto: "Para cadastro, utilize o formato 'nome.sobrenome' (ex: carlos.silva).",
          tipo: "aviso",
        });
        return;
      }
    }

    setEnviando(true);

    try {
      if (isLogin) {
        const { error } = await signInWithUsername(cleanUsername, password);
        if (error) {
          setFeedback({
            texto: `Falha ao entrar: ${error.message === "Invalid login credentials" ? "Usuário ou senha inválidos." : error.message}`,
            tipo: "erro",
          });
        }
      } else {
        const { error } = await signUpWithUsername(cleanUsername, password);
        if (error) {
          setFeedback({ texto: `Erro no cadastro: ${error.message}`, tipo: "erro" });
        } else {
          setFeedback({
            texto:
              cleanUsername.toLowerCase() === "sirreinato"
                ? "Conta de Administrador criada com sucesso! Você já está ativo."
                : "Solicitação de cadastro enviada! Aguarde a aprovação do Administrador (SirReinato).",
            tipo: "sucesso",
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setFeedback({ texto: `Falha: ${msg}`, tipo: "erro" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <CardStl $destaqueBorda style={{ maxWidth: "480px", width: "100%", margin: "1rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TitulosSecundariosStl>
          {isLogin ? "Acessar Plataforma" : "Solicitar Cadastro"}
        </TitulosSecundariosStl>
        <BadgeStl>{isLogin ? "Acesso Seguro" : "nome.sobrenome"}</BadgeStl>
      </div>

      <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
        {isLogin
          ? "Entre com seu usuário (login) e senha para continuar seus estudos."
          : "Cadastros devem usar o padrão 'nome.sobrenome' e aguardar aprovação do administrador."}
      </ParagrafosStl>

      {feedback && (
        <MensagemFeedbackStl $tipo={feedback.tipo} style={{ marginTop: "1rem" }}>
          {feedback.texto}
        </MensagemFeedbackStl>
      )}

      <FormContainerStl onSubmit={handleSubmit}>
        <CampoGrupoStl>
          <RotuloStl>Usuário (Login)</RotuloStl>
          <InputStl
            type="text"
            required
            autoCapitalize="none"
            placeholder={isLogin ? "SirReinato ou nome.sobrenome" : "ex: joao.silva"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </CampoGrupoStl>

        <CampoGrupoStl>
          <RotuloStl>Senha</RotuloStl>
          <InputStl
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </CampoGrupoStl>

        <BotaoPrimarioStl type="submit" disabled={enviando || loading}>
          {enviando ? "Autenticando..." : isLogin ? "Entrar na Plataforma" : "Solicitar Cadastro"}
        </BotaoPrimarioStl>

        <BotaoSecundarioStl
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setFeedback(null);
          }}
        >
          {isLogin ? "Não possui conta? Solicitar Cadastro" : "Já tem cadastro? Entrar"}
        </BotaoSecundarioStl>
      </FormContainerStl>
    </CardStl>
  );
};
