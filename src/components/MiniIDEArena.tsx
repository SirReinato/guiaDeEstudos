import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Editor from "@monaco-editor/react";
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
  desafiosCodigoService,
  type DesafioComTopico,
} from "../services/desafiosCodigoService";
import { geminiService } from "../services/geminiService";
import { useEdital } from "../contexts/EditalContext";
import type { EditalCompleto } from "../services/editaisService";
import { validarCodigoDesafio, type ValidacaoResultado } from "../utils/codeValidator";

const LayoutArenaStl = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1rem auto;
`;

const ArenaSplitStl = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
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
  max-height: 750px;
  overflow-y: auto;
`;

const EditorWrapperStl = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.preto};
  border: 1px solid ${theme.colors.ambarQueimado};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const ToolbarIDEStl = styled.div`
  background: ${theme.colors.gradients.btnPrimario};
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(225, 220, 201, 0.15);
`;

const ConsoleOutputStl = styled.div<{ $sucesso?: boolean }>`
  background-color: ${theme.colors.preto};
  border-top: 1px solid ${theme.colors.borders.destaque};
  padding: 1rem 1.25rem;
  font-family: ${theme.fontsFamily.codigo};
  font-size: 0.85rem;
  line-height: 1.6;
  min-height: 90px;
  max-height: 200px;
  overflow-y: auto;
  color: ${(props) => (props.$sucesso ? "#81C784" : "#FFD54F")};
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

export const MiniIDEArena: React.FC<{ editalAtivo?: EditalCompleto | null }> = ({
  editalAtivo: propEditalAtivo,
}) => {
  const { editalAtivo: ctxEditalAtivo } = useEdital();
  const editalAtivo = propEditalAtivo !== undefined ? propEditalAtivo : ctxEditalAtivo;

  const [desafios, setDesafios] = useState<DesafioComTopico[]>([]);
  const [desafioAtivoId, setDesafioAtivoId] = useState<string>("");
  const [codigoUsuario, setCodigoUsuario] = useState<string>("");
  const [resultadoValidacao, setResultadoValidacao] = useState<ValidacaoResultado | null>(null);
  const [verificando, setVerificando] = useState<boolean>(false);
  const [gerandoDesafioIA, setGerandoDesafioIA] = useState<boolean>(false);

  // Carregar lista de desafios
  const carregarDesafios = async () => {
    const { data } = await desafiosCodigoService.listarDesafios();
    if (data && data.length > 0) {
      setDesafios(data);
      if (!desafioAtivoId) {
        setDesafioAtivoId(data[0].id);
        setCodigoUsuario(data[0].codigo_inicial);
      }
    }
  };

  useEffect(() => {
    carregarDesafios();
  }, []);

  // Quando mudar o desafio selecionado, atualiza o código no editor
  const desafioAtual = desafios.find((d) => d.id === desafioAtivoId);

  const handleMudarDesafio = (id: string) => {
    setDesafioAtivoId(id);
    const escolhido = desafios.find((d) => d.id === id);
    if (escolhido) {
      setCodigoUsuario(escolhido.codigo_inicial);
    }
    setResultadoValidacao(null);
  };

  // Gerar Desafio de Código via IA no Estilo da Banca do Edital Ativo
  const handleGerarDesafioComIA = async (linguagem: "sql" | "python" | "javascript") => {
    if (!geminiService.temChave()) {
      alert("Chave Gemini API não detectada no .env.");
      return;
    }

    setGerandoDesafioIA(true);
    try {
      const banca = editalAtivo?.banca || "Cebraspe";
      const topicosTI =
        editalAtivo?.disciplinas
          ?.flatMap((d) => (d.topicos || []).map((t) => t.titulo))
          .join(", ") || "";

      const novo = await geminiService.gerarDesafioCodigoParaEdital({
        banca,
        linguagem,
        topico: topicosTI ? `Tópicos do edital: ${topicosTI.slice(0, 300)}` : undefined,
      });

      if (novo) {
        const primeiroTopicoId = editalAtivo?.disciplinas?.[0]?.topicos?.[0]?.id || null;
        const { data: criado } = await desafiosCodigoService.criarDesafio({
          topicoId: primeiroTopicoId,
          titulo: `${novo.titulo} (${banca})`,
          linguagem,
          enunciado: novo.enunciado,
          codigoInicial: novo.codigoInicial,
          solucaoEsperada: novo.solucaoEsperada,
          dicas: novo.dicas,
        });

        if (criado) {
          await carregarDesafios();
          handleMudarDesafio(criado.id);
          alert(`✨ Novo desafio prático de ${linguagem.toUpperCase()} criado para a banca ${banca}!`);
        }
      }
    } catch (err: any) {
      alert(`Falha ao gerar desafio: ${err?.message || "Tente novamente"}`);
    } finally {
      setGerandoDesafioIA(false);
    }
  };

  // Semear exemplos de TI clássicos de concurso
  const handleSemearDesafiosDemonstracao = async () => {
    const exemplos = [
      {
        titulo: "SQL: Filtro Agrupado com HAVING (Concurso Bacen / TCU)",
        linguagem: "sql" as const,
        enunciado:
          "Escreva uma consulta SQL que retorne o 'departamento_id' e a média salarial ('media_salario') dos funcionários da tabela 'funcionarios', considerando apenas os departamentos cuja média salarial seja superior a 8000. Ordene o resultado em ordem decrescente pela média salarial.",
        codigoInicial: `-- Escreva sua consulta SQL abaixo
SELECT departamento_id, AVG(salario) AS media_salario
FROM funcionarios
-- Complete com GROUP BY, HAVING e ORDER BY:
`,
        solucaoEsperada: "GROUP BY departamento_id HAVING AVG(salario) > 8000 ORDER BY media_salario DESC",
        dicas: [
          "Use GROUP BY departamento_id para agrupar os registros.",
          "Use HAVING AVG(salario) > 8000 para filtrar o grupo agregado.",
          "Finalize com ORDER BY media_salario DESC.",
        ],
      },
      {
        titulo: "Python: Detecção de Palíndromo (Concurso Dataprev)",
        linguagem: "python" as const,
        enunciado:
          "Implemente uma função 'eh_palindromo(texto: str) -> bool' que receba uma string, ignore espaços e diferenças entre maiúsculas e minúsculas, e retorne True se for palíndromo e False caso contrário.",
        codigoInicial: `def eh_palindromo(texto: str) -> bool:
    # Limpe os espaços e converta para minúsculo
    limpo = texto.replace(" ", "").lower()
    
    # Complete com a verificação de inversão:
    return limpo == limpo[::-1]
`,
        solucaoEsperada: "def eh_palindromo(texto: str) -> bool:\n    limpo = texto.replace(' ', '').lower()\n    return limpo == limpo[::-1]",
        dicas: ["Em Python, a fatia string[::-1] inverte a string com facilidade."],
      },
      {
        titulo: "JavaScript: Algoritmo de Busca Binária (Concurso BB TI)",
        linguagem: "javascript" as const,
        enunciado:
          "Complete a função 'buscaBinaria(arrayOrdenado, alvo)' que retorne o índice do elemento 'alvo' em O(log n) ou -1 caso não seja encontrado.",
        codigoInicial: `function buscaBinaria(arr, alvo) {
  let inicio = 0;
  let fim = arr.length - 1;

  while (inicio <= fim) {
    const meio = Math.floor((inicio + fim) / 2);
    if (arr[meio] === alvo) return meio;
    if (arr[meio] < alvo) inicio = meio + 1;
    else fim = meio - 1;
  }
  return -1;
}
`,
        solucaoEsperada: "while (inicio <= fim) { const meio = Math.floor((inicio + fim) / 2); if (arr[meio] === alvo) return meio; }",
        dicas: ["Mantenha ponteiros de inicio e fim, calculando o meio a cada iteração."],
      },
    ];

    for (const ex of exemplos) {
      await desafiosCodigoService.criarDesafio({
        titulo: ex.titulo,
        linguagem: ex.linguagem,
        enunciado: ex.enunciado,
        codigoInicial: ex.codigoInicial,
        solucaoEsperada: ex.solucaoEsperada,
        dicas: ex.dicas,
      });
    }

    const { data } = await desafiosCodigoService.listarDesafios();
    if (data && data.length > 0) {
      setDesafios(data);
      setDesafioAtivoId(data[0].id);
      setCodigoUsuario(data[0].codigo_inicial);
    }
  };

  const handleExecutarValidacao = () => {
    if (!desafioAtual) return;
    setVerificando(true);

    setTimeout(() => {
      const res = validarCodigoDesafio(
        codigoUsuario,
        desafioAtual.linguagem,
        desafioAtual.solucao_esperada || undefined
      );
      setResultadoValidacao(res);
      setVerificando(false);
    }, 300);
  };

  return (
    <LayoutArenaStl>
      {/* Barra Superior de Seleção */}
      <CardStl $destaqueBorda style={{ padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <BadgeStl>Dev & TI Arena</BadgeStl>
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
              Mini-IDE: Prática de Código para Concursos de TI
            </TitulosSecundariosStl>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {desafios.length > 0 && (
              <SelectStl
                value={desafioAtivoId}
                onChange={(e) => handleMudarDesafio(e.target.value)}
              >
                {desafios.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.linguagem.toUpperCase()}] {d.titulo}
                  </option>
                ))}
              </SelectStl>
            )}

            <BotaoPrimarioStl
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
              onClick={() => handleGerarDesafioComIA("sql")}
              disabled={gerandoDesafioIA}
            >
              {gerandoDesafioIA ? "⏳ Criando..." : "✨ Gerar SQL com IA"}
            </BotaoPrimarioStl>

            <BotaoPrimarioStl
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
              onClick={() => handleGerarDesafioComIA("python")}
              disabled={gerandoDesafioIA}
            >
              {gerandoDesafioIA ? "⏳ Criando..." : "✨ Gerar Python com IA"}
            </BotaoPrimarioStl>

            <BotaoSecundarioStl style={{ fontSize: "0.8rem" }} onClick={handleSemearDesafiosDemonstracao}>
              ⚡ 3 Exemplos TI
            </BotaoSecundarioStl>
          </div>
        </div>
      </CardStl>

      {/* Arena Split: Enunciado (Esquerda) e Mini-IDE (Direita) */}
      <ArenaSplitStl>
        {/* COLUNA ESQUERDA: ENUNCIADO E DICAS */}
        <PainelEnunciadoStl>
          {desafioAtual ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <BadgeStl>{desafioAtual.linguagem.toUpperCase()}</BadgeStl>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Prática Real de Código</span>
              </div>

              <TitulosSecundariosStl style={{ fontSize: "1.2rem" }}>
                {desafioAtual.titulo}
              </TitulosSecundariosStl>

              <ParagrafosStl style={{ lineHeight: 1.7, fontSize: "0.95rem" }}>
                {desafioAtual.enunciado}
              </ParagrafosStl>

              {desafioAtual.dicas && desafioAtual.dicas.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <DividerGradienteStl style={{ margin: "1rem 0" }} />
                  <ParagrafosStl style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                    💡 Dicas da Banca:
                  </ParagrafosStl>
                  <ul style={{ paddingLeft: "1.25rem", color: "rgba(225, 220, 201, 0.85)", fontSize: "0.9rem" }}>
                    {desafioAtual.dicas.map((d, i) => (
                      <li key={i} style={{ marginBottom: "0.35rem" }}>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <ParagrafosStl $secundario style={{ textAlign: "center", padding: "2rem" }}>
              Nenhum desafio selecionado. Clique no botão "Carregar 3 Desafios Clássicos de TI" para começar!
            </ParagrafosStl>
          )}
        </PainelEnunciadoStl>

        {/* COLUNA DIREITA: MINI-IDE COM MONACO EDITOR */}
        <EditorWrapperStl>
          <ToolbarIDEStl>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#E57373" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#FFB74D" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#81C784" }} />
              <span style={{ fontFamily: theme.fontsFamily.codigo, fontSize: "0.8rem", marginLeft: "0.5rem", color: theme.colors.marfim }}>
                solution.{desafioAtual?.linguagem === "python" ? "py" : desafioAtual?.linguagem === "sql" ? "sql" : "js"}
              </span>
            </div>

            <BotaoPrimarioStl
              style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}
              onClick={handleExecutarValidacao}
              disabled={verificando}
            >
              {verificando ? "Avaliando..." : "▶ Validar Código"}
            </BotaoPrimarioStl>
          </ToolbarIDEStl>

          {/* Monaco Editor integrado */}
          <Editor
            height="400px"
            theme="vs-dark"
            language={
              desafioAtual?.linguagem === "sql"
                ? "sql"
                : desafioAtual?.linguagem === "python"
                ? "python"
                : "javascript"
            }
            value={codigoUsuario}
            onChange={(val) => setCodigoUsuario(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              padding: { top: 12, bottom: 12 },
            }}
          />

          {/* Console / Output de Resultados */}
          <ConsoleOutputStl $sucesso={resultadoValidacao?.sucesso}>
            <div style={{ opacity: 0.7, marginBottom: "0.3rem" }}>
              &gt; Console de Avaliação da Banca:
            </div>
            {resultadoValidacao ? (
              <div>
                <strong style={{ fontSize: "0.95rem" }}>
                  {resultadoValidacao.mensagem}
                </strong>
                {resultadoValidacao.detalhes && (
                  <div style={{ marginTop: "0.25rem", opacity: 0.9 }}>
                    {resultadoValidacao.detalhes}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ opacity: 0.5 }}>
                Clique em "▶ Validar Código" para avaliar sua solução no padrão da banca.
              </span>
            )}
          </ConsoleOutputStl>
        </EditorWrapperStl>
      </ArenaSplitStl>
    </LayoutArenaStl>
  );
};
