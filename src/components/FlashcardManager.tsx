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
  editalAtivo: EditalCompleto | null;
  cards: FlashcardComTopico[];
  onRecarregar: () => void;
}

export const FlashcardManager: React.FC<Props> = ({
  editalAtivo,
  cards,
  onRecarregar,
}) => {
  const { user } = useAuth();
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [topicoId, setTopicoId] = useState<string>("");
  const [salvando, setSalvando] = useState(false);

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

    for (const c of cardsExemplo) {
      await flashcardsService.criarFlashcard({
        userId: user.id,
        frente: c.frente,
        verso: c.verso,
      });
    }
    onRecarregar();
  };

  return (
    <CardStl $destaqueBorda style={{ maxWidth: "750px", margin: "1.5rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <BadgeStl>Banco de Flashcards</BadgeStl>
          <TitulosSecundariosStl style={{ marginTop: "0.4rem" }}>
            Criar & Gerenciar Flashcards
          </TitulosSecundariosStl>
        </div>
        <BotaoSecundarioStl style={{ fontSize: "0.8rem" }} onClick={handleCarregarExemplosTI}>
          ⚡ Inserir 5 Exemplos de TI
        </BotaoSecundarioStl>
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
        <TitulosSecundariosStl style={{ fontSize: "1.15rem" }}>
          Cards Cadastrados ({cards.length})
        </TitulosSecundariosStl>

        {cards.length === 0 ? (
          <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
            Nenhum card cadastrado. Adicione um acima ou clique em "Inserir 5 Exemplos de TI".
          </ParagrafosStl>
        ) : (
          <CardsListaStl>
            {cards.map((c) => (
              <CardItemLinhaStl key={c.id}>
                <div style={{ flex: 1 }}>
                  <ParagrafosStl style={{ fontWeight: 600 }}>{c.frente}</ParagrafosStl>
                  <ParagrafosStl $secundario style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                    Intervalo: {c.intervalo_dias}d • Facilidade: {c.fator_facilidade} • Repetições: {c.repeticoes}
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
