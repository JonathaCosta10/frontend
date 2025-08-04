import { useState } from "react";

interface ViaCepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface AddressData {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export const useViaCep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCep = (cep: string): string => {
    // Remove todos os caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");
    
    // Aplica máscara se tiver 8 dígitos
    if (cleanCep.length === 8) {
      return cleanCep.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    
    return cleanCep;
  };

  const searchCep = async (cep: string): Promise<AddressData | null> => {
    const cleanCep = cep.replace(/\D/g, "");
    
    if (cleanCep.length !== 8) {
      setError("CEP deve ter 8 dígitos");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro na requisição para ViaCEP");
      }

      const data: ViaCepData = await response.json();

      if (data.erro) {
        setError("CEP não encontrado");
        return null;
      }

      // Retorna os dados formatados para nossa interface
      return {
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf
      };
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setError("Erro ao buscar informações do CEP");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchCep,
    formatCep,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
