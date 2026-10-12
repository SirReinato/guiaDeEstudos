import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { AdminPanel } from "./components/AdminPanel";
import { EditalManager } from "./components/EditalManager";
import { DailyStreakPlayer } from "./components/DailyStreakPlayer";
import { FlashcardManager } from "./components/FlashcardManager";
import { CicloEstudos3070 } from "./components/CicloEstudos3070";
import { MiniIDEArena } from "./components/MiniIDEArena";
import { editaisService, type EditalCompleto } from "./services/editaisService";
import {
  flashcardsService,
  type FlashcardComTopico,
} from "./services/flashcardsService";
import { supabase } from "./services/supabase";
import {
  theme,
  ConteinerGeral,
  TitulosPrincipaisStl,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoSecundarioStl,
  CardStl,
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

const AbaNavegacaoContainerStl = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
  max-width: 1100px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const AbaBotaoStl = styled.button<{ $ativa: boolean }>`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.pp};
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  background: ${(props) =>
    props.$ativa ? theme.colors.gradients.btnPrimario : "transparent"};
  color: ${theme.colors.textos.claroPrincipal};
  border: ${(props) =>
    props.$ativa ? `1px solid ${theme.colors.marfim}` : theme.colors.borders.suave};
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: ${theme.colors.marfim};
  }
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
  const [mostrarPainelAdmin, setMostrarPainelAdmin] = useState<boolean>(false);
  const [abaAtiva, setAbaAtiva] = useState<
    "ide" | "ciclo3070" | "streak" | "flashcards" | "editais" | "overview"
  >("ide");

  // Editais
  const [editais, setEditais] = useState<EditalCompleto[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<EditalCompleto | null>(null);

  // Flashcards & Streak
  const [cards, setCards] = useState<FlashcardComTopico[]>([]);
  const [cardsRevisadosHoje, setCardsRevisadosHoje] = useState<number>(0);
  const META_DIARIA = 5;

  const carregarEditais = useCallback(async () => {
    if (!user) return;
    const { data } = await editaisService.listarEditais();
    if (data) {
      setEditais(data);
      if (editalSelecionado) {
        const atualizado = data.find((e) => e.id === editalSelecionado.id) || null;
        setEditalSelecionado(atualizado);
      } else if (data.length > 0) {
        setEditalSelecionado(data[0]);
      }
    }
  }, [user, editalSelecionado]);

  const carregarFlashcards = useCallback(async () => {
    if (!user) return;
    const { data } = await flashcardsService.listarFlashcards(user.id);
    if (data) {
      setCards(data);
    }
    const { data: streakData } = await flashcardsService.obterStreak(user.id);
    if (streakData) {
      setCardsRevisadosHoje(streakData.cards_revisados || 0);
    }
  }, [user]);

  useEffect(() => {
    const testarConexao = async () => {
      try {
        await supabase.from("profiles").select("count", { count: "exact", head: true });
        setSupabaseConectado(true);
      } catch (err) {
        console.error("Erro ping:", err);
      }
    };
    testarConexao();
  }, []);

  useEffect(() => {
    if (user) {
      carregarEditais();
      carregarFlashcards();
    }
  }, [user, carregarEditais, carregarFlashcards]);

  const handleResponderCard = async (card: FlashcardComTopico, qualidade: 0 | 3 | 4 | 5) => {
    await flashcardsService.responderFlashcard(card, qualidade);
    setCardsRevisadosHoje((prev) => prev + 1);
    await carregarFlashcards();
  };

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

      {/* Sessão do Usuário */}
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

          {/* Painel Administrativo de Usuários */}
          {isAdmin && mostrarPainelAdmin && <AdminPanel />}

          {/* Bloqueio se pendente */}
          {isPending && (
            <BloqueioAvisoStl>
              <TitulosSecundariosStl style={{ fontSize: "1.3rem", color: "#FFB74D" }}>
                ⏳ Cadastro em Análise
              </TitulosSecundariosStl>
              <ParagrafosStl style={{ marginTop: "0.75rem" }}>
                Olá, <strong>{profile?.username}</strong>! Sua solicitação está aguardando a aprovação de <strong>SirReinato</strong>.
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

          {/* Navegação e Conteúdo de Estudos */}
          {!isPending && !isRejected && (
            <>
              <AbaNavegacaoContainerStl>
                <AbaBotaoStl
                  $ativa={abaAtiva === "ide"}
                  onClick={() => setAbaAtiva("ide")}
                >
                  💻 Mini-IDE (Desafios TI)
                </AbaBotaoStl>
                <AbaBotaoStl
                  $ativa={abaAtiva === "ciclo3070"}
                  onClick={() => setAbaAtiva("ciclo3070")}
                >
                  🎯 Ciclo 30/70
                </AbaBotaoStl>
                <AbaBotaoStl
                  $ativa={abaAtiva === "streak"}
                  onClick={() => setAbaAtiva("streak")}
                >
                  ⚡ Dose Diária (Anki)
                </AbaBotaoStl>
                <AbaBotaoStl
                  $ativa={abaAtiva === "flashcards"}
                  onClick={() => setAbaAtiva("flashcards")}
                >
                  🗂️ Cards ({cards.length})
                </AbaBotaoStl>
                <AbaBotaoStl
                  $ativa={abaAtiva === "editais"}
                  onClick={() => setAbaAtiva("editais")}
                >
                  📋 Editais ({editais.length})
                </AbaBotaoStl>
                <AbaBotaoStl
                  $ativa={abaAtiva === "overview"}
                  onClick={() => setAbaAtiva("overview")}
                >
                  📊 Próximas Etapas
                </AbaBotaoStl>
              </AbaNavegacaoContainerStl>

              {/* ABA ATIVA: MINI-IDE DE CONCURSOS */}
              {abaAtiva === "ide" && (
                <MiniIDEArena editalAtivo={editalSelecionado} />
              )}

              {/* ABA: CICLO 30/70 */}
              {abaAtiva === "ciclo3070" && (
                <CicloEstudos3070 editalAtivo={editalSelecionado} />
              )}

              {/* ABA: SESSÃO DIÁRIA INTERATIVA */}
              {abaAtiva === "streak" && (
                <DailyStreakPlayer
                  cards={cards}
                  onResponder={handleResponderCard}
                  cardsRevisadosHoje={cardsRevisadosHoje}
                  metaDiaria={META_DIARIA}
                />
              )}

              {/* ABA: GERENCIAMENTO DE CARDS */}
              {abaAtiva === "flashcards" && (
                <FlashcardManager
                  editalAtivo={editalSelecionado}
                  cards={cards}
                  onRecarregar={carregarFlashcards}
                />
              )}

              {/* ABA: GESTÃO DE EDITAIS */}
              {abaAtiva === "editais" && (
                <EditalManager
                  editais={editais}
                  onRecarregar={carregarEditais}
                  editalSelecionado={editalSelecionado}
                  onSelecionarEdital={(e) => setEditalSelecionado(e)}
                />
              )}

              {/* ABA: VISÃO GERAL */}
              {abaAtiva === "overview" && (
                <CardStl $destaqueBorda style={{ maxWidth: "1100px", margin: "1rem 0" }}>
                  <TitulosSecundariosStl>Ciclo de Estudos TI em Andamento</TitulosSecundariosStl>
                  <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                    Status atual do projeto:
                  </ParagrafosStl>

                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <ParagrafosStl>✅ <strong>Etapa 1</strong>: Design System (Dark/Café, Styled-Components, Contraste AAA).</ParagrafosStl>
                    <ParagrafosStl>✅ <strong>Etapa 2</strong>: Supabase (Auth com Login de Username, RLS, Painel de ADM para SirReinato).</ParagrafosStl>
                    <ParagrafosStl>✅ <strong>Etapa 3</strong>: Mapeador de Edital & Árvore Hierárquica de Disciplinas e Tópicos.</ParagrafosStl>
                    <ParagrafosStl>✅ <strong>Etapa 4</strong>: Dose Diária (Micro-learning, Repetição Espaçada SM-2, Streak de 5 cards diários, Flip 3D).</ParagrafosStl>
                    <ParagrafosStl>✅ <strong>Etapa 5</strong>: Ciclo 30/70 (30% Teoria Ativa em Markdown + 70% Bateria de Questões comentadas de bancas).</ParagrafosStl>
                    <ParagrafosStl>⚡ <strong>Etapa 6 (Ativa)</strong>: Mini-IDE & Desafios Práticos de Código para TI (SQL, Python, JS).</ParagrafosStl>
                    <ParagrafosStl>⏳ <strong>Etapa 7 (Próxima)</strong>: Laboratório de Redação & Discursivas Técnicas de TI.</ParagrafosStl>
                  </div>
                </CardStl>
              )}
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
