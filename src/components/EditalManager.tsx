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
import { editaisService, type EditalCompleto } from "../services/editaisService";
import { useAuth } from "../contexts/AuthContext";
import { useEdital } from "../contexts/EditalContext";
import { extrairTextoDeArquivo } from "../utils/pdfExtractor";
import { geminiService } from "../services/geminiService";

const ContainerStl = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const UploadZoneStl = styled.div<{ $ativo?: boolean }>`
  border: 2px dashed ${(props) => (props.$ativo ? theme.colors.marfim : theme.colors.ambarQueimado)};
  background: linear-gradient(135deg, rgba(31, 21, 12, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%);
  border-radius: 14px;
  padding: 2.25rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  cursor: pointer;
  transition: all 0.22s ease-in-out;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);

  &:hover {
    border-color: ${theme.colors.marfim};
    background: linear-gradient(135deg, rgba(65, 45, 21, 0.25) 0%, rgba(15, 10, 5, 0.9) 100%);
    transform: translateY(-2px);
  }
`;

const InputArquivoOculto = styled.input`
  display: none;
`;

const FormGridStl = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  align-items: flex-end;
  margin-top: 1rem;
`;

const CampoStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const RotuloStl = styled.label`
  font-family: ${theme.fontsFamily.titulos};
  font-size: ${theme.fontSize.paragrafos.pp};
  color: ${theme.colors.textos.claroPrincipal};
  letter-spacing: 0.5px;
`;

const InputStl = styled.input`
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  color: ${theme.colors.textos.claroPrincipal};
  font-family: ${theme.fontsFamily.paragrafos};
  font-size: ${theme.fontSize.paragrafos.mm};
  box-sizing: border-box;

  &:focus {
    border-color: ${theme.colors.marfim};
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

const EditalItemCardStl = styled.div<{ $selecionado: boolean }>`
  background: ${(props) =>
    props.$selecionado
      ? "linear-gradient(135deg, rgba(65, 45, 21, 0.45) 0%, rgba(31, 21, 12, 0.95) 100%)"
      : "linear-gradient(135deg, rgba(31, 21, 12, 0.8) 0%, rgba(15, 10, 5, 0.9) 100%)"};
  border: ${(props) =>
    props.$selecionado
      ? `2px solid ${theme.colors.marfim}`
      : "1px solid rgba(225, 220, 201, 0.12)"};
  border-radius: 12px;
  padding: 1.35rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: ${(props) =>
    props.$selecionado
      ? "0 8px 30px rgba(65, 45, 21, 0.6), inset 0 1px 0 rgba(225, 220, 201, 0.2)"
      : "0 6px 20px rgba(0, 0, 0, 0.4)"};
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: ${theme.colors.marfim};
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
`;

const ArvoreContainerStl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
`;

const DisciplinaCardStl = styled.div`
  background-color: ${theme.colors.preto};
  border: ${theme.colors.borders.destaque};
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TopicosGridStl = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
`;

const TopicoItemStl = styled.div`
  background-color: ${theme.colors.background.card};
  border: 1px solid rgba(225, 220, 201, 0.15);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const RelevanciaEstrelasStl = styled.span`
  color: #ffd54f;
  font-size: 0.85rem;
  letter-spacing: 2px;
`;

const InsightBoxStl = styled.div`
  background-color: rgba(65, 45, 21, 0.2);
  border: 1px solid ${theme.colors.marfim};
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 1rem;
  line-height: 1.6;
`;

interface Props {
  editais?: EditalCompleto[];
  onRecarregar?: () => void;
  editalSelecionado?: EditalCompleto | null;
  onSelecionarEdital?: (edital: EditalCompleto | null) => void;
}

export const EditalManager: React.FC<Props> = ({
  editais: propEditais,
  onRecarregar: propOnRecarregar,
  editalSelecionado: propEditalSelecionado,
  onSelecionarEdital: propOnSelecionarEdital,
}) => {
  const { user } = useAuth();
  const {
    editais: ctxEditais,
    editalAtivo: ctxEditalAtivo,
    selecionarEdital: ctxSelecionarEdital,
    carregarEditais: ctxCarregarEditais,
  } = useEdital();

  const editais = propEditais !== undefined ? propEditais : ctxEditais;
  const editalSelecionado = propEditalSelecionado !== undefined ? propEditalSelecionado : ctxEditalAtivo;
  const onRecarregar = propOnRecarregar || ctxCarregarEditais;
  const onSelecionarEdital = (ed: EditalCompleto | null) => {
    if (ed) {
      ctxSelecionarEdital(ed.id);
    }
    if (propOnSelecionarEdital) {
      propOnSelecionarEdital(ed);
    }
  };
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaBanca, setNovaBanca] = useState("Cebraspe");
  const [novoOrgao, setNovoOrgao] = useState("");
  const [novoAno, setNovoAno] = useState(new Date().getFullYear());
  const [salvandoEdital, setSalvandoEdital] = useState(false);

  // Estados de IA & Upload
  const [processandoIA, setProcessandoIA] = useState(false);
  const [statusProgressoIA, setStatusProgressoIA] = useState("");
  const [insightsProvas, setInsightsProvas] = useState<string | null>(null);

  // 1. UPLOAD E DISSECAÇÃO AUTOMÁTICA DE EDITAL (PDF ou TXT)
  const handleUploadEditalArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setProcessandoIA(true);
      setStatusProgressoIA(`Lendo arquivo "${file.name}"...`);

      const textoExtraido = await extrairTextoDeArquivo(file);
      if (!textoExtraido || textoExtraido.trim().length < 50) {
        alert("O arquivo não possui texto legível suficiente.");
        setProcessandoIA(false);
        return;
      }

      setStatusProgressoIA("🤖 Inteligência Artificial dissecando o edital e extraindo disciplinas...");
      const resultadoIA = await geminiService.dissecarEditalComIA(textoExtraido);

      if (!resultadoIA || !resultadoIA.disciplinas || resultadoIA.disciplinas.length === 0) {
        alert("A IA não conseguiu identificar disciplinas claras. Tente um trecho mais direto do edital.");
        setProcessandoIA(false);
        return;
      }

      setStatusProgressoIA(`Salvando edital e ${resultadoIA.disciplinas.length} disciplinas no banco...`);

      // 1. Criar o edital
      const nomeEdital = file.name.replace(/\.[^/.]+$/, "");
      const { data: editalCriado, error: errEdital } = await editaisService.criarEdital({
        titulo: `Concurso: ${nomeEdital}`,
        banca: novaBanca,
        orgao: novoOrgao || "Órgão do Edital",
        ano: Number(novoAno),
        user_id: user.id,
      });

      if (errEdital || !editalCriado) {
        throw new Error(errEdital?.message || "Erro ao salvar edital.");
      }

      // 2. Criar disciplinas e tópicos com as relevâncias estimadas pela IA
      for (const disc of resultadoIA.disciplinas) {
        const { data: discCriada } = await editaisService.criarDisciplina(editalCriado.id, disc.nome);
        if (discCriada && disc.topicos) {
          for (const top of disc.topicos) {
            await editaisService.criarTopico({
              disciplinaId: discCriada.id,
              titulo: top.titulo,
              relevanciaBanca: top.relevancia_banca || 4,
            });
          }
        }
      }

      setStatusProgressoIA("✨ Edital 100% mapeado e estruturado pela IA com sucesso!");
      onRecarregar();
      onSelecionarEdital(editalCriado as EditalCompleto);
      alert(`🎉 Edital dissecado com sucesso! Foram extraídas ${resultadoIA.disciplinas.length} matérias estruturadas.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha no processamento: ${msg}`);
    } finally {
      setProcessandoIA(false);
      setStatusProgressoIA("");
    }
  };

  // 2. UPLOAD DE PROVAS ANTERIORES PARA A IA ANALISAR PADRÕES DA BANCA
  const handleUploadProvaAnterior = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editalSelecionado) {
      alert("Selecione um edital ativo antes de enviar provas anteriores.");
      return;
    }

    try {
      setProcessandoIA(true);
      setStatusProgressoIA(`Extraindo questões da prova "${file.name}"...`);

      const textoProva = await extrairTextoDeArquivo(file);
      const nomesDisciplinas = editalSelecionado.disciplinas?.map((d) => d.nome) || [];

      setStatusProgressoIA("🤖 IA analisando incidência de temas e pegadinhas da banca...");
      const analise = await geminiService.analisarProvasAnteriores(textoProva, nomesDisciplinas);

      if (analise) {
        setInsightsProvas(analise.recomendacoesEstudo);

        // Se a prova continha novos tópicos quentes, adiciona na primeira disciplina
        if (analise.novosTopicosDetectados && editalSelecionado.disciplinas?.[0]) {
          for (const novo of analise.novosTopicosDetectados) {
            await editaisService.criarTopico({
              disciplinaId: editalSelecionado.disciplinas[0].id,
              titulo: `[Foco Prova]: ${novo.topico}`,
              relevanciaBanca: 5,
            });
          }
          onRecarregar();
        }

        alert("🎯 Análise da prova concluída! A IA identificou os tópicos mais cobrados e ajustou os pesos.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha ao analisar prova: ${msg}`);
    } finally {
      setProcessandoIA(false);
      setStatusProgressoIA("");
    }
  };

  // Criar Edital Manual
  const handleCriarEditalManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !novoTitulo.trim()) return;

    setSalvandoEdital(true);
    const { data } = await editaisService.criarEdital({
      titulo: novoTitulo.trim(),
      banca: novaBanca,
      orgao: novoOrgao.trim(),
      ano: Number(novoAno),
      user_id: user.id,
    });

    setNovoTitulo("");
    setNovoOrgao("");
    onRecarregar();
    if (data) onSelecionarEdital(data as EditalCompleto);
    setSalvandoEdital(false);
  };

  return (
    <ContainerStl>
      {/* 1. SEÇÃO DE INGESTÃO AUTOMÁTICA POR IA */}
      <CardStl $destaqueBorda>
        <BadgeStl>Ingestão Inteligente via Gemini AI</BadgeStl>
        <TitulosSecundariosStl style={{ marginTop: "0.5rem" }}>
          🚀 Upload de Edital & Provas Anteriores
        </TitulosSecundariosStl>
        <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
          Arraste ou selecione o <strong>PDF ou TXT do Edital</strong>. A inteligência artificial disseca o documento,
          cria as matérias e pontua a relevância de cada tema automaticamente!
        </ParagrafosStl>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", marginTop: "1.25rem" }}>
          {/* Box de Upload do Edital */}
          <label>
            <InputArquivoOculto
              type="file"
              accept=".pdf,.txt"
              onChange={handleUploadEditalArquivo}
              disabled={processandoIA}
            />
            <UploadZoneStl>
              <span style={{ fontSize: "2rem" }}>📄</span>
              <strong style={{ fontSize: "1.05rem" }}>Subir Edital do Concurso (PDF/TXT)</strong>
              <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                A IA extrai todo o conteúdo programático em segundos.
              </ParagrafosStl>
            </UploadZoneStl>
          </label>

          {/* Box de Upload de Provas Anteriores */}
          <label>
            <InputArquivoOculto
              type="file"
              accept=".pdf,.txt"
              onChange={handleUploadProvaAnterior}
              disabled={processandoIA || !editalSelecionado}
            />
            <UploadZoneStl $ativo={Boolean(editalSelecionado)}>
              <span style={{ fontSize: "2rem" }}>🎯</span>
              <strong style={{ fontSize: "1.05rem" }}>Alimentar Prova Anterior (PDF/TXT)</strong>
              <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                {editalSelecionado
                  ? `Cruzar questões reais com "${editalSelecionado.titulo}"`
                  : "Selecione um edital abaixo para habilitar"}
              </ParagrafosStl>
            </UploadZoneStl>
          </label>
        </div>

        {processandoIA && (
          <div style={{ marginTop: "1rem", textAlign: "center", color: theme.colors.marfim }}>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>{" "}
            <strong>{statusProgressoIA}</strong>
          </div>
        )}

        {insightsProvas && (
          <InsightBoxStl>
            <strong>🧠 Raio-X da Banca Gerado pela IA:</strong>
            <p style={{ marginTop: "0.5rem", fontSize: "0.95rem" }}>{insightsProvas}</p>
          </InsightBoxStl>
        )}
      </CardStl>

      {/* 2. CADASTRO MANUAL DE EDITAL (OPÇÃO ALTERNATIVA) */}
      <CardStl style={{ padding: "1.25rem 1.5rem" }}>
        <TitulosSecundariosStl style={{ fontSize: "1.15rem" }}>
          Ou Cadastre Manualmente (Sem PDF):
        </TitulosSecundariosStl>
        <FormGridStl onSubmit={handleCriarEditalManual}>
          <CampoStl style={{ gridColumn: "span 2" }}>
            <RotuloStl>Título do Concurso</RotuloStl>
            <InputStl
              type="text"
              required
              placeholder="Ex: Auditor de TI - TCU"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Banca</RotuloStl>
            <SelectStl value={novaBanca} onChange={(e) => setNovaBanca(e.target.value)}>
              <option value="Cebraspe">Cebraspe</option>
              <option value="FGV">FGV</option>
              <option value="FCC">FCC</option>
              <option value="Cesgranrio">Cesgranrio</option>
            </SelectStl>
          </CampoStl>

          <CampoStl>
            <RotuloStl>Ano</RotuloStl>
            <InputStl
              type="number"
              value={novoAno}
              onChange={(e) => setNovoAno(Number(e.target.value))}
            />
          </CampoStl>

          <BotaoSecundarioStl type="submit" disabled={salvandoEdital}>
            {salvandoEdital ? "Salvando..." : "➕ Criar Manual"}
          </BotaoSecundarioStl>
        </FormGridStl>
      </CardStl>

      {/* 3. LISTA DE EDITAIS */}
      <div>
        <TitulosSecundariosStl style={{ marginBottom: "1rem" }}>
          Seus Editais Cadastrados ({editais.length})
        </TitulosSecundariosStl>

        {editais.length === 0 ? (
          <ParagrafosStl $secundario>
            Nenhum edital cadastrado. Suba um PDF acima para a IA estruturar seus estudos!
          </ParagrafosStl>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {editais.map((ed) => (
              <EditalItemCardStl
                key={ed.id}
                $selecionado={editalSelecionado?.id === ed.id}
                onClick={() => onSelecionarEdital(ed)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <BadgeStl>{ed.banca}</BadgeStl>
                  <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{ed.ano}</span>
                </div>
                <TitulosSecundariosStl style={{ fontSize: "1.2rem" }}>
                  {ed.titulo}
                </TitulosSecundariosStl>
                <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                  {ed.orgao || "Órgão"} • {ed.disciplinas?.length || 0} Disciplina(s)
                </ParagrafosStl>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <BotaoPrimarioStl style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", width: "100%" }}>
                    {editalSelecionado?.id === ed.id ? "✓ Edital Ativo" : "Selecionar Edital"}
                  </BotaoPrimarioStl>
                  <BotaoSecundarioStl
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Excluir este edital?")) {
                        await editaisService.excluirEdital(ed.id);
                        if (editalSelecionado?.id === ed.id) onSelecionarEdital(null);
                        onRecarregar();
                      }
                    }}
                  >
                    🗑️
                  </BotaoSecundarioStl>
                </div>
              </EditalItemCardStl>
            ))}
          </div>
        )}
      </div>

      {/* 4. ÁRVORE HIERÁRQUICA ESTATÍSTICA DO EDITAL ATIVO */}
      {editalSelecionado && (
        <CardStl $destaqueBorda style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <BadgeStl>Conteúdo Programático Dissecado</BadgeStl>
              <TitulosSecundariosStl style={{ marginTop: "0.4rem" }}>
                {editalSelecionado.titulo} ({editalSelecionado.disciplinas?.length || 0} Matérias)
              </TitulosSecundariosStl>
            </div>
          </div>

          <ArvoreContainerStl>
            {(!editalSelecionado.disciplinas || editalSelecionado.disciplinas.length === 0) ? (
              <ParagrafosStl $secundario style={{ padding: "1.5rem 0", textAlign: "center" }}>
                Nenhuma disciplina cadastrada neste edital ainda.
              </ParagrafosStl>
            ) : (
              editalSelecionado.disciplinas.map((disc) => (
                <DisciplinaCardStl key={disc.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <TitulosSecundariosStl style={{ fontSize: "1.25rem" }}>
                      📖 {disc.nome} ({disc.topicos?.length || 0} Tópicos)
                    </TitulosSecundariosStl>
                  </div>

                  <TopicosGridStl>
                    {(!disc.topicos || disc.topicos.length === 0) ? (
                      <ParagrafosStl $secundario style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                        Nenhum tópico nesta disciplina.
                      </ParagrafosStl>
                    ) : (
                      disc.topicos.map((top) => (
                        <TopicoItemStl key={top.id}>
                          <div>
                            <ParagrafosStl style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                              {top.titulo}
                            </ParagrafosStl>
                            <RelevanciaEstrelasStl title={`Peso estimado pela IA: ${top.relevancia_banca}/5`}>
                              {"★".repeat(top.relevancia_banca)}
                              {"☆".repeat(5 - top.relevancia_banca)}
                            </RelevanciaEstrelasStl>
                          </div>
                        </TopicoItemStl>
                      ))
                    )}
                  </TopicosGridStl>
                </DisciplinaCardStl>
              ))
            )}
          </ArvoreContainerStl>
        </CardStl>
      )}
    </ContainerStl>
  );
};
