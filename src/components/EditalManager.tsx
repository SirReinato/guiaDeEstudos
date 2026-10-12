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

const ContainerStl = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 1.5rem 0;
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

  &:focus {
    border-color: ${theme.colors.marfim};
  }
`;

const EditalItemCardStl = styled.div<{ $selecionado: boolean }>`
  background-color: ${theme.colors.background.card};
  border: ${(props) =>
    props.$selecionado
      ? `2px solid ${theme.colors.marfim}`
      : theme.colors.borders.suave};
  border-radius: 10px;
  padding: 1.25rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    border-color: ${theme.colors.marfim};
    transform: translateY(-2px);
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

interface Props {
  editais: EditalCompleto[];
  onRecarregar: () => void;
  editalSelecionado: EditalCompleto | null;
  onSelecionarEdital: (edital: EditalCompleto | null) => void;
}

export const EditalManager: React.FC<Props> = ({
  editais,
  onRecarregar,
  editalSelecionado,
  onSelecionarEdital,
}) => {
  const { user } = useAuth();
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaBanca, setNovaBanca] = useState("Cebraspe");
  const [novoOrgao, setNovoOrgao] = useState("");
  const [novoAno, setNovoAno] = useState(new Date().getFullYear());
  const [salvandoEdital, setSalvandoEdital] = useState(false);

  // Estados para nova disciplina
  const [nomeDisciplina, setNomeDisciplina] = useState("");
  const [adicionandoDisc, setAdicionandoDisc] = useState(false);

  // Estados para novo tópico
  const [disciplinaAtivaId, setDisciplinaAtivaId] = useState<string | null>(null);
  const [tituloTopico, setTituloTopico] = useState("");
  const [relevanciaTopico, setRelevanciaTopico] = useState(4);

  // Criar Edital
  const handleCriarEdital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !novoTitulo.trim()) return;

    setSalvandoEdital(true);
    const { data, error } = await editaisService.criarEdital({
      titulo: novoTitulo.trim(),
      banca: novaBanca,
      orgao: novoOrgao.trim(),
      ano: Number(novoAno),
      user_id: user.id,
    });

    if (error) {
      alert(`Erro ao criar edital: ${error.message}`);
    } else {
      setNovoTitulo("");
      setNovoOrgao("");
      onRecarregar();
      if (data) {
        onSelecionarEdital(data as EditalCompleto);
      }
    }
    setSalvandoEdital(false);
  };

  // Excluir Edital
  const handleExcluirEdital = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este edital e todo o conteúdo dele?")) return;
    await editaisService.excluirEdital(id);
    if (editalSelecionado?.id === id) {
      onSelecionarEdital(null);
    }
    onRecarregar();
  };

  // Adicionar Disciplina
  const handleAdicionarDisciplina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editalSelecionado || !nomeDisciplina.trim()) return;

    setAdicionandoDisc(true);
    const { error } = await editaisService.criarDisciplina(
      editalSelecionado.id,
      nomeDisciplina.trim()
    );

    if (error) {
      alert(`Erro ao criar disciplina: ${error.message}`);
    } else {
      setNomeDisciplina("");
      onRecarregar();
    }
    setAdicionandoDisc(false);
  };

  // Adicionar Tópico
  const handleAdicionarTopico = async (disciplinaId: string) => {
    if (!tituloTopico.trim()) return;

    const { error } = await editaisService.criarTopico({
      disciplinaId,
      titulo: tituloTopico.trim(),
      relevanciaBanca: relevanciaTopico,
    });

    if (error) {
      alert(`Erro ao criar tópico: ${error.message}`);
    } else {
      setTituloTopico("");
      setDisciplinaAtivaId(null);
      onRecarregar();
    }
  };

  return (
    <ContainerStl>
      {/* 1. Card de Criação de Novo Edital */}
      <CardStl $destaqueBorda>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <BadgeStl>Etapa 3 • Conteúdo Programático</BadgeStl>
            <TitulosSecundariosStl style={{ marginTop: "0.5rem" }}>
              Cadastrar Novo Edital de Concurso
            </TitulosSecundariosStl>
          </div>
        </div>

        <FormGridStl onSubmit={handleCriarEdital}>
          <CampoStl style={{ gridColumn: "span 2" }}>
            <RotuloStl>Título do Concurso / Cargo</RotuloStl>
            <InputStl
              type="text"
              required
              placeholder="Ex: Auditor de TI - TCU"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Banca Examinadora</RotuloStl>
            <SelectStl value={novaBanca} onChange={(e) => setNovaBanca(e.target.value)}>
              <option value="Cebraspe">Cebraspe (Certo/Errado)</option>
              <option value="FGV">FGV (Múltipla Escolha)</option>
              <option value="FCC">FCC (Múltipla Escolha)</option>
              <option value="Cesgranrio">Cesgranrio</option>
              <option value="Vunesp">Vunesp</option>
              <option value="Outra">Outra Banca</option>
            </SelectStl>
          </CampoStl>

          <CampoStl>
            <RotuloStl>Órgão / Empresa</RotuloStl>
            <InputStl
              type="text"
              placeholder="Ex: Tribunal de Contas da União"
              value={novoOrgao}
              onChange={(e) => setNovoOrgao(e.target.value)}
            />
          </CampoStl>

          <CampoStl>
            <RotuloStl>Ano</RotuloStl>
            <InputStl
              type="number"
              value={novoAno}
              onChange={(e) => setNovoAno(Number(e.target.value))}
            />
          </CampoStl>

          <BotaoPrimarioStl type="submit" disabled={salvandoEdital}>
            {salvandoEdital ? "Cadastrando..." : "➕ Adicionar Edital"}
          </BotaoPrimarioStl>
        </FormGridStl>
      </CardStl>

      {/* 2. Seleção de Editais Cadastrados */}
      <div>
        <TitulosSecundariosStl style={{ marginBottom: "1rem" }}>
          Seus Editais Cadastrados ({editais.length})
        </TitulosSecundariosStl>

        {editais.length === 0 ? (
          <ParagrafosStl $secundario>
            Você ainda não cadastrou nenhum edital. Utilize o formulário acima para criar o primeiro!
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
                  {ed.orgao || "Órgão não informado"} • {ed.disciplinas?.length || 0} Disciplina(s)
                </ParagrafosStl>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <BotaoPrimarioStl
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", width: "100%" }}
                  >
                    {editalSelecionado?.id === ed.id ? "✓ Edital Ativo" : "Selecionar Edital"}
                  </BotaoPrimarioStl>
                  <BotaoSecundarioStl
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
                    onClick={(e) => handleExcluirEdital(ed.id, e)}
                  >
                    🗑️
                  </BotaoSecundarioStl>
                </div>
              </EditalItemCardStl>
            ))}
          </div>
        )}
      </div>

      {/* 3. Árvore de Disciplinas e Tópicos do Edital Selecionado */}
      {editalSelecionado && (
        <CardStl $destaqueBorda style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <BadgeStl>Edital Selecionado</BadgeStl>
              <TitulosSecundariosStl style={{ marginTop: "0.4rem" }}>
                Conteúdo Programático: {editalSelecionado.titulo}
              </TitulosSecundariosStl>
            </div>

            {/* Formulário para adicionar Disciplina */}
            <form onSubmit={handleAdicionarDisciplina} style={{ display: "flex", gap: "0.5rem" }}>
              <InputStl
                type="text"
                placeholder="Nova disciplina (ex: Banco de Dados)"
                value={nomeDisciplina}
                onChange={(e) => setNomeDisciplina(e.target.value)}
                style={{ width: "250px" }}
              />
              <BotaoPrimarioStl type="submit" disabled={adicionandoDisc} style={{ fontSize: "0.85rem" }}>
                {adicionandoDisc ? "Salvando..." : "➕ Disciplina"}
              </BotaoPrimarioStl>
            </form>
          </div>

          <ArvoreContainerStl>
            {(!editalSelecionado.disciplinas || editalSelecionado.disciplinas.length === 0) ? (
              <ParagrafosStl $secundario style={{ padding: "1.5rem 0", textAlign: "center" }}>
                Nenhuma disciplina cadastrada neste edital ainda. Adicione a primeira disciplina acima!
              </ParagrafosStl>
            ) : (
              editalSelecionado.disciplinas.map((disc) => (
                <DisciplinaCardStl key={disc.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <TitulosSecundariosStl style={{ fontSize: "1.25rem" }}>
                      📖 {disc.nome}
                    </TitulosSecundariosStl>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <BotaoSecundarioStl
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                        onClick={() =>
                          setDisciplinaAtivaId(disciplinaAtivaId === disc.id ? null : disc.id)
                        }
                      >
                        {disciplinaAtivaId === disc.id ? "Cancelar" : "➕ Adicionar Tópico"}
                      </BotaoSecundarioStl>
                      <BotaoSecundarioStl
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.6rem" }}
                        onClick={async () => {
                          if (confirm(`Excluir a disciplina "${disc.nome}"?`)) {
                            await editaisService.excluirDisciplina(disc.id);
                            onRecarregar();
                          }
                        }}
                      >
                        ✕
                      </BotaoSecundarioStl>
                    </div>
                  </div>

                  {/* Form inline para novo tópico na disciplina */}
                  {disciplinaAtivaId === disc.id && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        padding: "0.75rem",
                        backgroundColor: theme.colors.background.card,
                        borderRadius: "6px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <InputStl
                        type="text"
                        placeholder="Nome do Tópico (Ex: Índices B-Tree vs Hash)"
                        value={tituloTopico}
                        onChange={(e) => setTituloTopico(e.target.value)}
                        style={{ flex: 1, minWidth: "200px" }}
                      />
                      <SelectStl
                        value={relevanciaTopico}
                        onChange={(e) => setRelevanciaTopico(Number(e.target.value))}
                        style={{ width: "160px" }}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ Altíssima</option>
                        <option value={4}>⭐⭐⭐⭐ Alta</option>
                        <option value={3}>⭐⭐⭐ Média</option>
                        <option value={2}>⭐⭐ Baixa</option>
                        <option value={1}>⭐ Rara</option>
                      </SelectStl>
                      <BotaoPrimarioStl
                        style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                        onClick={() => handleAdicionarTopico(disc.id)}
                      >
                        Salvar Tópico
                      </BotaoPrimarioStl>
                    </div>
                  )}

                  {/* Grade de tópicos da disciplina */}
                  <TopicosGridStl>
                    {(!disc.topicos || disc.topicos.length === 0) ? (
                      <ParagrafosStl $secundario style={{ fontSize: "0.85rem", fontStyle: "italic" }}>
                        Nenhum tópico cadastrado nesta matéria ainda.
                      </ParagrafosStl>
                    ) : (
                      disc.topicos.map((top) => (
                        <TopicoItemStl key={top.id}>
                          <div>
                            <ParagrafosStl style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                              {top.titulo}
                            </ParagrafosStl>
                            <RelevanciaEstrelasStl title={`Relevância da banca: ${top.relevancia_banca}/5`}>
                              {"★".repeat(top.relevancia_banca)}
                              {"☆".repeat(5 - top.relevancia_banca)}
                            </RelevanciaEstrelasStl>
                          </div>
                          <BotaoSecundarioStl
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
                            onClick={async () => {
                              if (confirm(`Remover tópico "${top.titulo}"?`)) {
                                await editaisService.excluirTopico(top.id);
                                onRecarregar();
                              }
                            }}
                          >
                            ✕
                          </BotaoSecundarioStl>
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
