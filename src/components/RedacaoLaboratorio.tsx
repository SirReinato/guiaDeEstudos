import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  theme,
  TitulosSecundariosStl,
  ParagrafosStl,
  BotaoPrimarioStl,
  BotaoSecundarioStl,
  CardStl,
  BadgeStl,
  DividerGradienteStl,
} from "../theme/theme";
import {
  redacoesService,
  type TemaRedacaoComDetalhes,
} from "../services/redacoesService";
import { geminiService } from "../services/geminiService";
import { useEdital } from "../contexts/EditalContext";
import type { EditalCompleto } from "../services/editaisService";

const LayoutLaboratorioStl = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1rem auto;
`;

const SplitLaboratorioStl = styled.div`
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: ${theme.breakpoints.notebook}) {
    grid-template-columns: 1fr;
  }
`;

const PainelEnunciadoStl = styled.div`
  background-color: ${theme.colors.background.card};
  border: ${theme.colors.borders.suave};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 800px;
  overflow-y: auto;
`;

// Folha de Redação Pautada no Modo Invertido (Papel Marfim #E1DCC9)
const FolhaRedacaoWrapperStl = styled.div`
  background-color: ${theme.colors.background.invertido};
  color: ${theme.colors.textos.escuroPrincipal};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderFolhaStl = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${theme.colors.ambarQueimado};
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MetricasBadgeStl = styled.div`
  display: flex;
  gap: 0.75rem;
  font-family: ${theme.fontsFamily.titulos};
  font-size: 0.85rem;
  color: ${theme.colors.textos.escuroPrincipal};
`;

const LinhaContadorStl = styled.span<{ $estourou: boolean }>`
  font-weight: 700;
  color: ${(props) => (props.$estourou ? "#D32F2F" : theme.colors.ambarQueimado)};
`;

const AreaTextoRedacaoStl = styled.textarea`
  width: 100%;
  min-height: 480px;
  background-color: transparent;
  color: ${theme.colors.textos.escuroPrincipal};
  border: none;
  outline: none;
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: 1rem;
  line-height: 28px;
  box-sizing: border-box;
  resize: vertical;

  /* Simulação de linhas pautadas de folha de concurso */
  background-image: repeating-linear-gradient(
    transparent,
    transparent 27px,
    rgba(65, 45, 21, 0.2) 28px
  );
  background-attachment: local;
`;

const EspelhoCorrecaoBoxStl = styled.div`
  background-color: rgba(65, 45, 21, 0.08);
  border: 1px solid ${theme.colors.ambarQueimado};
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;
`;

const SelectStl = styled.select`
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.mm};
  box-sizing: border-box;
`;

interface Props {
  editalAtivo?: EditalCompleto | null;
}

export const RedacaoLaboratorio: React.FC<Props> = ({
  editalAtivo: propEditalAtivo,
}) => {
  const { editalAtivo: ctxEditalAtivo } = useEdital();
  const editalAtivo = propEditalAtivo !== undefined ? propEditalAtivo : ctxEditalAtivo;

  const [temas, setTemas] = useState<TemaRedacaoComDetalhes[]>([]);
  const [temaAtivoId, setTemaAtivoId] = useState<string>("");
  const [textoRedacao, setTextoRedacao] = useState<string>("");
  const [mostrarEspelho, setMostrarEspelho] = useState<boolean>(false);
  const [tempoSegundos, setTempoSegundos] = useState<number>(0);
  const [cronometroAtivo, setCronometroAtivo] = useState<boolean>(false);
  const [gerandoTemaIA, setGerandoTemaIA] = useState<boolean>(false);

  // Carregar temas de redação
  const carregarTemas = async () => {
    const { data } = await redacoesService.listarTemas();
    if (data && data.length > 0) {
      setTemas(data);
      if (!temaAtivoId) {
        setTemaAtivoId(data[0].id);
      }
    }
  };

  // Gerar Tema Discursivo com IA baseado nas matérias de alta relevância do Edital Ativo
  const handleGerarTemaComIA = async () => {
    if (!geminiService.temChave()) {
      alert("Chave Gemini API não detectada no .env.");
      return;
    }

    setGerandoTemaIA(true);
    try {
      const banca = editalAtivo?.banca || "Cebraspe";
      const orgao = editalAtivo?.orgao || editalAtivo?.titulo || "Tribunal de Contas / Bacen";

      // Filtra tópicos com peso de 3 a 5 estrelas
      const topicosPrioritarios =
        editalAtivo?.disciplinas
          ?.flatMap((d) =>
            (d.topicos || [])
              .filter((t) => (t.relevancia_banca || 0) >= 3)
              .map((t) => `${d.nome} - ${t.titulo}`)
          ) || [];

      const listaTopicos =
        topicosPrioritarios.length > 0
          ? topicosPrioritarios.slice(0, 5)
          : [
              "Arquitetura de Microsserviços e Padrões de Resiliência",
              "Bancos de Dados Relacionais e Não-Relacionais (NoSQL)",
              "Segurança da Informação, DevSecOps e OWASP Top 10",
            ];

      const novo = await geminiService.gerarTemaDiscursivaParaEdital({
        banca,
        orgao,
        topicosPrincipais: listaTopicos,
      });

      if (novo) {
        const primeiroTopicoId = editalAtivo?.disciplinas?.[0]?.topicos?.[0]?.id || null;
        const { data: criado } = await redacoesService.criarTema({
          topicoId: primeiroTopicoId,
          titulo: `${novo.titulo} (${banca})`,
          enunciado: novo.enunciado,
          limiteLinhas: novo.limiteLinhas || 30,
          padraoResposta: novo.padraoResposta,
        });

        if (criado) {
          await carregarTemas();
          setTemaAtivoId(criado.id);
          setMostrarEspelho(false);
          alert(`✨ Novo tema discursivo inédito criado no padrão oficial da banca ${banca}!`);
        }
      }
    } catch (err: any) {
      alert(`Falha ao gerar tema discursivo: ${err?.message || "Tente novamente"}`);
    } finally {
      setGerandoTemaIA(false);
    }
  };

  useEffect(() => {
    carregarTemas();
  }, []);

  // Cronômetro de simulação
  useEffect(() => {
    let interval: number | null = null;
    if (cronometroAtivo) {
      interval = window.setInterval(() => {
        setTempoSegundos((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [cronometroAtivo]);

  const temaAtual = temas.find((t) => t.id === temaAtivoId);

  // Métricas de texto
  const totalPalavras = textoRedacao.trim() ? textoRedacao.trim().split(/\s+/).length : 0;
  // Conta quebras de linha reais ou aproximação por tamanho
  const linhasTexto = textoRedacao ? textoRedacao.split("\n").length : 0;
  const limiteLinhas = temaAtual?.limite_linhas || 30;
  const estourouLinhas = linhasTexto > limiteLinhas;

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  // Semear temas clássicos de discursiva de TI
  const handleSemearTemasTI = async () => {
    const temasExemplo = [
      {
        titulo: "Arquitetura de Microsserviços vs Monolito (Concurso TCU / Bacen)",
        limiteLinhas: 30,
        enunciado: `Discorra sobre a transição de uma Arquitetura Monolítica para Microsserviços em um órgão público. Em seu texto, aborde obrigatoriamente:
1. As principais vantagens de escalabilidade e isolamento de falhas proporcionadas pelos microsserviços;
2. Os desafios operacionais introduzidos (consistência eventual, tracing distribuído e complexidade de deploy);
3. O papel dos padrões Circuit Breaker e API Gateway na resiliência do sistema.
(Extensão máxima: 30 linhas).`,
        padraoResposta: `PADRÃO DE RESPOSTA ESPERADO PELA BANCA:
1. Vantagens: Decomposição por domínio de negócio (DDD), independência de deploys, escalabilidade horizontal seletiva de serviços críticos e redução do raio de impacto em falhas.
2. Desafios: O candidato deve mencionar a perda de transações ACID globais e a necessidade de consistência eventual (Padrão Saga), observabilidade complexa exigindo tracing distribuído (OpenTelemetry/Jaeger) e governança de APIs.
3. Resiliência: O API Gateway atua como ponto único de entrada, autenticação e roteamento inteligente; o Circuit Breaker (ex: Resilience4j) previne falhas em cascata ao abrir o circuito quando um microsserviço dependente degrada.`,
      },
      {
        titulo: "Segurança & DevSecOps: Implementação de Pipeline CI/CD Seguro",
        limiteLinhas: 30,
        enunciado: `A segurança da informação é requisito indispensável no ciclo de desenvolvimento de software moderno. Redija um texto técnico abordando:
1. O conceito de 'Shift-Left Security' na cultura DevSecOps;
2. As diferenças e papéis das análises SAST (Static Application Security Testing) e DAST (Dynamic Application Security Testing);
3. Práticas recomendadas para gestão de segredos e credenciais em repositórios e pipelines.
(Extensão máxima: 30 linhas).`,
        padraoResposta: `PADRÃO DE RESPOSTA ESPERADO PELA BANCA:
1. Shift-Left: Incorporação de testes e políticas de segurança desde as fases iniciais de concepção e escrita do código, reduzindo custos de remediação antes do ambiente de produção.
2. SAST vs DAST: SAST analisa o código-fonte em repouso procurando vulnerabilidades (white-box); DAST analisa a aplicação em execução contra ataques simulados em tempo de execução (black-box).
3. Gestão de Segredos: Proibição estrita de hardcoded credentials no Git; uso de ferramentas de Secret Management (ex: HashiCorp Vault, AWS Secrets Manager) e pre-commit hooks de varredura (ex: GitGuardian/TruffleHog).`,
      },
    ];

    for (const t of temasExemplo) {
      await redacoesService.criarTema({
        titulo: t.titulo,
        enunciado: t.enunciado,
        limiteLinhas: t.limiteLinhas,
        padraoResposta: t.padraoResposta,
      });
    }

    const { data } = await redacoesService.listarTemas();
    if (data && data.length > 0) {
      setTemas(data);
      setTemaAtivoId(data[0].id);
    }
  };

  return (
    <LayoutLaboratorioStl>
      {/* Barra Superior */}
      <CardStl $destaqueBorda style={{ padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <BadgeStl>Oficina de Discursivas TI</BadgeStl>
              {editalAtivo && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(65, 45, 21, 0.6)",
                    border: "1px solid rgba(225, 220, 201, 0.2)",
                    color: theme.colors.textos.claroPrincipal,
                  }}
                >
                  🎯 Edital: <strong>{editalAtivo.titulo}</strong> ({editalAtivo.banca})
                </span>
              )}
            </div>
            <TitulosSecundariosStl style={{ fontSize: "1.25rem", marginTop: "0.25rem" }}>
              Simulador de Prova Discursiva & Redação Técnica
            </TitulosSecundariosStl>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {temas.length > 0 && (
              <SelectStl
                value={temaAtivoId}
                onChange={(e) => {
                  setTemaAtivoId(e.target.value);
                  setMostrarEspelho(false);
                }}
              >
                {temas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titulo}
                  </option>
                ))}
              </SelectStl>
            )}

            <BotaoPrimarioStl
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
              onClick={handleGerarTemaComIA}
              disabled={gerandoTemaIA}
            >
              {gerandoTemaIA ? "⏳ Criando Discursiva..." : "✨ Gerar Discursiva com IA"}
            </BotaoPrimarioStl>

            <BotaoSecundarioStl style={{ fontSize: "0.8rem" }} onClick={handleSemearTemasTI}>
              ⚡ 2 Exemplos TI
            </BotaoSecundarioStl>
          </div>
        </div>
      </CardStl>

      {/* Grid Split: Enunciado (Esquerda) e Folha Pautada (Direita) */}
      <SplitLaboratorioStl>
        {/* COLUNA ESQUERDA: TEMA & PADRÃO DE RESPOSTA */}
        <PainelEnunciadoStl>
          {temaAtual ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <BadgeStl>DISCURSIVA DE TI</BadgeStl>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                  Limite: {temaAtual.limite_linhas} linhas
                </span>
              </div>

              <TitulosSecundariosStl style={{ fontSize: "1.2rem" }}>
                {temaAtual.titulo}
              </TitulosSecundariosStl>

              <ParagrafosStl style={{ lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-line" }}>
                {temaAtual.enunciado}
              </ParagrafosStl>

              <DividerGradienteStl style={{ margin: "1rem 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <BotaoSecundarioStl
                  style={{ fontSize: "0.85rem", width: "100%" }}
                  onClick={() => setMostrarEspelho(!mostrarEspelho)}
                >
                  {mostrarEspelho ? "🙈 Ocultar Espelho da Banca" : "🔍 Ver Espelho de Correção Oficial"}
                </BotaoSecundarioStl>
              </div>

              {mostrarEspelho && (
                <EspelhoCorrecaoBoxStl>
                  <strong style={{ color: theme.colors.ambarQueimado, display: "block", marginBottom: "0.5rem" }}>
                    Critérios e Expectativa de Resposta da Banca:
                  </strong>
                  <p style={{ fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {temaAtual.padrao_resposta}
                  </p>
                </EspelhoCorrecaoBoxStl>
              )}
            </>
          ) : (
            <ParagrafosStl $secundario style={{ textAlign: "center", padding: "2rem" }}>
              Nenhum tema disponível. Clique no botão "Carregar Temas de TI" para iniciar uma discursiva!
            </ParagrafosStl>
          )}
        </PainelEnunciadoStl>

        {/* COLUNA DIREITA: FOLHA PAUTADA INVERTIDA */}
        <FolhaRedacaoWrapperStl>
          <HeaderFolhaStl>
            <div>
              <strong style={{ fontSize: "1.1rem" }}>Folha de Respostas Discursiva</strong>
              <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Simulação Real de Concurso</div>
            </div>

            <MetricasBadgeStl>
              <span>⏱️ {formatarTempo(tempoSegundos)}</span>
              <span>📝 {totalPalavras} palavras</span>
              <LinhaContadorStl $estourou={estourouLinhas}>
                📏 {linhasTexto}/{limiteLinhas} linhas
              </LinhaContadorStl>
            </MetricasBadgeStl>
          </HeaderFolhaStl>

          {/* Área de Escrita Pautada */}
          <AreaTextoRedacaoStl
            placeholder="Comece a redigir seu texto técnico aqui. Respeite a coesão, a norma culta e os tópicos obrigatórios do edital..."
            value={textoRedacao}
            onChange={(e) => {
              setTextoRedacao(e.target.value);
              if (!cronometroAtivo) setCronometroAtivo(true);
            }}
          />

          {estourouLinhas && (
            <div style={{ color: "#D32F2F", fontSize: "0.85rem", fontWeight: "bold" }}>
              ⚠️ Atenção: Você ultrapassou o limite máximo de {limiteLinhas} linhas da banca!
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <BotaoSecundarioStl
              style={{ fontSize: "0.8rem", color: theme.colors.textos.escuroPrincipal, borderColor: theme.colors.ambarQueimado }}
              onClick={() => {
                setCronometroAtivo(!cronometroAtivo);
              }}
            >
              {cronometroAtivo ? "⏸ Pausar Tempo" : "▶ Iniciar Tempo"}
            </BotaoSecundarioStl>

            <BotaoPrimarioStl
              style={{ fontSize: "0.85rem" }}
              onClick={() => {
                setMostrarEspelho(true);
                alert(`Redação salva! Você redigiu ${totalPalavras} palavras em ${linhasTexto} linhas no tempo de ${formatarTempo(tempoSegundos)}.`);
              }}
            >
              ✓ Finalizar & Avaliar com Espelho
            </BotaoPrimarioStl>
          </div>
        </FolhaRedacaoWrapperStl>
      </SplitLaboratorioStl>
    </LayoutLaboratorioStl>
  );
};
