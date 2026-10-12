import React, { useState } from "react";
import styled from "styled-components";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  BadgeStl,
} from "../theme/theme";
import {
  flashcardsService,
  type FlashcardComTopico,
} from "../services/flashcardsService";
import { useAuth } from "../contexts/AuthContext";
import { useEdital } from "../contexts/EditalContext";
import { geminiService } from "../services/geminiService";
import type { EditalCompleto } from "../services/editaisService";

const FormContainerStl = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const TextareaStl = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.mm};
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    border-color: ${theme.colors.marfim};
    box-shadow: 0 0 0 2px rgba(225, 220, 201, 0.2);
  }
`;

const SelectStl = styled.select`
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.mm};
  box-sizing: border-box;
`;

const CardsListaStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const CardItemLinhaStl = styled.div`
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.suave};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

interface Props {
  editalAtivo?: EditalCompleto | null;
  cards: FlashcardComTopico[];
  onRecarregar: () => void;
}

export const FlashcardManager: React.FC<Props> = ({
  editalAtivo: propEditalAtivo,
  cards,
  onRecarregar,
}) => {
  const { user } = useAuth();
  const { editalAtivo: ctxEditalAtivo, topicoIdsEditalAtivo } = useEdital();
  const editalAtivo = propEditalAtivo !== undefined ? propEditalAtivo : ctxEditalAtivo;

  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [topicoId, setTopicoId] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [filtrarPorEdital, setFiltrarPorEdital] = useState<boolean>(true);

  // Lista todos os tópicos disponíveis no edital ativo
  const topicosDisponiveis =
    editalAtivo?.disciplinas?.flatMap((d) =>
      (d.topicos || []).map((t) => ({ ...t, disciplinaNome: d.nome }))
    ) || [];

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !frente.trim() || !verso.trim()) return;

    setSalvando(true);
    const { error } = await flashcardsService.criarFlashcard({
      userId: user.id,
      topicoId: topicoId || null,
      frente: frente.trim(),
      verso: verso.trim(),
    });

    if (error) {
      alert(`Erro ao criar flashcard: ${error.message}`);
    } else {
      setFrente("");
      setVerso("");
      onRecarregar();
    }
    setSalvando(false);
  };

  const handleGerarFlashcardsComIA = async () => {
    if (!user) return;
    if (!geminiService.temChave()) {
      alert("Chave Gemini API não detectada no .env.");
      return;
    }

    const topicoEscolhido = topicosDisponiveis.find((t) => t.id === topicoId) || topicosDisponiveis[0];
    if (!topicoEscolhido) {
      alert("Nenhum tópico encontrado no edital ativo para gerar flashcards.");
      return;
    }

    setGerandoIA(true);
    try {
      const novosCards = await geminiService.gerarFlashcardsParaTopico({
        disciplina: topicoEscolhido.disciplinaNome || "Tecnologia da Informação",
        topico: topicoEscolhido.titulo,
        banca: editalAtivo?.banca || "Cebraspe",
        quantidade: 3,
      });

      if (novosCards && novosCards.length > 0) {
        for (const c of novosCards) {
          await flashcardsService.criarFlashcard({
            userId: user.id,
            topicoId: topicoEscolhido.id,
            frente: c.frente,
            verso: c.verso,
          });
        }
        alert(`🎉 ${novosCards.length} flashcards gerados com sucesso pela IA para "${topicoEscolhido.titulo}"!`);
        onRecarregar();
      } else {
        alert("Não foi possível gerar flashcards neste momento. Tente novamente.");
      }
    } catch (err: any) {
      alert(`Erro ao gerar flashcards: ${err?.message || "Tente novamente"}`);
    } finally {
      setGerandoIA(false);
    }
  };

  const handleCarregarExemplosTI = async () => {
    if (!user) return;
    const cardsExemplo = [
      {
        frente: "O que diz a 3ª Forma Normal (3FN) em Bancos de Dados Relacionais?",
        verso: "Uma tabela está na 3FN se está na 2FN e nenhuma coluna não-chave depende transitivamente da chave primária (isto é: depende apenas da chave e de nada mais).",
      },
      {
        frente: "Em Redes de Computadores, qual a diferença entre TCP e UDP na camada de transporte?",
        verso: "O TCP é orientado a conexão, garante entrega ordenada e controle de fluxo (Three-way handshake). O UDP não é orientado a conexão, não garante entrega, priorizando baixa latência (streaming, DNS, VoIP).",
      },
      {
        frente: "No Git, o que faz exatamente o comando 'git cherry-pick <commit>'?",
        verso: "Aplica as alterações introduzidas por um commit específico da árvore em cima da branch atual (HEAD), gerando um novo commit correspondente.",
      },
      {
        frente: "O que é o Teorema CAP em Sistemas Distribuídos?",
        verso: "Estabelece que um sistema de dados distribuído só pode garantir no máximo 2 das 3 propriedades simultaneamente: Consistência (Consistency), Disponibilidade (Availability) e Tolerância a Partições (Partition Tolerance).",
      },
      {
        frente: "O que previne a injeção de SQL (SQL Injection) em aplicações backend?",
        verso: "Uso obrigatório de Consultas Parametrizadas (Prepared Statements / ORMs) e validação estrita de inputs, impedindo que entradas de usuários sejam interpretadas como instruções SQL.",
      },
    ];

    const topicoVinculo = topicoId || (topicosDisponiveis.length > 0 ? topicosDisponiveis[0].id : null);

    for (const c of cardsExemplo) {
      await flashcardsService.criarFlashcard({
        userId: user.id,
        topicoId: topicoVinculo,
        frente: c.frente,
        verso: c.verso,
      });
    }
    onRecarregar();
  };

  // Filtragem de cards por Edital Ativo
  const cardsFiltrados = cards.filter((c) => {
    if (!filtrarPorEdital || !editalAtivo) return true;
    if (!c.topico_id) return true; // Mostra gerais também
    return topicoIdsEditalAtivo.has(c.topico_id);
  });

  return (
    <CardStl $destaqueBorda style={{ maxWidth: "750px", margin: "1.5rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <BadgeStl>Banco de Flashcards</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.4rem" }}>
            Criar & Gerenciar Flashcards
          </TitulosSecundariosStl>
          {editalAtivo && (
            <ParagrafosStl $secundario style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              🎯 Focado no Edital: <strong>{editalAtivo.titulo}</strong> ({editalAtivo.banca})
            </ParagrafosStl>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {topicosDisponiveis.length > 0 && (
            <BotaoSecundarioStl
              style={{ fontSize: "0.8rem" }}
              onClick={handleGerarFlashcardsComIA}
              disabled={gerandoIA}
            >
              {gerandoIA ? "⏳ Criando com IA..." : "⚡ Gerar com IA (3 Cards)"}
            </BotaoSecundarioStl>
          )}
          <BotaoSecundarioStl style={{ fontSize: "0.8rem" }} onClick={handleCarregarExemplosTI}>
            + 5 Exemplos TI
          </BotaoSecundarioStl>
        </div>
      </div>

      <FormContainerStl onSubmit={handleSalvar}>
        {topicosDisponiveis.length > 0 && (
          <div>
            <label style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.3rem", display: "block" }}>
              Vincular a um Tópico do Edital (Opcional):
            </label>
            <SelectStl value={topicoId} onChange={(e) => setTopicoId(e.target.value)}>
              <option value="">Geral / Sem tópico específico</option>
              {topicosDisponiveis.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.disciplinaNome} ➔ {t.titulo}
                </option>
              ))}
            </SelectStl>
          </div>
        )}

        <div>
          <label style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.3rem", display: "block" }}>
            Frente (Pergunta ou Conceito-Chave):
          </label>
          <TextareaStl
            required
            placeholder="Ex: O que é idempotência em APIs RESTful?"
            value={frente}
            onChange={(e) => setFrente(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.3rem", display: "block" }}>
            Verso (Resposta / Mnemônico / Explicação):
          </label>
          <TextareaStl
            required
            placeholder="Ex: É a propriedade em que múltiplas requisições idênticas produzem o mesmo efeito no servidor que uma única requisição (ex: GET, PUT, DELETE)."
            value={verso}
            onChange={(e) => setVerso(e.target.value)}
          />
        </div>

        <BotaoPrimarioStl type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "➕ Adicionar Flashcard"}
        </BotaoPrimarioStl>
      </FormContainerStl>

      {/* Lista de Cards Cadastrados */}
      <div style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <TitulosSecundariosStl style={{ fontSize: "1.15rem" }}>
            Cards Cadastrados ({cardsFiltrados.length}{filtrarPorEdital && cards.length !== cardsFiltrados.length ? ` de ${cards.length}` : ""})
          </TitulosSecundariosStl>

          {editalAtivo && cards.length > 0 && (
            <BotaoSecundarioStl
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              onClick={() => setFiltrarPorEdital(!filtrarPorEdital)}
            >
              {filtrarPorEdital ? "👁️ Mostrar Todos da Conta" : "🎯 Filtrar pelo Edital Ativo"}
            </BotaoSecundarioStl>
          )}
        </div>

        {cardsFiltrados.length === 0 ? (
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            {filtrarPorEdital && cards.length > 0
              ? `Nenhum card vinculado aos tópicos de "${editalAtivo?.titulo}". Use "Gerar com IA" para criar cards deste edital ou clique em "Mostrar Todos da Conta".`
              : 'Nenhum card cadastrado. Adicione um acima ou clique em "Inserir 5 Exemplos de TI".'}
          </ParagrafosStl>
        ) : (
          <CardsListaStl>
            {cardsFiltrados.map((c) => (
              <CardItemLinhaStl key={c.id}>
                <div style={{ flex: 1 }}>
                  <ParagrafosStl style={{ fontWeight: 600 }}>{c.frente}</ParagrafosStl>
                  <ParagrafosStl $secundario style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    Intervalo: {c.intervalo_dias}d • Facilidade: {c.fator_facilidade} • Repetições: {c.repeticoes}
                    {c.topicos?.titulo && ` • 📌 ${c.topicos.titulo}`}
                  </ParagrafosStl>
                </div>
                <BotaoSecundarioStl
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  onClick={async () => {
                    if (confirm("Excluir este flashcard?")) {
                      await flashcardsService.excluirFlashcard(c.id);
                      onRecarregar();
                    }
                  }}
                >
                  🗑️
                </BotaoSecundarioStl>
              </CardItemLinhaStl>
            ))}
          </CardsListaStl>
        )}
      </div>
    </CardStl>
  );
};
