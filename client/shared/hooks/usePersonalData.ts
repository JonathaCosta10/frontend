import { useState, useEffect } from "react";
import { api } from '@/lib/api';

interface PersonalData {
  nome_completo?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  profissao?: string;
  endereco?: string;
  numero?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_nascimento?: string;
  genero?: string;
  renda_mensal?: string;
  objetivos_financeiros?: string;
}

export const usePersonalData = () => {
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonalData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await api.get("/api/dadospessoais/");
      
      if (data && typeof data === "object") {
        setPersonalData(data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados pessoais:", error);
      setError("Erro ao carregar dados pessoais");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalData();
  }, []);

  return {
    personalData,
    isLoading,
    error,
    refetch: loadPersonalData
  };
};
