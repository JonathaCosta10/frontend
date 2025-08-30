import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../contexts/TranslationContext";
import { localStorageManager } from "../../../lib/localStorage";
import { api } from "../../../lib/api";
import { useViaCep } from "../../../hooks/useViaCep";
import { useProfileVerification } from "../../../hooks/useProfileVerification";
import SubscriptionGuard from "../../../components/SubscriptionGuard";
import { 
  User, 
  Settings, 
  CreditCard, 
  Crown, 
  TrendingUp, 
  Target, 
  BarChart3,
  Shield,
  DollarSign,
  Edit,
  Save,
  X,
  Trophy,
  Award,
  Star,
  CheckCircle,
  MapPin
} from "lucide-react";

interface PersonalData {
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  profissao: string;
  // Campos adicionais da API
  endereco?: string;
  numero?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  bairro?: string;
  dataNascimento?: string;
  genero?: string;
  rendaMensal?: string;
  objetivosFinanceiros?: string;
}

// Interface para comunicação com a API (snake_case)
interface PersonalDataAPI {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  data_nascimento?: string;
  genero?: string;
  profissao?: string;
  renda_mensal?: string;
  objetivos_financeiros?: string;
}

interface FinancialStats {
  totalInvestments: string;
  monthlyBudget: string;
  goalsAchieved: number;
  riskProfile: string;
  // Adicionar mais campos do resumo
  monthlyIncome: string;
  savingsPercentage: number;
  activeInvestments: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: string;
  isEarned: boolean;
  category: "investment" | "savings" | "goals" | "streak";
}

const PerfilPage: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { isPaidUser, profile } = useProfileVerification();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Hook do ViaCEP
  const { searchCep, formatCep } = useViaCep();
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [addressFound, setAddressFound] = useState(false);
  const [cepChanged, setCepChanged] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData>({
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    email: "",
    profissao: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    dataNascimento: "",
    genero: "",
    rendaMensal: "",
    objetivosFinanceiros: ""
  });

  // Mock financial stats for demo
  const [stats] = useState<FinancialStats>({
    totalInvestments: "R$ 15.750,00",
    monthlyBudget: "R$ 3.200,00",
    goalsAchieved: 3,
    riskProfile: "Moderado",
    monthlyIncome: "R$ 5.500,00",
    savingsPercentage: 25,
    activeInvestments: 8
  });

  // Mock achievements data
  const [achievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Primeiro Investimento",
      description: "Realizou seu primeiro investimento",
      icon: "trophy",
      earnedDate: "2024-01-15",
      isEarned: true,
      category: "investment"
    },
    {
      id: "2", 
      title: "Meta Alcançada",
      description: "Atingiu sua primeira meta financeira",
      icon: "target",
      earnedDate: "2024-02-20",
      isEarned: true,
      category: "goals"
    },
    {
      id: "3",
      title: "Poupador Consistente",
      description: "Manteve taxa de poupança acima de 20% por 3 meses",
      icon: "star",
      earnedDate: "2024-03-10",
      isEarned: true,
      category: "savings"
    },
    {
      id: "4",
      title: "Diversificador",
      description: "Possui investimentos em 5 ou mais categorias",
      icon: "award",
      isEarned: false,
      category: "investment"
    },
    {
      id: "5",
      title: "Disciplina de Ferro",
      description: "30 dias consecutivos registrando gastos",
      icon: "award",
      isEarned: false,
      category: "streak"
    }
  ]);

  const loadPersonalData = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando carregamento de dados pessoais...");
      
      // Usar a API service configurada corretamente
      const data = await api.get("/api/dadospessoais/");
      
      console.log("Dados recebidos da API:", data);

      if (data && typeof data === "object") {
        // Usar a nova função de conversão
        const convertedData = convertFromAPI(data);
        setPersonalData(convertedData);
        console.log("Estado atualizado com dados convertidos:", convertedData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados pessoais:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados pessoais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Marcar que os dados foram carregados para evitar requisições repetidas
      setInitialDataLoaded(true);
    }
  };

  // Estado para controlar se já fizemos a requisição inicial para evitar loops
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    // Se já carregamos os dados uma vez e eles existem, não precisamos carregar novamente
    if (initialDataLoaded && personalData.email) {
      console.log("Dados já carregados anteriormente, evitando nova requisição.");
      return;
    }

    // Apenas carregar dados se o usuário estiver autenticado
    if (isAuthenticated && user) {
      const userIsPremium = isPaidUser();
      console.log("Carregando dados pessoais do perfil...", {
        isPremium: userIsPremium,
        profileType: profile?.subscriptionType
      });
      loadPersonalData();
    }
  }, [isAuthenticated, user, initialDataLoaded]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validações obrigatórias conforme especificação da API
      if (!validateCPF(personalData.cpf)) {
        toast({
          title: "Erro de Validação",
          description: "CPF deve ter exatamente 11 dígitos",
          variant: "destructive",
        });
        return;
      }

      if (!validateEmail(personalData.email)) {
        toast({
          title: "Erro de Validação", 
          description: "Email deve ter um formato válido",
          variant: "destructive",
        });
        return;
      }

      if (!personalData.nomeCompleto.trim()) {
        toast({
          title: "Erro de Validação",
          description: "Nome completo é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Validações opcionais
      if (personalData.cep && !validateCEP(personalData.cep)) {
        toast({
          title: "Erro de Validação",
          description: "CEP deve ter exatamente 8 dígitos",
          variant: "destructive",
        });
        return;
      }

      if (personalData.estado && !validateEstado(personalData.estado)) {
        toast({
          title: "Erro de Validação",
          description: "Estado deve ter exatamente 2 caracteres (ex: SP, RJ)",
          variant: "destructive",
        });
        return;
      }
      
      // Converter dados para formato da API
      const apiData = convertToAPI(personalData);
      
      // Usar POST para criar ou PUT para atualizar (a API decidirá baseado na existência)
      await api.post("/api/dadospessoais/", apiData);

      toast({
        title: "Sucesso",
        description: "Dados pessoais salvos com sucesso",
      });
      
      setIsEditing(false);
      
      // Recarregar dados do servidor para garantir consistência
      // Primeiro, resetamos a flag de carregamento inicial
      setInitialDataLoaded(false);
      // Em seguida, recarregamos os dados
      loadPersonalData();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados pessoais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

    // Handler para mudança do CEP com busca automática
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    
    // Garante que não temos mais de 8 dígitos
    const truncatedRawValue = rawValue.slice(0, 8);
    
    // Formata com hífen automático quando digitar 5 ou mais números
    const formattedCep = formatCep(truncatedRawValue);
    
    // Atualiza o campo com o valor formatado
    e.target.value = formattedCep;
    
    // Marcamos que o CEP foi editado pelo menos uma vez
    setCepChanged(true);
    
    // Limpa erros anteriores e status apenas quando o usuário está digitando
    if (truncatedRawValue.length < 8) {
      setCepError(null);
    }
    setAddressFound(false);
    
    // Atualiza o CEP no estado
    setPersonalData(prev => ({ ...prev, cep: formattedCep }));
    
    // Busca automática quando CEP tem 8 dígitos
    if (truncatedRawValue.length === 8) {
      console.log(`🔍 Buscando CEP: ${truncatedRawValue}`);
      
      // Indica que está carregando
      setCepLoading(true);
      
      toast({
        title: "Buscando CEP",
        description: "Consultando endereço...",
      });
      
      try {
        console.log(`👉 Iniciando busca do CEP: ${truncatedRawValue}`);
        const address = await searchCep(truncatedRawValue);
        
        // Verificamos se a busca foi bem sucedida
        if (address && address.cidade && address.estado) {
          console.log("✅ Endereço encontrado:", address);
          
          toast({
            title: "CEP encontrado",
            description: `${address.endereco ? address.endereco : ''} ${address.bairro ? '- ' + address.bairro : ''}, ${address.cidade}/${address.estado}`,
          });
          
          setAddressFound(true);
          
          setPersonalData(prev => ({
            ...prev,
            endereco: address.endereco || prev.endereco,
            cidade: address.cidade || prev.cidade,
            estado: address.estado || prev.estado,
            bairro: address.bairro || prev.bairro || ""
          }));
        } else {
          console.log("⚠️ CEP não encontrado");
          setCepError("CEP não encontrado. Verifique o número informado.");
          
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP informado e tente novamente",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Erro ao buscar CEP:", error);
        setCepError("Erro ao consultar o CEP. Tente novamente mais tarde.");
        
        toast({
          title: "Erro",
          description: "Não foi possível buscar o CEP. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setCepLoading(false);
      }
    } else if (rawValue.length > 0 && rawValue.length < 8) {
      // Apenas mostrar erro de CEP incompleto se o usuário já digitou algo e parou de digitar
      // Para evitar mostrar erros enquanto o usuário ainda está digitando
      if (rawValue.length >= 5) {  // Mostrar erro só depois de digitado mais da metade do CEP
        setCepError("CEP incompleto. Digite os 8 dígitos.");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile.toLowerCase()) {
      case "conservador":
        return "bg-green-100 text-green-800";
      case "moderado":
        return "bg-yellow-100 text-yellow-800";
      case "arrojado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAchievementIcon = (iconType: string) => {
    switch (iconType) {
      case "trophy":
        return Trophy;
      case "target":
        return Target;
      case "star":
        return Star;
      case "award":
        return Award;
      default:
        return Trophy;
    }
  };

  const getAchievementCategoryColor = (category: string) => {
    switch (category) {
      case "investment":
        return "bg-blue-100 text-blue-800";
      case "savings":
        return "bg-green-100 text-green-800";
      case "goals":
        return "bg-purple-100 text-purple-800";
      case "streak":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Funções de validação conforme especificação da API
  const validateCPF = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCEP = (cep: string): boolean => {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  };

  const validateEstado = (estado: string): boolean => {
    return estado.length === 2;
  };

  // Função para formatar CPF com máscara
  const formatCPF = (cpf: string): string => {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length <= 11) {
      return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  // Função para converter dados do frontend para API
  const convertToAPI = (data: PersonalData): PersonalDataAPI => {
    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    let apiDate = "";
    if (data.dataNascimento && data.dataNascimento.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = data.dataNascimento.split('/');
      apiDate = `${year}-${month}-${day}`;
    }

    return {
      nome_completo: data.nomeCompleto,
      cpf: data.cpf.replace(/\D/g, ''), // Remove máscara do CPF: 000.000.000-00 → 00000000000
      email: data.email,
      telefone: data.telefone?.replace(/\D/g, ''), // Remove máscara do telefone: (11) 9XXXX-XXXX → 11900000000
      endereco: data.endereco,
      numero: data.numero,
      cep: data.cep?.replace(/\D/g, ''), // Remove máscara do CEP: 00000-000 → 00000000
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      data_nascimento: apiDate || undefined,
      genero: data.genero,
      profissao: data.profissao,
      renda_mensal: data.rendaMensal,
      objetivos_financeiros: data.objetivosFinanceiros
    };
  };

  // Função para converter dados da API para frontend
  const convertFromAPI = (data: any): PersonalData => {
    // Converter data de YYYY-MM-DD para DD/MM/YYYY
    let formattedDate = "";
    if (data.data_nascimento && data.data_nascimento.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = data.data_nascimento.split('-');
      formattedDate = `${day}/${month}/${year}`;
    }

    // Formatar CEP se vier da API (pode vir formatado 00000-000 ou limpo 00000000)
    let formattedCep = "";
    if (data.cep) {
      const cleanCep = data.cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        formattedCep = `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
      } else {
        formattedCep = data.cep; // Manter como está se não for o formato esperado
      }
    }

    // Formatar CPF se vier da API (pode vir limpo 00000000000)
    let formattedCpf = "";
    if (data.cpf) {
      const cleanCpf = data.cpf.replace(/\D/g, '');
      if (cleanCpf.length === 11) {
        formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else {
        formattedCpf = data.cpf; // Manter como está se não for o formato esperado
      }
    }

    // Formatar telefone se vier da API (pode vir limpo 11900000000)
    let formattedPhone = "";
    if (data.telefone) {
      const cleanPhone = data.telefone.replace(/\D/g, '');
      if (cleanPhone.length === 11) {
        formattedPhone = `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
      } else if (cleanPhone.length === 10) {
        formattedPhone = `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
      } else {
        formattedPhone = data.telefone; // Manter como está se não for o formato esperado
      }
    }

    return {
      nomeCompleto: data.nome_completo || "",
      cpf: formattedCpf,
      telefone: formattedPhone,
      email: data.email || "",
      profissao: data.profissao || "",
      endereco: data.endereco || "",
      numero: data.numero || "",
      bairro: data.bairro || "",
      cidade: data.cidade || "",
      estado: data.estado || "",
      cep: formattedCep,
      dataNascimento: formattedDate,
      genero: data.genero || "",
      rendaMensal: data.renda_mensal || "",
      objetivosFinanceiros: data.objetivos_financeiros || ""
    };
  };

  const getCategoryNameInPortuguese = (category: string) => {
    switch (category) {
      case "investment":
        return "Investimento";
      case "savings":
        return "Poupança";
      case "goals":
        return "Metas";
      case "streak":
        return "Sequência";
      default:
        return category;
    }
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: string): string => {
    if (!value) return "Não informado";
    
    // Remove caracteres não numéricos e pontos/vírgulas
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Se já está no formato monetário, retorna como está
    if (value.startsWith('R$')) {
      return value;
    }
    
    // Converte para número
    const numericValue = parseFloat(cleanValue.replace(',', '.'));
    
    if (isNaN(numericValue)) {
      return value; // Retorna o valor original se não conseguir converter
    }
    
    // Formata como moeda brasileira
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para formatar data para exibição (DD/MM/YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "Não informado";
    
    // Se a data estiver no formato YYYY-MM-DD da API
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return dateString; // Retorna como está se não estiver no formato esperado
  };

  // Função para formatar gênero para exibição
  const formatGenderForDisplay = (gender: string): string => {
    if (!gender) return "Não informado";
    
    const genderMap: { [key: string]: string } = {
      "feminino": "Feminino",
      "masculino": "Masculino",
      "nao-binario": "Não-binário",
      "genero-fluido": "Gênero fluido",
      "agênero": "Agênero",
      "outro": "Outro",
      "prefiro-nao-informar": "Prefiro não informar"
    };
    
    return genderMap[gender] || gender;
  };

  // Função para formatar telefone para exibição (11) 9XXXX-XXXX
  const formatPhoneForDisplay = (phone: string): string => {
    if (!phone) return "Não informado";
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se tiver 11 dígitos (celular com DDD)
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    }
    
    // Se tiver 10 dígitos (fixo com DDD)
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
    }
    
    return phone; // Retorna como está se não estiver no formato esperado
  };

  // Handler específico para CPF com formatação e validação
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formattedCPF = rawValue;
    
    // Aplicar máscara progressivamente
    if (rawValue.length >= 11) {
      formattedCPF = rawValue.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (rawValue.length >= 9) {
      formattedCPF = rawValue.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3-');
    } else if (rawValue.length >= 6) {
      formattedCPF = rawValue.replace(/(\d{3})(\d{3})/, '$1.$2.');
    } else if (rawValue.length >= 3) {
      formattedCPF = rawValue.replace(/(\d{3})/, '$1.');
    }
    
    setPersonalData(prev => ({ ...prev, cpf: formattedCPF }));
  };

  // Handler para estado com validação
  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 2); // Máximo 2 caracteres, maiúsculo
    setPersonalData(prev => ({ ...prev, estado: value }));
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formattedPhone = rawValue;
    
    // Formatar automaticamente durante a digitação
    if (rawValue.length >= 11) {
      formattedPhone = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 7)}-${rawValue.slice(7, 11)}`;
    } else if (rawValue.length >= 10) {
      formattedPhone = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 6)}-${rawValue.slice(6)}`;
    } else if (rawValue.length >= 6) {
      formattedPhone = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 6)}-${rawValue.slice(6)}`;
    } else if (rawValue.length >= 2) {
      formattedPhone = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2)}`;
    }
    
    setPersonalData(prev => ({ ...prev, telefone: formattedPhone }));
  };

  // Handler para formatar valores monetários durante a digitação
  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    if (digits === '') {
      setPersonalData(prev => ({ ...prev, rendaMensal: '' }));
      return;
    }
    
    // Converte para número e divide por 100 para ter os centavos
    const amount = parseFloat(digits) / 100;
    
    // Formata como moeda brasileira
    const formatted = amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    setPersonalData(prev => ({ ...prev, rendaMensal: formatted }));
  };

  // Handler específico para data com formatação automática
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formattedDate = rawValue;
    
    // Formatar automaticamente durante a digitação DD/MM/YYYY
    if (rawValue.length >= 8) {
      formattedDate = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}/${rawValue.slice(4, 8)}`;
    } else if (rawValue.length >= 4) {
      formattedDate = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}/${rawValue.slice(4)}`;
    } else if (rawValue.length >= 2) {
      formattedDate = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
    }
    
    setPersonalData(prev => ({ ...prev, dataNascimento: formattedDate }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground text-center">
              Você precisa estar logado para acessar esta página
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-3 md:space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
              <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e configurações</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Badge variant="outline" className="text-blue-600 border-blue-600 bg-white px-3 py-1">
              <User className="h-3 w-3 mr-1" />
              {user?.email}
            </Badge>
          </div>
        </div>
        {/* Mobile email badge */}
        <div className="md:hidden mt-4">
          <Badge variant="outline" className="text-blue-600 border-blue-600 bg-white">
            <User className="h-3 w-3 mr-1" />
            {user?.email}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando dados do perfil...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-6">
          {/* Dados Pessoais */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <User className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-900">Dados Pessoais</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInitialDataLoaded(false);
                        loadPersonalData();
                        toast({
                          title: "Atualização",
                          description: "Recarregando dados do perfil...",
                        });
                      }}
                      disabled={isLoading}
                      className="flex items-center space-x-1"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>Atualizar</span>
                    </Button>
                  )}
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </>
                  )}
                </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isEditing ? (
                // Modo de Edição
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeCompleto">Nome Completo <span className="text-red-500">*</span></Label>
                      <Input
                        id="nomeCompleto"
                        value={personalData.nomeCompleto}
                        onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                        placeholder="Digite seu nome completo"
                        className={`h-11 ${!personalData.nomeCompleto.trim() && personalData.nomeCompleto !== '' ? 'border-red-500' : ''}`}
                      />
                      {!personalData.nomeCompleto.trim() && personalData.nomeCompleto !== '' && (
                        <p className="text-sm text-red-500">Nome completo é obrigatório</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
                      <Input
                        id="cpf"
                        value={personalData.cpf}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`h-11 ${!validateCPF(personalData.cpf) && personalData.cpf ? 'border-red-500' : ''}`}
                      />
                      {!validateCPF(personalData.cpf) && personalData.cpf && (
                        <p className="text-sm text-red-500">CPF deve ter exatamente 11 dígitos</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">WhatsApp</Label>
                      <Input
                        id="telefone"
                        value={personalData.telefone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        className={`h-11 ${!validateEmail(personalData.email) && personalData.email ? 'border-red-500' : ''}`}
                      />
                      {!validateEmail(personalData.email) && personalData.email && (
                        <p className="text-sm text-red-500">Email deve ter um formato válido</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        value={personalData.profissao}
                        onChange={(e) => handleInputChange("profissao", e.target.value)}
                        placeholder="Sua profissão"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        value={personalData.dataNascimento}
                        onChange={handleDateChange}
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genero">Identidade de Gênero</Label>
                      <Select value={personalData.genero} onValueChange={(value) => handleInputChange("genero", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione sua identidade de gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="nao-binario">Não-binário</SelectItem>
                          <SelectItem value="genero-fluido">Gênero fluido</SelectItem>
                          <SelectItem value="agênero">Agênero</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rendaMensal">💰 Renda Mensal</Label>
                      <Input
                        id="rendaMensal"
                        value={personalData.rendaMensal}
                        onChange={handleMoneyChange}
                        placeholder="R$ 0,00"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">Digite apenas números, a formatação será aplicada automaticamente</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <div className="relative">
                        <Input
                          id="cep"
                          value={personalData.cep}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          maxLength={9}
                          disabled={cepLoading}
                          className={`h-11 ${cepLoading ? 'pr-10' : ''} ${cepError ? 'border-red-500' : ''}`}
                        />
                        {cepLoading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {cepChanged && cepError && (
                        <p className="text-sm text-red-500 mt-1">{cepError}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Digite o CEP para buscar o endereço automaticamente</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco" className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 inline" />
                        <span>Endereço</span>
                        {addressFound && (
                          <span className="ml-2 inline-flex items-center text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" /> 
                            Encontrado via CEP
                          </span>
                        )}
                      </Label>
                      <Input
                        id="endereco"
                        value={personalData.endereco}
                        onChange={(e) => handleInputChange("endereco", e.target.value)}
                        placeholder="Digite seu endereço"
                        className={`h-11 ${addressFound ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={personalData.bairro}
                        onChange={(e) => handleInputChange("bairro", e.target.value)}
                        placeholder="Digite seu bairro"
                        className={`h-11 ${addressFound && personalData.bairro ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={personalData.numero}
                        onChange={(e) => handleInputChange("numero", e.target.value)}
                        placeholder="Nº"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={personalData.cidade}
                        onChange={(e) => handleInputChange("cidade", e.target.value)}
                        placeholder="Sua cidade"
                        className={`h-11 ${addressFound && personalData.cidade ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={personalData.estado}
                        onChange={handleEstadoChange}
                        placeholder="SP"
                        maxLength={2}
                        className={`h-11 ${
                          !validateEstado(personalData.estado) && personalData.estado 
                            ? 'border-red-500' 
                            : addressFound && personalData.estado
                              ? 'border-green-500 focus-visible:ring-green-500'
                              : ''
                        }`}
                      />
                      {!validateEstado(personalData.estado) && personalData.estado && (
                        <p className="text-sm text-red-500">Estado deve ter 2 caracteres (ex: SP, RJ)</p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="objetivosFinanceiros">Objetivos Financeiros</Label>
                      <Input
                        id="objetivosFinanceiros"
                        value={personalData.objetivosFinanceiros}
                        onChange={(e) => handleInputChange("objetivosFinanceiros", e.target.value)}
                        placeholder="Descreva seus objetivos financeiros"
                        className="h-11"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="min-w-[120px]">
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </>
              ) : (
                // Modo de Visualização
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                    <p className="font-semibold text-gray-900">{personalData.nomeCompleto || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                    <p className="font-semibold text-gray-900">{personalData.cpf || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                    <p className="font-semibold text-gray-900">{formatPhoneForDisplay(personalData.telefone)}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                    <p className="font-semibold text-gray-900 break-all">{personalData.email || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Profissão</Label>
                    <p className="font-semibold text-gray-900">{personalData.profissao || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                    <p className="font-semibold text-gray-900">{formatDateForDisplay(personalData.dataNascimento)}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Identidade de Gênero</Label>
                    <p className="font-semibold text-gray-900">{formatGenderForDisplay(personalData.genero)}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label className="text-sm font-medium text-green-700">💰 Renda Mensal</Label>
                    <p className="font-bold text-lg text-green-800">{formatCurrency(personalData.rendaMensal)}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">CEP</Label>
                    <p className="font-semibold text-gray-900">{personalData.cep || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                    <p className="font-semibold text-gray-900">{personalData.endereco || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Bairro</Label>
                    <p className="font-semibold text-gray-900">{personalData.bairro || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Número</Label>
                    <p className="font-semibold text-gray-900">{personalData.numero || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Cidade</Label>
                    <p className="font-semibold text-gray-900">{personalData.cidade || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <p className="font-semibold text-gray-900">{personalData.estado || "Não informado"}</p>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg md:col-span-2 lg:col-span-3">
                    <Label className="text-sm font-medium text-muted-foreground">Objetivos Financeiros</Label>
                    <p className="font-semibold text-gray-900">{personalData.objetivosFinanceiros || "Não informado"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grid para as duas seções abaixo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mt-8">{/* added mt-8 for spacing */}
            {/* Status Premium */}
            <SubscriptionGuard>
              <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span>Status Premium</span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm font-medium">Tipo de Usuário</span>
                    {isPaidUser() ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Usuário Premium
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-400 bg-gray-50">
                        Usuário Gratuito
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className={isPaidUser() ? "text-green-600 border-green-600 bg-green-50" : "text-blue-600 border-blue-600 bg-blue-50"}>
                      ✓ {isPaidUser() ? "Premium Ativo" : "Ativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm text-muted-foreground">Próxima Cobrança</span>
                    <span className="text-sm font-medium">15/02/2024</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <span className="text-sm text-muted-foreground">Acesso Completo Válido Até</span>
                    <span className="text-sm font-medium">15/03/2024</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                    Ver Benefícios Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
            </SubscriptionGuard>

            {/* Resumo Financeiro */}
            <SubscriptionGuard>
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Resumo Financeiro</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Total Investido</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{stats.totalInvestments}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Renda Mensal</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats.monthlyIncome}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Metas Atingidas</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{stats.goalsAchieved}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-muted-foreground">Investimentos Ativos</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{stats.activeInvestments}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orçamento Mensal</span>
                    <span className="font-semibold">{stats.monthlyBudget}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Taxa de Poupança</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {stats.savingsPercentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Perfil de Risco</span>
                    <Badge className={getRiskProfileColor(stats.riskProfile)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {stats.riskProfile}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Refazer Teste de Perfil
                </Button>
              </CardContent>
            </Card>
            </SubscriptionGuard>
          </div>

          {/* Conquistas */}
          <SubscriptionGuard>
            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  <span>Conquistas</span>
                <Badge variant="outline" className="ml-auto">
                  {achievements.filter(a => a.isEarned).length}/{achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const IconComponent = getAchievementIcon(achievement.icon);
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        achievement.isEarned
                          ? "bg-white border-purple-200 shadow-md"
                          : "bg-gray-50 border-gray-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          achievement.isEarned 
                            ? "bg-purple-100" 
                            : "bg-gray-100"
                        }`}>
                          <IconComponent 
                            className={`h-5 w-5 ${
                              achievement.isEarned 
                                ? "text-purple-600" 
                                : "text-gray-400"
                            }`} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-medium text-sm ${
                              achievement.isEarned 
                                ? "text-gray-900" 
                                : "text-gray-500"
                            }`}>
                              {achievement.title}
                            </h4>
                            <Badge 
                              className={getAchievementCategoryColor(achievement.category)}
                            >
                              {getCategoryNameInPortuguese(achievement.category)}
                            </Badge>
                          </div>
                          <p className={`text-xs mt-1 ${
                            achievement.isEarned 
                              ? "text-gray-600" 
                              : "text-gray-400"
                          }`}>
                            {achievement.description}
                          </p>
                          {achievement.earnedDate && (
                            <p className="text-xs text-purple-600 mt-2">
                              Conquistada em {new Date(achievement.earnedDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Separator />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Continue usando a plataforma para desbloquear mais conquistas!
                </p>
              </div>
            </CardContent>
          </Card>
          </SubscriptionGuard>
        </div>
      )}
    </div>
  );
};

export default PerfilPage;
