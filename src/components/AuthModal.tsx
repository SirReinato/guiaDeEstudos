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
    color: rgba(225, 220, 201, 0.4);
  }
`;

const MensagemFeedbackStl = styled.div<{ $tipo: "erro" | "sucesso" }>`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: ${theme.fontSize.paragrafos.pp};
  font-family: ${theme.fontsFamily.paragrafos};
  background-color: ${(props) =>
    props.$tipo === "erro" ? "rgba(180, 40, 40, 0.25)" : "rgba(40, 160, 80, 0.25)"};
  border: 1px solid
    ${(props) => (props.$tipo === "erro" ? "#E57373" : "#81C784")};
  color: ${theme.colors.textos.claroPrincipal};
  text-align: center;
`;

export const AuthModal: React.FC = () => {
  const { signInWithPassword, signUpWithPassword, loading } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [feedback, setFeedback] = useState<{ texto: string; tipo: "erro" | "sucesso" } | null>(
    null
  );
  const [enviando, setEnviando] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setEnviando(true);

    try {
      if (isLogin) {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setFeedback({ texto: `Erro no login: ${error.message}`, tipo: "erro" });
        } else {
          setFeedback({ texto: "Login realizado com sucesso!", tipo: "sucesso" });
        }
      } else {
        const { error } = await signUpWithPassword(email, password);
        if (error) {
          setFeedback({ texto: `Erro no cadastro: ${error.message}`, tipo: "erro" });
        } else {
          setFeedback({
            texto: "Cadastro efetuado! Verifique seu email para confirmação.",
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
          {isLogin ? "Acessar Plataforma" : "Criar Nova Conta"}
        </TitulosSecundariosStl>
        <BadgeStl>{isLogin ? "Supabase Auth" : "Novo Aluno"}</BadgeStl>
      </div>

      <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
        {isLogin
          ? "Entre com suas credenciais para sincronizar seu histórico."
          : "Cadastre-se para acompanhar seu streak e simulados."}
      </ParagrafosStl>

      {feedback && (
        <MensagemFeedbackStl $tipo={feedback.tipo} style={{ marginTop: "1rem" }}>
          {feedback.texto}
        </MensagemFeedbackStl>
      )}

      <FormContainerStl onSubmit={handleSubmit}>
        <CampoGrupoStl>
          <RotuloStl>Email</RotuloStl>
          <InputStl
            type="email"
            required
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {enviando ? "Processando..." : isLogin ? "Entrar na Plataforma" : "Cadastrar Conta"}
        </BotaoPrimarioStl>

        <BotaoSecundarioStl
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setFeedback(null);
          }}
        >
          {isLogin ? "Não tem conta? Cadastre-se" : "Já possui conta? Fazer Login"}
        </BotaoSecundarioStl>
      </FormContainerStl>
    </CardStl>
  );
};
