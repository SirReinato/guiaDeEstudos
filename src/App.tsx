import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { EditalProvider, useEdital } from "./contexts/EditalContext";
import { AuthModal } from "./components/AuthModal";
import { AdminPanel } from "./components/AdminPanel";
import { AppNavbar } from "./components/AppNavbar";
import { EditalSelectorBar } from "./components/EditalSelectorBar";
import { EditalManager } from "./components/EditalManager";
import { DailyStreakPlayer } from "./components/DailyStreakPlayer";
import { FlashcardManager } from "./components/FlashcardManager";
import { CicloEstudos3070 } from "./components/CicloEstudos3070";
import { MiniIDEArena } from "./components/MiniIDEArena";
import { RedacaoLaboratorio } from "./components/RedacaoLaboratorio";
import { ProvaFeitaManager } from "./components/ProvaFeitaManager";
import type { ProvaFeita } from "./types/database";

import {
  flashcardsService,
  type FlashcardComTopico,
} from "./services/flashcardsService";
import { supabase } from "./services/supabase";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  CardStl,
  GlassCardStl,
  PillBadgeStl,
} from "./theme/theme";

const AppLayoutStl = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${theme.colors.background.app};
  display: flex;
  flex-direction: column;
`;

const MainContentWrapperStl = styled.main`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 1rem 0.75rem 2.5rem;
  }
`;

const NavegacaoSegmentadaContainerStl = styled.nav`
  width: 100%;
  background: rgba(31, 21, 12, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(225, 220, 201, 0.12);
  border-radius: 12px;
  padding: 0.4rem;
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  scrollbar-width: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabBotaoStl = styled.button<{ $ativa: boolean }>`
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 0.65rem 1.15rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);

  background: ${(props) =>
    props.$ativa ? theme.colors.gradients.btnPrimario : "transparent"};
  color: ${(props) =>
    props.$ativa ? theme.colors.marfim : "rgba(225, 220, 201, 0.7)"};
  border: ${(props) =>
    props.$ativa ? `1px solid ${theme.colors.marfim}` : "1px solid transparent"};
  box-shadow: ${(props) =>
    props.$ativa ? "0 4px 14px rgba(65, 45, 21, 0.6)" : "none"};

  &:hover {
    color: ${theme.colors.marfim};
    background: ${(props) =>
      props.$ativa
        ? theme.colors.gradients.btnPrimarioHover
        : "rgba(65, 45, 21, 0.3)"};
    border-color: ${(props) =>
      props.$ativa ? theme.colors.marfim : "rgba(225, 220, 201, 0.2)"};
  }
`;

const TabBadgeCountStl = styled.span<{ $ativa: boolean }>`
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background-color: ${(props) =>
    props.$ativa ? "rgba(225, 220, 201, 0.25)" : "rgba(0, 0, 0, 0.5)"};
  color: ${theme.colors.marfim};
  border: 1px solid rgba(225, 220, 201, 0.15);
`;

const BloqueioAvisoStl = styled(GlassCardStl)`
  max-width: 650px;
  width: 100%;
  margin: 2.5rem auto;
  text-align: center;
  border-color: #ffb74d;
`;

const DashboardConteudo: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { editais, editalAtivo, selecionarEdital, carregarEditais } = useEdital();
  const [supabaseConectado, setSupabaseConectado] = useState<boolean>(false);
  const [mostrarPainelAdmin, setMostrarPainelAdmin] = useState<boolean>(false);
  const [abaAtiva, setAbaAtiva] = useState<
    | "redacao"
    | "ide"
    | "ciclo3070"
    | "streak"
    | "flashcards"
    | "editais"
    | "overview"
    | "provasFeitas"
  >("redacao");

  const [provaFeitaSelecionada, setProvaFeitaSelecionada] = useState<ProvaFeita | null>(null);

  // Flashcards & Streak
  const [cards, setCards] = useState<FlashcardComTopico[]>([]);
  const [cardsRevisadosHoje, setCardsRevisadosHoje] = useState<number>(0);
  const META_DIARIA = 5;

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
      carregarFlashcards();
    }
  }, [user, carregarFlashcards]);

  const handleResponderCard = async (card: FlashcardComTopico, qualidade: 0 | 3 | 4 | 5) => {
    await flashcardsService.responderFlashcard(card, qualidade);
    setCardsRevisadosHoje((prev) => prev + 1);
    await carregarFlashcards();
  };

  const isAdmin = profile?.role === "admin" || profile?.username?.toLowerCase() === "sirreinato";
  const isPending = profile?.status === "pending" && !isAdmin;
  const isRejected = profile?.status === "rejected" && !isAdmin;

  if (loading) {
    return (
      <AppLayoutStl style={{ alignItems: "center", justifyContent: "center" }}>
        <ParagrafosStl $grande $centro>
          Carregando ambiente de preparação de alto rendimento...
        </ParagrafosStl>
      </AppLayoutStl>
    );
  }

  if (!user) {
    return (
      <AppLayoutStl>
        <AuthModal />
      </AppLayoutStl>
    );
  }

  return (
    <AppLayoutStl>
      {/* 1. BARRA SUPERIOR FIXA MODERNA */}
      <AppNavbar
        conectado={supabaseConectado}
        mostrarPainelAdmin={mostrarPainelAdmin}
        onToggleAdmin={() => setMostrarPainelAdmin(!mostrarPainelAdmin)}
        onAbrirEditais={() => setAbaAtiva("editais")}
      />

      <MainContentWrapperStl>
        {/* Painel Administrativo de Usuários */}
        {isAdmin && mostrarPainelAdmin && <AdminPanel />}

        {/* Bloqueio se pendente ou rejeitado */}
        {isPending && (
          <BloqueioAvisoStl>
            <PillBadgeStl $variante="alerta">Cadastro em Análise</PillBadgeStl>
            <TitulosSecundariosStl style={{ fontSize: "1.3rem", color: "#FFB74D", marginTop: "1rem" }}>
              ⏳ Solicitação de Acesso em Análise
            </TitulosSecundariosStl>
            <ParagrafosStl style={{ marginTop: "0.75rem" }}>
              Olá, <strong>{profile?.username}</strong>! Seu cadastro foi recebido e aguarda a autorização de <strong>SirReinato</strong>.
            </ParagrafosStl>
          </BloqueioAvisoStl>
        )}

        {isRejected && (
          <BloqueioAvisoStl style={{ borderColor: "#E57373" }}>
            <PillBadgeStl $variante="alerta" style={{ color: "#E57373", borderColor: "#E57373" }}>
              Acesso Não Autorizado
            </PillBadgeStl>
            <TitulosSecundariosStl style={{ fontSize: "1.3rem", color: "#E57373", marginTop: "1rem" }}>
              🚫 Acesso Bloqueado
            </TitulosSecundariosStl>
            <ParagrafosStl style={{ marginTop: "0.75rem" }}>
              Sua conta não possui permissão ativa para acessar os simulados e laboratórios da plataforma.
            </ParagrafosStl>
          </BloqueioAvisoStl>
        )}

        {/* 2. ÁREA DE ESTUDOS (LIBERADA PARA USUÁRIO ATIVO) */}
        {!isPending && !isRejected && (
          <>
            {/* Hub Cockpit do Edital Foco */}
            <EditalSelectorBar onAbrirAbaEditais={() => setAbaAtiva("editais")} />

            {/* Barra de Navegação Segmentada Moderna */}
            <NavegacaoSegmentadaContainerStl aria-label="Navegação dos Módulos de Estudo">
              <TabBotaoStl
                $ativa={abaAtiva === "redacao"}
                onClick={() => setAbaAtiva("redacao")}
              >
                <span>✍️</span>
                <span>Oficina de Discursivas</span>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "ide"}
                onClick={() => setAbaAtiva("ide")}
              >
                <span>💻</span>
                <span>Mini-IDE (Código)</span>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "ciclo3070"}
                onClick={() => setAbaAtiva("ciclo3070")}
              >
                <span>🎯</span>
                <span>Ciclo 30/70</span>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "streak"}
                onClick={() => setAbaAtiva("streak")}
              >
                <span>⚡</span>
                <span>Dose Diária (Anki)</span>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "flashcards"}
                onClick={() => setAbaAtiva("flashcards")}
              >
                <span>🗂️</span>
                <span>Cards</span>
                <TabBadgeCountStl $ativa={abaAtiva === "flashcards"}>
                  {cards.length}
                </TabBadgeCountStl>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "editais"}
                onClick={() => setAbaAtiva("editais")}
              >
                <span>📋</span>
                <span>Editais</span>
                <TabBadgeCountStl $ativa={abaAtiva === "editais"}>
                  {editais.length}
                </TabBadgeCountStl>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "provasFeitas"}
                onClick={() => setAbaAtiva("provasFeitas")}
              >
                <span>📝</span>
                <span>Provas Feitas</span>
              </TabBotaoStl>

              <TabBotaoStl
                $ativa={abaAtiva === "overview"}
                onClick={() => setAbaAtiva("overview")}
              >
                <span>📊</span>
                <span>Próximas Etapas</span>
              </TabBotaoStl>
            </NavegacaoSegmentadaContainerStl>

            {/* 3. CONTEÚDO DO MÓDULO ATIVO */}
            {abaAtiva === "redacao" && (
              <RedacaoLaboratorio editalAtivo={editalAtivo} />
            )}

            {abaAtiva === "ide" && (
              <MiniIDEArena editalAtivo={editalAtivo} />
            )}

            {abaAtiva === "ciclo3070" && (
              <CicloEstudos3070 editalAtivo={editalAtivo} />
            )}

            {abaAtiva === "streak" && (
              <DailyStreakPlayer
                cards={cards}
                onResponder={handleResponderCard}
                cardsRevisadosHoje={cardsRevisadosHoje}
                metaDiaria={META_DIARIA}
              />
            )}

            {abaAtiva === "flashcards" && (
              <FlashcardManager
                editalAtivo={editalAtivo}
                cards={cards}
                onRecarregar={carregarFlashcards}
              />
            )}

            {abaAtiva === "editais" && (
              <EditalManager
                editais={editais}
                onRecarregar={carregarEditais}
                editalSelecionado={editalAtivo}
                onSelecionarEdital={(e) => e && selecionarEdital(e.id)}
              />
            )}

            {abaAtiva === "provasFeitas" && (
              <ProvaFeitaManager
                provaSelecionada={provaFeitaSelecionada}
                onSelecionarProva={setProvaFeitaSelecionada}
                onRecarregar={() => {
                  // recarrega apenas localmente; a lista vem do próprio componente
                }}
              />
            )}

            {abaAtiva === "overview" && (
              <CardStl $destaqueBorda style={{ padding: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <PillBadgeStl $variante="sucesso">Arquitetura Completa</PillBadgeStl>
                    <TitulosSecundariosStl style={{ marginTop: "0.5rem" }}>
                      Guia de Estudos TI • Roadmap & Engenharia
                    </TitulosSecundariosStl>
                  </div>
                </div>

                <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
                  Todos os módulos encontram-se plenamente operacionais e integrados ao ecossistema:
                </ParagrafosStl>

                <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <ParagrafosStl>✅ <strong>Etapa 1</strong>: Design System Café/Dark, Styled-Components puro, Contraste AAA e Fontes Aldrich/Almarai.</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 2</strong>: Supabase (Auth por username 'SirReinato', RLS seguro sem recursão, Painel Administrativo com aprovação).</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 3</strong>: Mapeador de Edital & Árvore Hierárquica de Disciplinas e Tópicos com pesos de 1 a 5 estrelas.</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 4</strong>: Dose Diária (Micro-learning, Repetição Espaçada SM-2, Meta de 5 cards diários, Flip 3D).</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 5</strong>: Ciclo 30/70 (30% Teoria Ativa em Markdown + 70% Bateria de Questões comentadas).</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 6</strong>: Mini-IDE & Desafios Práticos de Código para TI (SQL, Python, JS com Monaco Editor).</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 7</strong>: Laboratório de Redação & Discursivas Técnicas de TI (Folha Pautada, Limite de Linhas, Espelho Oficial).</ParagrafosStl>
                  <ParagrafosStl>✅ <strong>Etapa 8</strong>: Inteligência Artificial (Google Gemini 3.8 Flash, Extração de PDF e Provas Anteriores com Retry 503).</ParagrafosStl>
                  <ParagrafosStl>🚀 <strong>Modo Edital Centralizado & Redesign Moderno</strong>: Toda a plataforma converge de forma intuitiva, fluida e responsiva ao concurso ativo.</ParagrafosStl>
                </div>
              </CardStl>
            )}
          </>
        )}
      </MainContentWrapperStl>
    </AppLayoutStl>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <EditalProvider>
        <DashboardConteudo />
      </EditalProvider>
    </AuthProvider>
  );
};

export default App;
