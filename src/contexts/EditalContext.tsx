import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { editaisService, type EditalCompleto } from "../services/editaisService";
import { useAuth } from "./AuthContext";

interface MetricasEdital {
  totalDisciplinas: number;
  totalTopicos: number;
  topicosAltaRelevancia: number; // Relevância 4 ou 5 estrelas
  banca: string;
  orgao?: string;
  ano?: number;
}

interface EditalContextType {
  editais: EditalCompleto[];
  editalAtivo: EditalCompleto | null;
  metricasEdital: MetricasEdital | null;
  loadingEditais: boolean;
  selecionarEdital: (id: string) => void;
  carregarEditais: () => Promise<void>;
  topicoIdsEditalAtivo: Set<string>;
}

const EditalContext = createContext<EditalContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "guia_estudos_edital_ativo_id";

export const EditalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [editais, setEditais] = useState<EditalCompleto[]>([]);
  const [editalAtivoId, setEditalAtivoId] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) || null;
  });
  const [loadingEditais, setLoadingEditais] = useState<boolean>(false);

  const carregarEditais = useCallback(async () => {
    if (!user) {
      setEditais([]);
      return;
    }
    setLoadingEditais(true);
    try {
      const { data } = await editaisService.listarEditais();
      if (data) {
        setEditais(data);
        // Se já existe um salvo no localStorage e ele existe na lista, mantém.
        // Senão, se temos editais e nenhum salvo ou o salvo não existe mais, seleciona o primeiro.
        const salvo = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existeSalvo = salvo && data.some((e) => e.id === salvo);

        if (existeSalvo) {
          setEditalAtivoId(salvo);
        } else if (data.length > 0) {
          setEditalAtivoId(data[0].id);
          localStorage.setItem(LOCAL_STORAGE_KEY, data[0].id);
        } else {
          setEditalAtivoId(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar editais:", err);
    } finally {
      setLoadingEditais(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      carregarEditais();
    } else {
      setEditais([]);
      setEditalAtivoId(null);
    }
  }, [user, carregarEditais]);

  const selecionarEdital = useCallback((id: string) => {
    setEditalAtivoId(id);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  }, []);

  // Encontra o edital ativo atual
  const editalAtivo = useMemo(() => {
    if (!editalAtivoId || editais.length === 0) return null;
    return editais.find((e) => e.id === editalAtivoId) || editais[0] || null;
  }, [editais, editalAtivoId]);

  // Set com todos os IDs de tópicos pertencentes ao edital ativo
  const topicoIdsEditalAtivo = useMemo(() => {
    const ids = new Set<string>();
    if (!editalAtivo || !editalAtivo.disciplinas) return ids;

    for (const disc of editalAtivo.disciplinas) {
      if (disc.topicos) {
        for (const top of disc.topicos) {
          ids.add(top.id);
        }
      }
    }
    return ids;
  }, [editalAtivo]);

  // Métricas calculadas do edital ativo
  const metricasEdital = useMemo<MetricasEdital | null>(() => {
    if (!editalAtivo) return null;

    let totalTopicos = 0;
    let topicosAltaRelevancia = 0;

    if (editalAtivo.disciplinas) {
      for (const disc of editalAtivo.disciplinas) {
        if (disc.topicos) {
          totalTopicos += disc.topicos.length;
          for (const top of disc.topicos) {
            if ((top.relevancia_banca || 0) >= 4) {
              topicosAltaRelevancia++;
            }
          }
        }
      }
    }

    return {
      totalDisciplinas: editalAtivo.disciplinas?.length || 0,
      totalTopicos,
      topicosAltaRelevancia,
      banca: editalAtivo.banca || "Geral",
      orgao: editalAtivo.orgao,
      ano: editalAtivo.ano,
    };
  }, [editalAtivo]);

  return (
    <EditalContext.Provider
      value={{
        editais,
        editalAtivo,
        metricasEdital,
        loadingEditais,
        selecionarEdital,
        carregarEditais,
        topicoIdsEditalAtivo,
      }}
    >
      {children}
    </EditalContext.Provider>
  );
};

export const useEdital = () => {
  const context = useContext(EditalContext);
  if (!context) {
    throw new Error("useEdital deve ser usado dentro de um EditalProvider");
  }
  return context;
};
