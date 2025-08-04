import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../contexts/TranslationContext";
import { 
  User, 
  Settings, 
  CreditCard, 
  Crown, 
  TrendingUp, 
  Target, 
  BarChart3,
  Shield,
  DollarSign
} from "lucide-react";

interface PersonalData {
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  profissao: string;
}

interface FinancialStats {
  totalInvestments: string;
  monthlyBudget: string;
  goalsAchieved: number;
  riskProfile: string;
}

const PerfilPage: React.FC = () => {
  const { toast } = useToast();
  const { user, isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalData>({
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    email: "",
    profissao: ""
  });

  // Mock financial stats for demo
  const [stats] = useState<FinancialStats>({
    totalInvestments: "R$ 15.750,00",
    monthlyBudget: "R$ 3.200,00",
    goalsAchieved: 3,
    riskProfile: "Moderado"
  });

  const loadPersonalData = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Iniciando carregamento de dados pessoais...');
      
      if (!user?.token) {
        console.log('❌ Token não encontrado');
        return;
      }

      const response = await fetch('/api/dadospessoais/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos da API:', data);

      if (data && typeof data === 'object') {
        setPersonalData({
          nomeCompleto: data.nomeCompleto || "",
          cpf: data.cpf || "",
          telefone: data.telefone || "",
          email: data.email || "",
          profissao: data.profissao || ""
        });
        console.log('✅ Estado atualizado');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados pessoais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados pessoais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.token) {
      loadPersonalData();
    }
  }, [isLoggedIn, user?.token]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.token) {
        throw new Error("Token não encontrado");
      }

      const response = await fetch('/api/dadospessoais/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Sucesso",
        description: "Dados pessoais salvos com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados pessoais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setPersonalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile.toLowerCase()) {
      case 'conservador':
        return 'bg-green-100 text-green-800';
      case 'moderado':
        return 'bg-yellow-100 text-yellow-800';
      case 'arrojado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoggedIn) {
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Dados Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeCompleto">Nome Completo</Label>
                      <Input
                        id="nomeCompleto"
                        value={personalData.nomeCompleto}
                        onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                        placeholder="Digite seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={personalData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={personalData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        value={personalData.profissao}
                        onChange={(e) => handleInputChange('profissao', e.target.value)}
                        placeholder="Sua profissão"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Grid para as duas seções abaixo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Premium */}
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <span>Status Premium</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tipo de Usuário</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Usuário Premium
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Ativo
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Próxima Cobrança</span>
                        <span className="text-sm font-medium">15/02/2024</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Acesso Completo Válido Até</span>
                        <span className="text-sm font-medium">15/03/2024</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline" size="sm" className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gerenciar Assinatura
                    </Button>
                  </CardContent>
                </Card>

                {/* Resumo Financeiro */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <span>Resumo Financeiro</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">Total Investido</span>
                        </div>
                        <span className="font-semibold">{stats.totalInvestments}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Orçamento Mensal</span>
                        </div>
                        <span className="font-semibold">{stats.monthlyBudget}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-muted-foreground">Metas Atingidas</span>
                        </div>
                        <span className="font-semibold">{stats.goalsAchieved}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-muted-foreground">Perfil de Risco</span>
                        </div>
                        <Badge className={getRiskProfileColor(stats.riskProfile)}>
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
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PerfilPage;
