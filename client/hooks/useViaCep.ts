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
    
    // Garante que não temos mais de 8 dígitos
    const truncatedCep = cleanCep.slice(0, 8);
    
    // Aplica máscara se tiver 5 ou mais dígitos
    if (truncatedCep.length >= 5) {
      // Os primeiros 5 dígitos
      const firstPart = truncatedCep.substring(0, 5);
      
      // Os dígitos restantes (até 3)
      const secondPart = truncatedCep.substring(5);
      
      // Se tivermos dígitos na segunda parte, adicionamos com hífen
      if (secondPart) {
        return `${firstPart}-${secondPart}`;
      }
      
      // Se tivermos apenas os 5 primeiros dígitos, retornamos sem hífen
      return firstPart;
    }
    
    // Retorna sem formatação se tiver menos de 5 dígitos
    return truncatedCep;
  };

  const searchCep = async (cep: string): Promise<AddressData | null> => {
    // Remove caracteres não numéricos para obter apenas os dígitos
    const cleanCep = cep.replace(/\D/g, "");
    
    console.log(`🔎 Buscando CEP limpo: ${cleanCep} (original: ${cep})`);
    
    if (cleanCep.length !== 8) {
      const errorMsg = `CEP deve ter 8 dígitos. Atual: ${cleanCep.length}`;
      console.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `https://viacep.com.br/ws/${cleanCep}/json/`;
      console.log(`Fazendo requisição para ViaCEP: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error(`Resposta não-ok da API ViaCEP: ${response.status} ${response.statusText}`);
        throw new Error(`Erro na requisição para ViaCEP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da API ViaCEP:", data);

      // Verificar se a API retornou um erro explícito
      if (data.erro === true) {
        console.warn("API ViaCEP retornou erro=true para o CEP:", cleanCep);
        setError("CEP não encontrado");
        return null;
      }
      
      // Verificar se os dados essenciais foram retornados
      if (!data.localidade || !data.uf) {
        console.warn("API ViaCEP retornou dados incompletos:", data);
        setError("Dados do CEP incompletos");
        return null;
      }

      // Retorna os dados formatados para nossa interface
      return {
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || ""
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
