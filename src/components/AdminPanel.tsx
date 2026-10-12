import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { supabase } from "../services/supabase";
import type { UserProfile } from "../types/database";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  BadgeStl,
} from "../theme/theme";

const TabelaStl = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.25rem;
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.pp};
`;

const ThStl = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  background-color: ${theme.colors.preto};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.titulos};
  border-bottom: ${theme.colors.borders.destaque};
  letter-spacing: 0.5px;
`;

const TdStl = styled.td`
  padding: 0.85rem 1rem;
  border-bottom: ${theme.colors.borders.suave};
  color: ${theme.colors.textos.claroPrincipal};
  vertical-align: middle;
`;

const StatusPillStl = styled.span<{ $status: "active" | "pending" | "rejected" }>`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.micro};
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: bold;
  text-transform: uppercase;
  background-color: ${(props) => {
    if (props.$status === "active") return "rgba(40, 160, 80, 0.2)";
    if (props.$status === "pending") return "rgba(255, 183, 77, 0.2)";
    return "rgba(220, 50, 50, 0.2)";
  }};
  color: ${(props) => {
    if (props.$status === "active") return "#81C784";
    if (props.$status === "pending") return "#FFB74D";
    return "#E57373";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$status === "active") return "#81C784";
      if (props.$status === "pending") return "#FFB74D";
      return "#E57373";
    }};
`;

const AcoesContainerStl = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const AdminPanel: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem(`Erro ao listar usuários: ${error.message}`);
    } else {
      setUsuarios((data as UserProfile[]) || []);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const alterarStatus = async (userId: string, novoStatus: "active" | "rejected") => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: novoStatus })
      .eq("id", userId);

    if (error) {
      alert(`Erro ao atualizar status: ${error.message}`);
    } else {
      carregarUsuarios();
    }
  };

  return (
    <CardStl $destaqueBorda style={{ maxWidth: "1100px", width: "100%", margin: "1.5rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <BadgeStl>Painel de Controle</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.5rem" }}>
            🛡️ Gestão de Acessos & Aprovações (Admin SirReinato)
          </TitulosSecundariosStl>
        </div>
        <BotaoSecundarioStl onClick={carregarUsuarios}>
          🔄 Atualizar Lista
        </BotaoSecundarioStl>
      </div>

      <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
        Aqui você aprova ou rejeita solicitações de usuários externos no formato
        <strong> nome.sobrenome</strong>. Usuários pendentes não têm acesso ao conteúdo dos estudos.
      </ParagrafosStl>

      {mensagem && (
        <ParagrafosStl style={{ color: "#FFB74D", marginTop: "1rem" }}>{mensagem}</ParagrafosStl>
      )}

      {carregando ? (
        <ParagrafosStl $centro style={{ padding: "2rem" }}>
          Carregando solicitações de usuários...
        </ParagrafosStl>
      ) : usuarios.length === 0 ? (
        <ParagrafosStl $centro $secundario style={{ padding: "2rem" }}>
          Nenhum usuário cadastrado no momento além do Administrador.
        </ParagrafosStl>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <TabelaStl>
            <thead>
              <tr>
                <ThStl>Usuário (Login)</ThStl>
                <ThStl>Função</ThStl>
                <ThStl>Status</ThStl>
                <ThStl>Ações</ThStl>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usr) => (
                <tr key={usr.id}>
                  <TdStl>
                    <strong>{usr.username}</strong>
                  </TdStl>
                  <TdStl>
                    {usr.role === "admin" ? "⭐ Administrador" : "Aluno / Estudante"}
                  </TdStl>
                  <TdStl>
                    <StatusPillStl $status={usr.status}>{usr.status}</StatusPillStl>
                  </TdStl>
                  <TdStl>
                    {usr.role === "admin" ? (
                      <ParagrafosStl $secundario style={{ fontSize: "0.8rem" }}>
                        Conta Root (Imutável)
                      </ParagrafosStl>
                    ) : (
                      <AcoesContainerStl>
                        {usr.status !== "active" && (
                          <BotaoPrimarioStl
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                            onClick={() => alterarStatus(usr.id, "active")}
                          >
                            ✓ Aprovar
                          </BotaoPrimarioStl>
                        )}
                        {usr.status !== "rejected" && (
                          <BotaoSecundarioStl
                            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                            onClick={() => alterarStatus(usr.id, "rejected")}
                          >
                            ✕ Bloquear
                          </BotaoSecundarioStl>
                        )}
                      </AcoesContainerStl>
                    )}
                  </TdStl>
                </tr>
              ))}
            </tbody>
          </TabelaStl>
        </div>
      )}
    </CardStl>
  );
};
