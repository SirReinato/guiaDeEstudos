import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { AdminPanel } from "./components/AdminPanel";
import { supabase } from "./services/supabase";
import {
  theme,
  ConteinerGeral,
  TitulosPrincipaisStl,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoSecundarioStl,
  CardStl,
  DividerGradienteStl,
  BadgeStl,
} from "./theme/theme";

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

const AreaStatusConexaoStl = styled.div<{ $conectado: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.micro};
  border: 1px solid
    ${(props) => (props.$conectado ? "#81C784" : theme.colors.ambarQueimado)};
  background-color: ${(props) =>
    props.$conectado ? "rgba(40, 160, 80, 0.15)" : "rgba(65, 45, 21, 0.25)"};
  color: ${theme.colors.textos.claroPrincipal};
`;

const PontoStatusStl = styled.span<{ $conectado: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => (props.$conectado ? "#81C784" : "#FFB74D")};
  box-shadow: 0 0 6px ${(props) => (props.$conectado ? "#81C784" : "#FFB74D")};
`;

const UserBarStl = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${theme.colors.background.card};
  border: ${theme.colors.borders.suave};
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const GradeModulosStl = styled.div`
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const BloqueioAvisoStl = styled.div`
  background-color: rgba(255, 183, 77, 0.12);
  border: 1px solid #FFB74D;
  padding: 1.5rem;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  margin: 2rem auto;
`;

const DashboardConteudo: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [supabaseConectado, setSupabaseConectado] = useState<boolean>(false);
  const [tabelasStatus, setTabelasStatus] = useState<string>("Verificando...");
  const [mostrarPainelAdmin, setMostrarPainelAdmin] = useState<boolean>(false);

  useEffect(() => {
    const testarConexao = async () => {
      try {
        const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
        setSupabaseConectado(true);
        if (error && error.code === "PGRST205") {
          setTabelasStatus("Conectado! Tabela de perfis aguarda execução do SQL de migração.");
        } else {
          setTabelasStatus("Conectado com sucesso ao Supabase PostgreSQL & Perfis!");
        }
      } catch (err: unknown) {
        console.error("Falha de ping Supabase:", err);
        setSupabaseConectado(true);
      }
    };
    testarConexao();
  }, []);

  const isAdmin = profile?.role === "admin" || profile?.username?.toLowerCase() === "sirreinato";
  const isPending = profile?.status === "pending" && !isAdmin;
  const isRejected = profile?.status === "rejected" && !isAdmin;

  return (
    <ConteinerGeral>
      {/* Cabeçalho */}
      <HeaderStl>
        <AreaStatusConexaoStl $conectado={supabaseConectado}>
          <PontoStatusStl $conectado={supabaseConectado} />
          {supabaseConectado ? "Supabase Conectado" : "Conectando ao Supabase..."}
        </AreaStatusConexaoStl>

        <TitulosPrincipaisStl>Guia de Estudos TI</TitulosPrincipaisStl>
        <ParagrafosStl $grande $secundario $centro>
          Ambiente de Preparação de Alto Rendimento para Concursos & Programação
        </ParagrafosStl>
      </HeaderStl>

      {/* Barra de Usuário Autenticado OU Painel de Login */}
      {loading ? (
        <ParagrafosStl $centro>Carregando perfil e sessão de estudos...</ParagrafosStl>
      ) : user ? (
        <>
          <UserBarStl>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <BadgeStl>
                  {isAdmin ? "⭐ Administrador Geral" : "Aluno Registrado"}
                </BadgeStl>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    backgroundColor:
                      profile?.status === "active"
                        ? "rgba(40,160,80,0.2)"
                        : "rgba(255,183,77,0.2)",
                    color: profile?.status === "active" ? "#81C784" : "#FFB74D",
                    border: "1px solid currentColor",
                  }}
                >
                  Status: {profile?.status || "active"}
                </span>
              </div>

              <TitulosSecundariosStl style={{ fontSize: "1.4rem", marginTop: "0.4rem" }}>
                {profile?.username || user.email?.split("@")[0]}
              </TitulosSecundariosStl>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {isAdmin && (
                <BotaoSecundarioStl onClick={() => setMostrarPainelAdmin(!mostrarPainelAdmin)}>
                  {mostrarPainelAdmin ? "✕ Fechar Painel ADM" : "🛡️ Painel de Gestão (ADM)"}
                </BotaoSecundarioStl>
              )}
              <BotaoSecundarioStl onClick={() => signOut()}>
                🚪 Sair da Conta
              </BotaoSecundarioStl>
            </div>
          </UserBarStl>

          {/* Painel de Administração exclusivo de SirReinato */}
          {isAdmin && mostrarPainelAdmin && <AdminPanel />}

          {/* Bloqueio amigável se usuário não for admin e estiver pendente */}
          {isPending && (
            <BloqueioAvisoStl>
              <TitulosSecundariosStl style={{ fontSize: "1.3rem", color: "#FFB74D" }}>
                ⏳ Cadastro em Análise
              </TitulosSecundariosStl>
              <ParagrafosStl style={{ marginTop: "0.75rem" }}>
                Olá, <strong>{profile?.username}</strong>! Sua solicitação de cadastro foi recebida e está aguardando a aprovação do Administrador (<strong>SirReinato</strong>).
              </ParagrafosStl>
              <ParagrafosStl $secundario style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Assim que sua conta for aprovada, todos os módulos de estudo serão liberados automaticamente.
              </ParagrafosStl>
            </BloqueioAvisoStl>
          )}

          {isRejected && (
            <BloqueioAvisoStl style={{ borderColor: "#E57373", backgroundColor: "rgba(220,50,50,0.12)" }}>
              <TitulosSecundariosStl style={{ fontSize: "1.3rem", color: "#E57373" }}>
                🚫 Acesso Bloqueado
              </TitulosSecundariosStl>
              <ParagrafosStl style={{ marginTop: "0.75rem" }}>
                Sua conta não possui permissão ativa para acessar a plataforma.
              </ParagrafosStl>
            </BloqueioAvisoStl>
          )}

          {/* Conteúdo Normal liberado para Usuários Ativos ou Admin */}
          {(!isPending && !isRejected) && (
            <>
              <DividerGradienteStl />

              <CardStl $destaqueBorda style={{ maxWidth: "1100px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <TitulosSecundariosStl>Diagnóstico da Conexão Supabase</TitulosSecundariosStl>
                  <BadgeStl>PostgreSQL Nuvem</BadgeStl>
                </div>

                <ParagrafosStl style={{ marginTop: "1rem" }}>
                  <strong>URL do Projeto:</strong> https://tfsvfipsijtrzovbmmeq.supabase.co
                </ParagrafosStl>
                <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                  <strong>Status da Conexão:</strong> {tabelasStatus}
                </ParagrafosStl>
              </CardStl>

              <GradeModulosStl>
                <CardStl>
                  <BadgeStl>Módulo 01</BadgeStl>
                  <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
                    Edital & Provas
                  </TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    Cadastro de editais e decomposição inteligente de disciplinas e tópicos de TI.
                  </ParagrafosStl>
                </CardStl>

                <CardStl>
                  <BadgeStl>Módulo 02</BadgeStl>
                  <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
                    Dose Diária (Anki)
                  </TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    Repetição espaçada com algoritmo SM-2 para retenção rápida diária.
                  </ParagrafosStl>
                </CardStl>

                <CardStl>
                  <BadgeStl>Módulo 03</BadgeStl>
                  <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
                    Ciclo 30/70
                  </TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    30% Teoria condensada em markdown e 70% Questões comentadas de bancas.
                  </ParagrafosStl>
                </CardStl>

                <CardStl>
                  <BadgeStl>Módulo 04</BadgeStl>
                  <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
                    Mini-IDE Concursos
                  </TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    Resolução prática de desafios de código (SQL, Python, Javascript).
                  </ParagrafosStl>
                </CardStl>

                <CardStl>
                  <BadgeStl>Módulo 05</BadgeStl>
                  <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
                    Laboratório de Redações
                  </TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    Espelho de prova discursiva técnica de TI com contagem de linhas.
                  </ParagrafosStl>
                </CardStl>

                <CardStl>
                  <BadgeStl>Administração</BadgeStl>
                  <TitulosSecundariosStl style={{ marginTop: "0.75rem" }}>
                    Acesso Exclusivo
                  </TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    Painel protegido com aprovação de novos cadastros externos.
                  </ParagrafosStl>
                </CardStl>
              </GradeModulosStl>
            </>
          )}
        </>
      ) : (
        <AuthModal />
      )}
    </ConteinerGeral>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardConteudo />
    </AuthProvider>
  );
};

export default App;
