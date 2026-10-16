import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { theme, TitulosSecundariosStl, ParagrafosStl, CardStl, BadgeStl } from "../theme/theme";
import { BotaoPrimarioStl, BotaoSecundarioStl } from "../theme/theme";
import { provasFeitasLocalStorageService as provasFeitasService } from "../services/provasFeitasLocalStorageService";
import type { ProvaFeita } from "../types/database";
import type { ProvaFeitaComStats } from "../services/provasFeitasService";
import { useAuth } from "../contexts/AuthContext";
import { extrairTextoDeArquivo } from "../utils/pdfExtractor";

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

const ProvaItemCardStl = styled.div<{ $selecionado: boolean }>`
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
  provas?: ProvaFeita[];
  onRecarregar?: () => void;
  provaSelecionada?: ProvaFeita | null;
  onSelecionarProva?: (prova: ProvaFeita | null) => void;
}

export const ProvaFeitaManager: React.FC<Props> = ({
  provas: propProvas,
  onRecarregar: propOnRecarregar,
  provaSelecionada: propProvaSelecionada,
  onSelecionarProva: propOnSelecionarProva,
}) => {
  const { user } = useAuth();
  const provas = propProvas ?? [];
  const provaSelecionada = propProvaSelecionada ?? null;
  const onRecarregar = propOnRecarregar;
  const onSelecionarProva = (p: ProvaFeita | null) => {
    if (propOnSelecionarProva) propOnSelecionarProva(p);
  };

  // Estados de cadastro de nova prova
  const [nomeProva, setNomeProva] = useState("");
  const [totalQuestoes, setTotalQuestoes] = useState(0);
  const [questoesObjetivas, setQuestoesObjetivas] = useState(0);
  const [questoesGerais, setQuestoesGerais] = useState(0);
  const [pesoGeral, setPesoGeral] = useState(1);
  const [pesoObjetivo, setPesoObjetivo] = useState(1);
  const [notaMinimaGeral, setNotaMinimaGeral] = useState(6);
  const [notaMinimaObjetiva, setNotaMinimaObjetiva] = useState(6);
  const [notaCorte, setNotaCorte] = useState(6);
  const [dataRealizacao, setDataRealizacao] = useState(new Date().toISOString().split("T")[0]);
  const [salvandoProva, setSalvandoProva] = useState(false);

  // Cálculo automático de notas mínimas e nota de corte com base nas quantidades e pesos
  useEffect(() => {
    const total = Number(totalQuestoes) || 0;
    const obj = Number(questoesObjetivas) || 0;
    const ger = Number(questoesGerais) || 0;
    const pesoG = Number(pesoGeral) || 1;
    const pesoO = Number(pesoObjetivo) || 1;

    // Nota mínima geral: proporção de questões gerais sobre o total, aplicada ao peso geral
    const notaMinGeral = total > 0 ? Math.round(((ger / total) * pesoG) * 10) / 10 : 6;
    // Nota mínima objetiva: proporção de questões objetivas sobre o total, aplicada ao peso objetivo
    const notaMinObj = total > 0 ? Math.round(((obj / total) * pesoO) * 10) / 10 : 6;
    // Nota de corte: média ponderada das duas notas mínimas
    const corte = total > 0 ? Math.round(((notaMinGeral + notaMinObj) / 2) * 10) / 10 : 6;

    setNotaMinimaGeral(notaMinGeral > 10 ? 10 : notaMinGeral < 0 ? 0 : notaMinGeral);
    setNotaMinimaObjetiva(notaMinObj > 10 ? 10 : notaMinObj < 0 ? 0 : notaMinObj);
    setNotaCorte(corte > 10 ? 10 : corte < 0 ? 0 : corte);
  }, [totalQuestoes, questoesObjetivas, questoesGerais, pesoGeral, pesoObjetivo]);

  // Estados de envio de respostas/gabaritos
  const [processandoPDF, setProcessandoPDF] = useState(false);
  const [statusProgressoPDF, setStatusProgressoPDF] = useState("");

  // Estados de edição de prova existente
  const [editandoProvaId, setEditandoProvaId] = useState<string | null>(null);
  const [editNomeProva, setEditNomeProva] = useState("");
  const [editTotalQuestoes, setEditTotalQuestoes] = useState(0);
  const [editQuestoesObjetivas, setEditQuestoesObjetivas] = useState(0);
  const [editQuestoesGerais, setEditQuestoesGerais] = useState(0);
  const [editPesoGeral, setEditPesoGeral] = useState(1);
  const [editPesoObjetivo, setEditPesoObjetivo] = useState(1);
  const [editNotaMinimaGeral, setEditNotaMinimaGeral] = useState(6);
  const [editNotaMinimaObjetiva, setEditNotaMinimaObjetiva] = useState(6);
  const [editNotaCorte, setEditNotaCorte] = useState(6);
  const [editDataRealizacao, setEditDataRealizacao] = useState("");
  const [atualizandoProva, setAtualizandoProva] = useState(false);

  // Estados para preenchimento de respostas e gabaritos da prova selecionada
  const [respostasUsuario, setRespostasUsuario] = useState<Record<number, string>>({});
  const [gabaritoPreliminarInput, setGabaritoPreliminarInput] = useState<Record<number, string>>({});
  const [gabaritoDefinitivoInput, setGabaritoDefinitivoInput] = useState<Record<number, string>>({});
  const [salvandoRespostas, setSalvandoRespostas] = useState(false);
  const [estatisticas, setEstatisticas] = useState<ProvaFeitaComStats | null>(null);

  // Lista interna de provas (carregada do localStorage)
  const [provasInternas, setProvasInternas] = useState<ProvaFeita[]>([]);

  // Carregar provas do localStorage quando o usuário está autenticado
  useEffect(() => {
    if (!user) return;
    let montado = true;
    (async () => {
      const { data, error } = await provasFeitasService.listarProvasFeitas(user.id);
      if (montado && data) {
        setProvasInternas(data);
      }
    })();
    return () => { montado = false; };
  }, [user]);

  // Recarrega provas do localStorage
  const carregarProvas = async () => {
    if (!user) return;
    const { data, error } = await provasFeitasService.listarProvasFeitas(user.id);
    if (data) {
      setProvasInternas(data);
    }
  };

  // Cálculo automático no formulário de edição (depois de todos os useState)
  useEffect(() => {
    if (!editandoProvaId) return;

    const total = Number(editTotalQuestoes) || 0;
    const obj = Number(editQuestoesObjetivas) || 0;
    const ger = Number(editQuestoesGerais) || 0;
    const pesoG = Number(editPesoGeral) || 1;
    const pesoO = Number(editPesoObjetivo) || 1;

    const notaMinGeral = total > 0 ? Math.round(((ger / total) * pesoG) * 10) / 10 : 6;
    const notaMinObj = total > 0 ? Math.round(((obj / total) * pesoO) * 10) / 10 : 6;
    const corte = total > 0 ? Math.round(((notaMinGeral + notaMinObj) / 2) * 10) / 10 : 6;

    setEditNotaMinimaGeral(notaMinGeral > 10 ? 10 : notaMinGeral < 0 ? 0 : notaMinGeral);
    setEditNotaMinimaObjetiva(notaMinObj > 10 ? 10 : notaMinObj < 0 ? 0 : notaMinObj);
    setEditNotaCorte(corte > 10 ? 10 : corte < 0 ? 0 : corte);
  }, [editTotalQuestoes, editQuestoesObjetivas, editQuestoesGerais, editPesoGeral, editPesoObjetivo, editandoProvaId]);

  // Carregar dados da prova selecionada nos estados de respostas/gabaritos
  useEffect(() => {
    if (!provaSelecionada) {
      setRespostasUsuario({});
      setGabaritoPreliminarInput({});
      setGabaritoDefinitivoInput({});
      setEstatisticas(null);
      return;
    }

    setRespostasUsuario(provaSelecionada.respostas_usuario || {});
    setGabaritoPreliminarInput(provaSelecionada.gabarito_preliminar || {});
    setGabaritoDefinitivoInput(provaSelecionada.gabarito_definitivo || {});
    setEstatisticas(provasFeitasService.calcularEstatisticas(provaSelecionada));
  }, [provaSelecionada]);

  // Criar nova prova feita
  const handleCriarProvaFeita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nomeProva.trim()) return;

    setSalvandoProva(true);
    try {
      const { data, error } = await provasFeitasService.criarProvaFeita({
        nome_prova: nomeProva.trim(),
        total_questoes: Number(totalQuestoes),
        questoes_objetivas: Number(questoesObjetivas),
        questoes_gerais: Number(questoesGerais),
        peso_geral: Number(pesoGeral),
        peso_objetivo: Number(pesoObjetivo),
        nota_minima_geral: Number(notaMinimaGeral),
        nota_minima_objetiva: Number(notaMinimaObjetiva),
        nota_corte: Number(notaCorte),
        data_realizacao: dataRealizacao,
        user_id: user.id,
      });

      if (error) throw new Error(error.message);

      setNomeProva("");
      setTotalQuestoes(0);
      setQuestoesObjetivas(0);
      setQuestoesGerais(0);
      setPesoGeral(1);
      setPesoObjetivo(1);
      setDataRealizacao(new Date().toISOString().split("T")[0]);
      await carregarProvas();
      if (data) onSelecionarProva(data);
      alert("✅ Prova cadastrada com sucesso! Agora preencha as respostas e gabaritos.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha ao cadastrar prova: ${msg}`);
    } finally {
      setSalvandoProva(false);
    }
  };

  // Extrair gabarito de PDF
  const handleExtrairGabaritoPDF = async (e: React.ChangeEvent<HTMLInputElement>, tipo: "preliminar" | "definitivo") => {
    const file = e.target.files?.[0];
    if (!file || !provaSelecionada) {
      alert("Selecione uma prova antes de enviar o gabarito.");
      return;
    }

    try {
      setProcessandoPDF(true);
      setStatusProgressoPDF(`Lendo gabarito "${file.name}"...`);

      const texto = await extrairTextoDeArquivo(file);
      if (!texto || texto.trim().length < 10) {
        alert("O PDF não possui texto legível suficiente.");
        setProcessandoPDF(false);
        return;
      }

      // Aqui o usuário ainda confere/ajusta manualmente após extração bruta
      setStatusProgressoPDF("Texto extraído. Revise as questões e alternativas abaixo.");

      // Para simplificar, armazenamos o texto bruto e avisamos o usuário
      // que deve preencher as respostas questão por questão no formulário abaixo
      alert(
        `Texto do gabarito extraído com sucesso!\n\n` +
        `Agora preencha as respostas questão por questão no formulário de "${tipo}" abaixo.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha ao extrair PDF: ${msg}`);
    } finally {
      setProcessandoPDF(false);
      setStatusProgressoPDF("");
    }
  };

  // Abrir edição de prova existente
  const handleAbrirEdicao = (prova: ProvaFeita) => {
    setEditandoProvaId(prova.id);
    setEditNomeProva(prova.nome_prova);
    setEditTotalQuestoes(prova.total_questoes);
    setEditQuestoesObjetivas(prova.questoes_objetivas);
    setEditQuestoesGerais(prova.questoes_gerais);
    setEditPesoGeral(prova.peso_geral);
    setEditPesoObjetivo(prova.peso_objetivo);
    setEditNotaMinimaGeral(prova.nota_minima_geral);
    setEditNotaMinimaObjetiva(prova.nota_minima_objetiva);
    setEditNotaCorte(prova.nota_corte);
    setEditDataRealizacao(prova.data_realizacao);
  };

  const handleFecharEdicao = () => {
    setEditandoProvaId(null);
    setEditNomeProva("");
    setEditTotalQuestoes(0);
    setEditQuestoesObjetivas(0);
    setEditQuestoesGerais(0);
    setEditPesoGeral(1);
    setEditPesoObjetivo(1);
    setEditNotaMinimaGeral(6);
    setEditNotaMinimaObjetiva(6);
    setEditNotaCorte(6);
    setEditDataRealizacao("");
  };

  const handleAtualizarProva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoProvaId) return;

    setAtualizandoProva(true);
    try {
      const { data, error } = await provasFeitasService.atualizarProvaFeita(editandoProvaId, {
        nome_prova: editNomeProva.trim(),
        total_questoes: Number(editTotalQuestoes),
        questoes_objetivas: Number(editQuestoesObjetivas),
        questoes_gerais: Number(editQuestoesGerais),
        peso_geral: Number(editPesoGeral),
        peso_objetivo: Number(editPesoObjetivo),
        nota_minima_geral: Number(editNotaMinimaGeral),
        nota_minima_objetiva: Number(editNotaMinimaObjetiva),
        nota_corte: Number(editNotaCorte),
        data_realizacao: editDataRealizacao,
      });

      if (error) throw new Error(error.message);

      handleFecharEdicao();
      await carregarProvas();
      alert("✅ Prova atualizada com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha ao atualizar prova: ${msg}`);
    } finally {
      setAtualizandoProva(false);
    }
  };

  const handleExcluirProva = async (prova: ProvaFeita) => {
    if (!confirm("Excluir esta prova e todas as respostas associadas?")) return;
    const { error } = await provasFeitasService.excluirProvaFeita(prova.id);
    if (error) {
      alert(`Falha ao excluir: ${error.message}`);
      return;
    }
    if (provaSelecionada?.id === prova.id) onSelecionarProva(null);
    await carregarProvas();
  };

  // Salvar respostas do usuário e gabaritos da prova selecionada
  const handleSalvarRespostasEGabaritos = async () => {
    if (!provaSelecionada) return;

    setSalvandoRespostas(true);
    try {
      const { data, error } = await provasFeitasService.atualizarProvaFeita(provaSelecionada.id, {
        respostas_usuario: respostasUsuario,
        gabarito_preliminar: gabaritoPreliminarInput,
        gabarito_definitivo: gabaritoDefinitivoInput,
      });

      if (error) throw new Error(error.message);

      // Recalcular estatísticas com os novos dados
      const provaAtualizada = data as ProvaFeita;
      setEstatisticas(provasFeitasService.calcularEstatisticas(provaAtualizada));
      await carregarProvas();

      alert("✅ Respostas e gabaritos salvos com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      alert(`Falha ao salvar: ${msg}`);
    } finally {
      setSalvandoRespostas(false);
    }
  };

  // Alternar seleção de alternativa para uma questão
  const toggleResposta = (numeroQuestao: number, alternativa: string) => {
    const atual = respostasUsuario[numeroQuestao];
    const novo = atual === alternativa ? undefined : alternativa;
    setRespostasUsuario({ ...respostasUsuario, [numeroQuestao]: novo });
  };

  const toggleGabaritoPreliminar = (numeroQuestao: number, alternativa: string) => {
    const atual = gabaritoPreliminarInput[numeroQuestao];
    const novo = atual === alternativa ? undefined : alternativa;
    setGabaritoPreliminarInput({ ...gabaritoPreliminarInput, [numeroQuestao]: novo });
  };

  const toggleGabaritoDefinitivo = (numeroQuestao: number, alternativa: string) => {
    const atual = gabaritoDefinitivoInput[numeroQuestao];
    const novo = atual === alternativa ? undefined : alternativa;
    setGabaritoDefinitivoInput({ ...gabaritoDefinitivoInput, [numeroQuestao]: novo });
  };

  // Ordem: conhecimento geral primeiro, depois objetivas/específicas
  const questoesOrdenadas = provaSelecionada
    ? [
        ...Array.from({ length: provaSelecionada.questoes_gerais }, (_, i) => i + 1),
        ...Array.from(
          { length: provaSelecionada.questoes_objetivas },
          (_, i) => provaSelecionada.questoes_gerais + i + 1
        ),
      ]
    : [];

  return (
    <ContainerStl>
      {/* 1. CADASTRO DE NOVA PROVA FEITA */}
      <CardStl $destaqueBorda>
        <BadgeStl>Registro de Prova Realizada</BadgeStl>
        <TitulosSecundariosStl style={{ marginTop: "0.5rem" }}>
          📝 Cadastrar Nova Prova Feita
        </TitulosSecundariosStl>
        <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
          Informe o nome da prova, pesos e notas mínimas. Depois preencha as respostas
          questão por questão e os gabaritos (preliminar e definitivo).
        </ParagrafosStl>

        <FormGridStl onSubmit={handleCriarProvaFeita}>
          <CampoStl style={{ gridColumn: "span 2" }}>
            <RotuloStl>Nome da Prova</RotuloStl>
            <InputStl
              type="text"
              required
              placeholder="Ex: Hemocentro - Técnico de Laboratório 2024"
              value={nomeProva}
              onChange={(e) => setNomeProva(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Total de Questões</RotuloStl>
            <InputStl
              type="number"
              min="0"
              value={totalQuestoes}
              onChange={(e) => setTotalQuestoes(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Questões Objetivas</RotuloStl>
            <InputStl
              type="number"
              min="0"
              value={questoesObjetivas}
              onChange={(e) => setQuestoesObjetivas(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Questões Gerais</RotuloStl>
            <InputStl
              type="number"
              min="0"
              value={questoesGerais}
              onChange={(e) => setQuestoesGerais(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Peso Geral</RotuloStl>
            <InputStl
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={pesoGeral}
              onChange={(e) => setPesoGeral(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Peso Objetiva</RotuloStl>
            <InputStl
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={pesoObjetivo}
              onChange={(e) => setPesoObjetivo(e.target.value)}
            />
          </CampoStl>

          <CampoStl style={{ gridColumn: "span 2" }}>
            <RotuloStl>Nota Mínima Geral (calculada automaticamente)</RotuloStl>
            <InputStl
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={notaMinimaGeral}
              readOnly
            />
            <ParagrafosStl $secundario style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              Baseada na proporção de questões gerais × peso geral
            </ParagrafosStl>
          </CampoStl>

          <CampoStl style={{ gridColumn: "span 2" }}>
            <RotuloStl>Nota Mínima Objetiva (calculada automaticamente)</RotuloStl>
            <InputStl
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={notaMinimaObjetiva}
              readOnly
            />
            <ParagrafosStl $secundario style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              Baseada na proporção de questões objetivas × peso objetivo
            </ParagrafosStl>
          </CampoStl>

          <CampoStl style={{ gridColumn: "span 2" }}>
            <RotuloStl>Nota de Corte (calculada automaticamente)</RotuloStl>
            <InputStl
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={notaCorte}
              readOnly
            />
            <ParagrafosStl $secundario style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
              Média ponderada das notas mínimas geral e objetiva
            </ParagrafosStl>
          </CampoStl>

          <CampoStl>
            <RotuloStl>Data da Prova</RotuloStl>
            <InputStl
              type="date"
              required
              value={dataRealizacao}
              onChange={(e) => setDataRealizacao(e.target.value)}
            />
          </CampoStl>

          <BotaoPrimarioStl
            type="submit"
            disabled={salvandoProva}
            style={{ gridColumn: "span 2", fontSize: "0.9rem", padding: "0.75rem" }}
          >
            {salvandoProva ? "Cadastrando..." : "📋 Cadastrar Prova"}
          </BotaoPrimarioStl>
        </FormGridStl>
      </CardStl>

      {/* 2. UPLOAD DE GABARITOS (PDF) */}
      <CardStl style={{ padding: "1.25rem 1.5rem" }}>
        <TitulosSecundariosStl style={{ fontSize: "1.15rem" }}>
          📎 Extrair Gabarito de PDF
        </TitulosSecundariosStl>
        <ParagrafosStl $secundario style={{ marginTop: "0.5rem" }}>
          Envie o PDF do gabarito preliminar e/ou definitivo. O texto será extraído e
          você poderá preencher as respostas questão por questão abaixo.
        </ParagrafosStl>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem", marginTop: "1.25rem" }}>
          <label>
            <InputArquivoOculto
              type="file"
              accept=".pdf"
              onChange={(e) => handleExtrairGabaritoPDF(e, "preliminar")}
              disabled={processandoPDF || !provaSelecionada}
            />
            <UploadZoneStl $ativo={Boolean(provaSelecionada) && !processandoPDF}>
              <span style={{ fontSize: "2rem" }}>📄</span>
              <strong style={{ fontSize: "1rem" }}>Gabarito Preliminar</strong>
              <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                {provaSelecionada
                  ? `Para: "${provaSelecionada.nome_prova}"`
                  : "Selecione uma prova abaixo"}
              </ParagrafosStl>
            </UploadZoneStl>
          </label>

          <label>
            <InputArquivoOculto
              type="file"
              accept=".pdf"
              onChange={(e) => handleExtrairGabaritoPDF(e, "definitivo")}
              disabled={processandoPDF || !provaSelecionada}
            />
            <UploadZoneStl $ativo={Boolean(provaSelecionada) && !processandoPDF}>
              <span style={{ fontSize: "2rem" }}>📄</span>
              <strong style={{ fontSize: "1rem" }}>Gabarito Definitivo</strong>
              <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                {provaSelecionada
                  ? `Para: "${provaSelecionada.nome_prova}"`
                  : "Selecione uma prova abaixo"}
              </ParagrafosStl>
            </UploadZoneStl>
          </label>
        </div>

        {processandoPDF && (
          <div style={{ marginTop: "1rem", textAlign: "center", color: theme.colors.marfim }}>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⏳</span>{" "}
            <strong>{statusProgressoPDF}</strong>
          </div>
        )}
      </CardStl>

      {/* 3. PREENCHER RESPOSTAS E GABARITOS */}
      {provaSelecionada && (
        <CardStl $destaqueBorda style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <BadgeStl>Respostas e Gabaritos</BadgeStl>
              <TitulosSecundariosStl style={{ marginTop: "0.4rem", fontSize: "1.2rem" }}>
                📝 {provaSelecionada.nome_prova}
              </TitulosSecundariosStl>
              <ParagrafosStl $secundario style={{ marginTop: "0.25rem", fontSize: "0.85rem" }}>
                {provaSelecionada.total_questoes} questões • {provaSelecionada.questoes_objetivas} objetivas • {provaSelecionada.questoes_gerais} gerais
              </ParagrafosStl>
            </div>
            <BotaoPrimarioStl
              onClick={handleSalvarRespostasEGabaritos}
              disabled={salvandoRespostas}
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              {salvandoRespostas ? "Salvando..." : "💾 Salvar Respostas e Gabaritos"}
            </BotaoPrimarioStl>
          </div>

          {/* Estatísticas calculadas - Redesign UI com 3 seções */}
          {estatisticas && (
            <div style={{ marginBottom: "1.5rem" }}>
              {/* Seção 1: Header Summary */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.25rem",
                gap: "1rem",
              }}>
                <div>
                  <ParagrafosStl style={{ fontSize: "0.85rem", fontWeight: 700, color: theme.colors.marfim, marginBottom: "0.35rem" }}>
                    📋 {provaSelecionada?.nome_prova || "Prova"}
                  </ParagrafosStl>
                  <ParagrafosStl $secundario style={{ fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.25rem" }}>
                    {estatisticas.totalQuestoes} questões • {estatisticas.questoes_gerais || estatisticas.totalQuestoes / 2} gerais • {estatisticas.questoes_objetivas || estatisticas.totalQuestoes / 2} específicas
                  </ParagrafosStl>
                  <ParagrafosStl $secundario style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                    Nota de Corte: {estatisticas.nota_minima_geral} pontos
                  </ParagrafosStl>
                </div>
                <BotaoPrimarioStl
                  onClick={handleSalvarRespostasEGabaritos}
                  disabled={salvandoRespostas}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
                >
                  {salvandoRespostas ? "Salvando..." : "💾 Salvar Respostas e Gabaritos"}
                </BotaoPrimarioStl>
              </div>

              {/* Seção 2: Grid Comparativo Preliminar vs Definitivo */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}>
                {/* Card Preliminar */}
                <div style={{
                  backgroundColor: theme.colors.preto,
                  border: "1px solid rgba(225, 220, 201, 0.15)",
                  borderRadius: 10,
                  padding: "1.25rem",
                  boxSizing: "border-box",
                }}>
                  <ParagrafosStl style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.colors.marfim, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Gabarito Preliminar
                  </ParagrafosStl>
                  <div style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: theme.colors.marfim,
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px solid ${theme.colors.borders.suave}`,
                  }}>
                    {estatisticas.pontosPreliminar}/{estatisticas.pontosMaximos}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                      <ParagrafosStl $secundario style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        Conhecimentos Gerais
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "1rem", fontWeight: 700, color: "#81C784" }}>
                        {estatisticas.acertosPreliminarGerais ?? 0}
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                        ({estatisticas.pontosPreliminarGerais ?? 0} pts)
                      </ParagrafosStl>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                      <ParagrafosStl $secundario style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        Conhecimentos Específicos
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "1rem", fontWeight: 700, color: "#81C784" }}>
                        {estatisticas.acertosPreliminarEspecificas ?? 0}
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                        ({estatisticas.pontosPreliminarEspecificas ?? 0} pts)
                      </ParagrafosStl>
                    </div>
                  </div>
                </div>

                {/* Card Definitivo */}
                <div style={{
                  backgroundColor: theme.colors.preto,
                  border: "1px solid rgba(225, 220, 201, 0.15)",
                  borderRadius: 10,
                  padding: "1.25rem",
                  boxSizing: "border-box",
                }}>
                  <ParagrafosStl style={{ fontSize: "0.75rem", fontWeight: 700, color: theme.colors.marfim, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Gabarito Definitivo
                  </ParagrafosStl>
                  <div style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: theme.colors.marfim,
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `1px solid ${theme.colors.borders.suave}`,
                  }}>
                    {estatisticas.pontosDefinitivo}/{estatisticas.pontosMaximos}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                      <ParagrafosStl $secundario style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        Conhecimentos Gerais
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "1rem", fontWeight: 700, color: "#81C784" }}>
                        {estatisticas.acertosDefinitivoGerais ?? 0}
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                        ({estatisticas.pontosDefinitivoGerais ?? 0} pts)
                      </ParagrafosStl>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
                      <ParagrafosStl $secundario style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        Conhecimentos Específicos
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "1rem", fontWeight: 700, color: "#81C784" }}>
                        {estatisticas.acertosDefinitivoEspecificas ?? 0}
                      </ParagrafosStl>
                      <ParagrafosStl style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                        ({estatisticas.pontosDefinitivoEspecificas ?? 0} pts)
                      </ParagrafosStl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Banner de Veredito */}
              <div style={{
                backgroundColor: estatisticas.aprovadoDefinitivo ? "rgba(40, 160, 80, 0.15)" : "rgba(229, 115, 115, 0.15)",
                border: estatisticas.aprovadoDefinitivo ? "1px solid #81C784" : "1px solid #E57373",
                borderRadius: 10,
                padding: "1.5rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
              }}>
                <ParagrafosStl style={{ fontSize: "0.8rem", margin: 0, opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Resultado Definitivo
                </ParagrafosStl>
                <ParagrafosStl style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: estatisticas.aprovadoDefinitivo ? "#81C784" : "#E57373",
                  margin: 0,
                }}>
                  {estatisticas.aprovadoDefinitivo ? "✓ APROVADO" : "✕ REPROVADO"}
                </ParagrafosStl>
                <ParagrafosStl $secundario style={{ fontSize: "0.85rem", margin: 0, opacity: 0.8 }}>
                  {estatisticas.pontosDefinitivo} de {estatisticas.pontosMaximos} pontos
                  • Mínimo necessário: {estatisticas.nota_minima_geral} pontos
                </ParagrafosStl>
              </div>
            </div>
          )}

          <ParagrafosStl $secundario style={{ marginBottom: "1rem" }}>
            Preencha sua resposta e os gabaritos para cada questão. Selecione a alternativa
            (A, B, C, D ou E) ou clique novamente para limpar.
          </ParagrafosStl>

          {/* Ordem: conhecimento geral primeiro, depois objetivas/específicas */}
          {questoesOrdenadas.map((numeroQuestao) => (
            <div
              key={numeroQuestao}
              style={{
                backgroundColor: theme.colors.preto,
                border: theme.colors.borders.destaque,
                borderRadius: 8,
                padding: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <ParagrafosStl style={{ fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>
                  Questão {numeroQuestao}
                </ParagrafosStl>
                <ParagrafosStl $secundario style={{ fontSize: "0.7rem", margin: 0 }}>
                  {numeroQuestao <= provaSelecionada.questoes_gerais ? "Geral" : "Objetiva"}
                </ParagrafosStl>
              </div>

                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    cursor: "pointer",
                    padding: "0.35rem 0.6rem",
                    borderRadius: 6,
                    border: `1px solid ${respostasUsuario[numeroQuestao] === "A" ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)"}`,
                    backgroundColor: respostasUsuario[numeroQuestao] === "A" ? "rgba(65, 45, 21, 0.3)" : "transparent",
                    fontSize: "0.75rem",
                  }}>
                    <input
                      type="radio"
                      name={`resposta_${provaSelecionada.id}_${numeroQuestao}`}
                      value="A"
                      checked={respostasUsuario[numeroQuestao] === "A"}
                      onChange={() => toggleResposta(numeroQuestao, "A")}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    A
                  </label>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    cursor: "pointer",
                    padding: "0.35rem 0.6rem",
                    borderRadius: 6,
                    border: `1px solid ${respostasUsuario[numeroQuestao] === "B" ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)"}`,
                    backgroundColor: respostasUsuario[numeroQuestao] === "B" ? "rgba(65, 45, 21, 0.3)" : "transparent",
                    fontSize: "0.75rem",
                  }}>
                    <input
                      type="radio"
                      name={`resposta_${provaSelecionada.id}_${numeroQuestao}`}
                      value="B"
                      checked={respostasUsuario[numeroQuestao] === "B"}
                      onChange={() => toggleResposta(numeroQuestao, "B")}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    B
                  </label>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    cursor: "pointer",
                    padding: "0.35rem 0.6rem",
                    borderRadius: 6,
                    border: `1px solid ${respostasUsuario[numeroQuestao] === "C" ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)"}`,
                    backgroundColor: respostasUsuario[numeroQuestao] === "C" ? "rgba(65, 45, 21, 0.3)" : "transparent",
                    fontSize: "0.75rem",
                  }}>
                    <input
                      type="radio"
                      name={`resposta_${provaSelecionada.id}_${numeroQuestao}`}
                      value="C"
                      checked={respostasUsuario[numeroQuestao] === "C"}
                      onChange={() => toggleResposta(numeroQuestao, "C")}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    C
                  </label>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    cursor: "pointer",
                    padding: "0.35rem 0.6rem",
                    borderRadius: 6,
                    border: `1px solid ${respostasUsuario[numeroQuestao] === "D" ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)"}`,
                    backgroundColor: respostasUsuario[numeroQuestao] === "D" ? "rgba(65, 45, 21, 0.3)" : "transparent",
                    fontSize: "0.75rem",
                  }}>
                    <input
                      type="radio"
                      name={`resposta_${provaSelecionada.id}_${numeroQuestao}`}
                      value="D"
                      checked={respostasUsuario[numeroQuestao] === "D"}
                      onChange={() => toggleResposta(numeroQuestao, "D")}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    D
                  </label>
                  <label style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    cursor: "pointer",
                    padding: "0.35rem 0.6rem",
                    borderRadius: 6,
                    border: `1px solid ${respostasUsuario[numeroQuestao] === "E" ? theme.colors.marfim : "rgba(225, 220, 201, 0.15)"}`,
                    backgroundColor: respostasUsuario[numeroQuestao] === "E" ? "rgba(65, 45, 21, 0.3)" : "transparent",
                    fontSize: "0.75rem",
                  }}>
                    <input
                      type="radio"
                      name={`resposta_${provaSelecionada.id}_${numeroQuestao}`}
                      value="E"
                      checked={respostasUsuario[numeroQuestao] === "E"}
                      onChange={() => toggleResposta(numeroQuestao, "E")}
                      style={{ width: "1rem", height: "1rem" }}
                    />
                    E
                  </label>
                </div>

                <div style={{
                  marginTop: "0.5rem",
                  borderTop: `1px solid ${theme.colors.borders.suave}`,
                  paddingTop: "0.5rem",
                  display: "flex",
                  gap: "0.35rem",
                }}>
                  <ParagrafosStl $secundario style={{ fontSize: "0.7rem", flex: 1 }}>
                    Gab. Prelim:
                  </ParagrafosStl>
                  <div style={{ display: "flex", gap: "0.2rem" }}>
                    {["A", "B", "C", "D", "E"].map((alt) => (
                      <span
                        key={alt}
                        onClick={() => toggleGabaritoPreliminar(numeroQuestao, alt)}
                        style={{
                          display: "inline-block",
                          width: "1.1rem",
                          height: "1.1rem",
                          borderRadius: "50%",
                          border: `1px solid ${gabaritoPreliminarInput[numeroQuestao] === alt ? theme.colors.marfim : "rgba(225, 220, 201, 0.2)"}`,
                          backgroundColor: gabaritoPreliminarInput[numeroQuestao] === alt ? theme.colors.marfim : "transparent",
                          color: gabaritoPreliminarInput[numeroQuestao] === alt ? theme.colors.preto : theme.colors.textos.claroPrincipal,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textAlign: "center",
                          lineHeight: "1.1rem",
                          cursor: "pointer",
                        }}
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  gap: "0.35rem",
                }}>
                  <ParagrafosStl $secundario style={{ fontSize: "0.7rem", flex: 1 }}>
                    Gab. Definitivo:
                  </ParagrafosStl>
                  <div style={{ display: "flex", gap: "0.2rem" }}>
                    {["A", "B", "C", "D", "E"].map((alt) => (
                      <span
                        key={alt}
                        onClick={() => toggleGabaritoDefinitivo(numeroQuestao, alt)}
                        style={{
                          display: "inline-block",
                          width: "1.1rem",
                          height: "1.1rem",
                          borderRadius: "50%",
                          border: `1px solid ${gabaritoDefinitivoInput[numeroQuestao] === alt ? theme.colors.marfim : "rgba(225, 220, 201, 0.2)"}`,
                          backgroundColor: gabaritoDefinitivoInput[numeroQuestao] === alt ? theme.colors.marfim : "transparent",
                          color: gabaritoDefinitivoInput[numeroQuestao] === alt ? theme.colors.preto : theme.colors.textos.claroPrincipal,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textAlign: "center",
                          lineHeight: "1.1rem",
                          cursor: "pointer",
                        }}
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

          {Object.keys(respostasUsuario).length === 0 && (
            <ParagrafosStl $secundario style={{ marginTop: "1rem", textAlign: "center" }}>
              Nenhuma resposta preenchida ainda. Selecione as alternativas acima.
            </ParagrafosStl>
          )}
        </CardStl>
      )}

      {/* 4. LISTA DE PROVAS FEITAS */}
      <div>
        <TitulosSecundariosStl style={{ marginBottom: "1rem" }}>
          Suas Provas Realizadas ({provasInternas.length})
        </TitulosSecundariosStl>

        {provasInternas.length === 0 ? (
          <ParagrafosStl $secundario>
            Nenhuma prova cadastrada. Cadastre acima a primeira prova realizada!
          </ParagrafosStl>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {provasInternas.map((p) => (
              <ProvaItemCardStl
                key={p.id}
                $selecionado={provaSelecionada?.id === p.id}
                onClick={() => onSelecionarProva(p)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <BadgeStl>{p.data_realizacao}</BadgeStl>
                  <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{p.peso_geral}x peso</span>
                </div>
                <TitulosSecundariosStl style={{ fontSize: "1.2rem" }}>
                  {p.nome_prova}
                </TitulosSecundariosStl>
                <ParagrafosStl $secundario style={{ fontSize: "0.85rem" }}>
                  Mín. Geral: {p.nota_minima_geral} • Mín. Objetiva: {p.nota_minima_objetiva}
                </ParagrafosStl>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <BotaoPrimarioStl style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", width: "100%" }}>
                    {provaSelecionada?.id === p.id ? "✓ Prova Ativa" : "Selecionar Prova"}
                  </BotaoPrimarioStl>
                  <BotaoSecundarioStl
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAbrirEdicao(p);
                    }}
                  >
                    ✏️ Editar
                  </BotaoSecundarioStl>
                  <BotaoSecundarioStl
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExcluirProva(p);
                    }}
                  >
                    🗑️
                  </BotaoSecundarioStl>
                </div>
              </ProvaItemCardStl>
            ))}
          </div>
        )}
      </div>

      {/* FORMULÁRIO DE EDIÇÃO DE PROVA */}
      {editandoProvaId !== null && (
        <CardStl $destaqueBorda style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <TitulosSecundariosStl style={{ fontSize: "1.15rem" }}>
              ✏️ Editando Prova
            </TitulosSecundariosStl>
            <BotaoSecundarioStl
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
              onClick={handleFecharEdicao}
            >
              ✕ Cancelar
            </BotaoSecundarioStl>
          </div>

          <FormGridStl onSubmit={handleAtualizarProva}>
            <CampoStl style={{ gridColumn: "span 2" }}>
              <RotuloStl>Nome da Prova</RotuloStl>
              <InputStl
                type="text"
                required
                value={editNomeProva}
                onChange={(e) => setEditNomeProva(e.target.value)}
              />
            </CampoStl>

            <CampoStl>
              <RotuloStl>Total de Questões</RotuloStl>
              <InputStl
                type="number"
                min="0"
                value={editTotalQuestoes}
                onChange={(e) => setEditTotalQuestoes(e.target.value)}
              />
            </CampoStl>

            <CampoStl>
              <RotuloStl>Questões Objetivas</RotuloStl>
              <InputStl
                type="number"
                min="0"
                value={editQuestoesObjetivas}
                onChange={(e) => setEditQuestoesObjetivas(e.target.value)}
              />
            </CampoStl>

            <CampoStl>
              <RotuloStl>Questões Gerais</RotuloStl>
              <InputStl
                type="number"
                min="0"
                value={editQuestoesGerais}
                onChange={(e) => setEditQuestoesGerais(e.target.value)}
              />
            </CampoStl>

            <CampoStl>
              <RotuloStl>Peso Geral</RotuloStl>
              <InputStl
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={editPesoGeral}
                onChange={(e) => setEditPesoGeral(e.target.value)}
              />
            </CampoStl>

            <CampoStl>
              <RotuloStl>Peso Objetiva</RotuloStl>
              <InputStl
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={editPesoObjetivo}
                onChange={(e) => setEditPesoObjetivo(e.target.value)}
              />
            </CampoStl>

            <CampoStl style={{ gridColumn: "span 2" }}>
              <RotuloStl>Nota Mínima Geral (calculada automaticamente)</RotuloStl>
              <InputStl
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={editNotaMinimaGeral}
                readOnly
              />
              <ParagrafosStl $secundario style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Baseada na proporção de questões gerais × peso geral
              </ParagrafosStl>
            </CampoStl>

            <CampoStl style={{ gridColumn: "span 2" }}>
              <RotuloStl>Nota Mínima Objetiva (calculada automaticamente)</RotuloStl>
              <InputStl
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={editNotaMinimaObjetiva}
                readOnly
              />
              <ParagrafosStl $secundario style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Baseada na proporção de questões objetivas × peso objetivo
              </ParagrafosStl>
            </CampoStl>

            <CampoStl style={{ gridColumn: "span 2" }}>
              <RotuloStl>Nota de Corte (calculada automaticamente)</RotuloStl>
              <InputStl
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={editNotaCorte}
                readOnly
              />
              <ParagrafosStl $secundario style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Média ponderada das notas mínimas geral e objetiva
              </ParagrafosStl>
            </CampoStl>

            <CampoStl>
              <RotuloStl>Data da Prova</RotuloStl>
              <InputStl
                type="date"
                required
                value={editDataRealizacao}
                onChange={(e) => setEditDataRealizacao(e.target.value)}
              />
            </CampoStl>

            <BotaoPrimarioStl
              type="submit"
              disabled={atualizandoProva}
              style={{ gridColumn: "span 2", fontSize: "0.9rem", padding: "0.75rem" }}
            >
              {atualizandoProva ? "Atualizando..." : "💾 Salvar Alterações"}
            </BotaoPrimarioStl>
          </FormGridStl>
        </CardStl>
      )}
    </ContainerStl>
  );
};
