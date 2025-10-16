import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ArrowRight, TrendingUp, Plus, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useMonthYear } from '../hooks/useMonthYear';
import { api } from '@/lib/api';

interface NewUserGuidanceProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function NewUserGuidance({ 
  title = "Comece cadastrando seus dados básicos",
  description = "Para começar a usar o Organizesee de forma completa, primeiro complete seu perfil com suas informações pessoais.",
  className = ""
}: NewUserGuidanceProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigateToProfile = () => {
    navigate('/dashboard/perfil');
  };

  const handleNavigateToAddExpense = () => {
    navigate('/dashboard/orcamento');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main guidance card */}
      <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-700">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
            {description}
          </p>
          
          <Button 
            onClick={handleNavigateToProfile}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Completar Meu Perfil
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Secondary guidance - Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-green-200 bg-green-50/50 hover:bg-green-50 dark:bg-green-950/20 dark:border-green-800 dark:hover:bg-green-950/30 transition-colors cursor-pointer"
              onClick={handleNavigateToAddExpense}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-green-900 dark:text-green-100 text-sm mb-1">
              Adicionar Primeira Despesa
            </h3>
            <p className="text-green-700 dark:text-green-300 text-xs">
              Comece registrando seus gastos
            </p>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/investimentos')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">
              Explorar Investimentos
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-xs">
              Conheça as opções disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs">
          💡 <strong>Dica:</strong> Após completar seu perfil, você terá acesso completo a todas as funcionalidades do sistema.
        </p>
      </div>
    </div>
  );
}

// Component específico para o orçamento quando não há dados
export function BudgetNoDataGuidance() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mes, ano } = useMonthYear();
  const [isReplicating, setIsReplicating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replicationInProgress, setReplicationInProgress] = useState(false);
  
  // Estados para as seleções do modal
  const [selectedMonth, setSelectedMonth] = useState('');
  const [replicationOptions, setReplicationOptions] = useState({
    entradas: false,
    gastos: false,
    dividas: false
  });
  
  // Efeito para verificar se houve uma replicação bem-sucedida recentemente
  useEffect(() => {
    try {
      const wasSuccessful = sessionStorage.getItem('replication_success');
      const replicationTime = sessionStorage.getItem('replication_time');
      
      if (wasSuccessful === 'true' && replicationTime) {
        // Calcular se a replicação foi recente (menos de 5 segundos)
        const replicationTimestamp = new Date(replicationTime).getTime();
        const now = new Date().getTime();
        const timeDiff = now - replicationTimestamp;
        
        if (timeDiff < 5000) {
          console.log('🎉 Página recarregada após replicação bem-sucedida!');
          // Limpar os dados de replicação do sessionStorage
          sessionStorage.removeItem('replication_success');
          sessionStorage.removeItem('replication_time');
        }
      }
    } catch (e) {
      console.error('Erro ao verificar status de replicação:', e);
    }
  }, []);

  // Recuperar dados históricos do localStorage
  const getHistData = () => {
    try {
      const histDataStr = localStorage.getItem('budget_hist_data');
      const mesesDisponiveisStr = localStorage.getItem('budget_meses_disponeis');
      
      if (histDataStr && mesesDisponiveisStr) {
        return {
          histData: JSON.parse(histDataStr),
          mesesDisponiveis: JSON.parse(mesesDisponiveisStr)
        };
      }
    } catch (error) {
      console.error('Erro ao recuperar dados históricos:', error);
    }
    return null;
  };

  const historicalData = getHistData();
  const canReplicate = historicalData && 
    historicalData.histData &&
    (historicalData.histData.replicar_entradas || 
     historicalData.histData.replicar_gastos || 
     historicalData.histData.replicar_dividas) &&
    historicalData.mesesDisponiveis &&
    historicalData.mesesDisponiveis.length > 0;

  const handleOpenModal = () => {
    if (!historicalData) return;
    
    // Definir mês padrão (último registro ou primeiro disponível)
    const defaultMonth = historicalData.histData.ultimo_registro_mes 
      ? historicalData.histData.ultimo_registro_mes.toString()
      : historicalData.mesesDisponiveis[historicalData.mesesDisponiveis.length - 1];
    
    setSelectedMonth(defaultMonth);
    
    // Inicializar opções
    // Se historicalData tem opções disponíveis, podemos pré-selecionar as que estão disponíveis
    // mas vamos garantir que sejam valores booleanos
    const availableOptions = {
      entradas: Boolean(historicalData.histData.replicar_entradas),
      gastos: Boolean(historicalData.histData.replicar_gastos),
      dividas: Boolean(historicalData.histData.replicar_dividas)
    };
    
    // Selecionar por padrão as opções que estão disponíveis
    setReplicationOptions({
      entradas: availableOptions.entradas,
      gastos: availableOptions.gastos,
      dividas: availableOptions.dividas
    });
    
    setIsModalOpen(true);
    console.log('Modal de replicação aberto. Opções inicializadas:', availableOptions);
  };

  const handleReplicateData = async () => {
    if (!historicalData || !selectedMonth) return;
    
    // Verificar se já existe uma replicação em andamento
    if (replicationInProgress) {
      console.log('⚠️ Replicação já está em andamento. Ignorando clique adicional.');
      return;
    }
    
    // Verificar se pelo menos uma opção está selecionada
    const hasSelection = Object.values(replicationOptions).some(Boolean);
    if (!hasSelection) {
      alert('Selecione pelo menos um tipo de dado para replicar.');
      return;
    }
    
    // Marcar que uma replicação está em progresso
    setReplicationInProgress(true);
    setIsReplicating(true);
    
    // Preparar o corpo da requisição
    const requestBody = {
      de: {
        mes: parseInt(selectedMonth),
        ano: parseInt(ano) 
      },
      para: {
        mes: parseInt(mes),
        ano: parseInt(ano)
      },
      tipos: {
        replicar_entradas: Boolean(replicationOptions.entradas),
        replicar_gastos: Boolean(replicationOptions.gastos),
        replicar_dividas: Boolean(replicationOptions.dividas)
      }
    };
    
    console.log('Solicitação de replicação:', requestBody);
    
    try {
      // Usar a api.post para manter todas as credenciais de autenticação
      const response = await api.post('/api/replicar_dados', requestBody);
      
      console.log('📡 Resposta recebida:', response);
      
      // Verificação de resposta de sucesso melhorada
      // A resposta pode estar diretamente no objeto response ou dentro de response.data
      const responseData = response.data || response;
      
      // Verificar se a resposta indica sucesso de alguma forma
      if (responseData && 
         (responseData.success === true || 
          responseData.status === 'success' || 
          responseData.message?.toLowerCase().includes('sucesso'))) {
        console.log('✅ Replicação bem-sucedida!', responseData);
        
        // Fechar o modal primeiro
        setIsModalOpen(false);
        
        // Mostrar mensagem de sucesso ao usuário
        alert(responseData.message || 'Dados replicados com sucesso!');
        
        // Recarregar a página após um breve atraso
        setTimeout(() => {
          console.log('🔄 Recarregando a página com os novos dados...');
          window.location.reload();
        }, 1500);
        return; // Encerrar a função após o sucesso
      } 
      
      // Se chegou aqui, não foi encontrado um indicador de sucesso na resposta
      console.error('❌ Resposta da API sem indicação de sucesso:', response);
      
      // Verificar se é um erro de dados já existentes
      if (responseData?.dados_existentes && responseData?.tipos_bloqueados) {
        const tiposBloqueados = responseData.tipos_bloqueados
          .map((tipo: string) => {
            switch(tipo) {
              case 'entradas': return 'Entradas';
              case 'gastos': return 'Gastos';
              case 'dividas': return 'Dívidas';
              default: return tipo;
            }
          })
          .join(', ');
        
        alert(`Não foi possível replicar: ${tiposBloqueados} já existem para ${getMesNome(parseInt(mes))}/${ano}.`);
      } else {
        alert(responseData?.error || responseData?.message || 'Erro ao replicar dados. Tente novamente.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao fazer requisição:', error);
      
      // Verificar se, apesar do erro, temos uma resposta com indicação de sucesso
      const errorData = error.response?.data || error.details || {};
      
      if (errorData.success === true || 
          errorData.status === 'success' || 
          errorData.message?.toLowerCase().includes('sucesso')) {
        console.log('⚠️ Erro com resposta de sucesso:', errorData);
        
        setIsModalOpen(false);
        alert(errorData.message || 'Dados replicados com sucesso!');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }
      
      // Tentar obter mensagem de erro mais detalhada
      const errorMessage = 
        errorData.detail ||
        errorData.error ||
        errorData.message ||
        error.message ||
        'Erro ao replicar dados. Tente novamente.';
      
      alert(errorMessage);
    } finally {
      setIsReplicating(false);
      setTimeout(() => {
        setReplicationInProgress(false);
      }, 2000);
    }
  };

  const getMesNome = (numeroMes: number | string) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const index = typeof numeroMes === 'string' ? parseInt(numeroMes) : numeroMes;
    return meses[index - 1] || '';
  };

  const handleOptionChange = (option: keyof typeof replicationOptions, checked: boolean | "indeterminate") => {
    // Converter para boolean explicitamente, tratando "indeterminate" como false
    const boolValue = checked === true;
    
    setReplicationOptions(prev => ({
      ...prev,
      [option]: boolValue // Garantir que o valor seja boolean
    }));
    
    // Logs para debug
    console.log(`Opção ${option} alterada para:`, boolValue, typeof boolValue);
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Main guidance card */}
      <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-700">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
            Configure seu Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
            Para visualizar seus dados financeiros, você pode replicar seu orçamento anterior ou configurar novas informações. 
            Comece adicionando suas entradas, custos, dívidas e metas financeiras.
          </p>
          
          {/* Botão de repetir orçamento - só aparece se pode replicar */}
          {canReplicate && (
            <div className="flex justify-center pt-2">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={handleOpenModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Repetir Orçamento Anterior
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Replicar Dados do Orçamento
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Seleção do mês de origem */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Copiar dados do mês:
                      </label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {historicalData?.mesesDisponiveis.map((mes) => (
                            <SelectItem key={mes} value={mes}>
                              {getMesNome(parseInt(mes))} {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Informação do destino */}
                    <div className="text-sm text-muted-foreground text-center">
                      → Para: {getMesNome(parseInt(mes))} {ano}
                    </div>

                    {/* Opções de replicação */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Selecione o que replicar:
                      </label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="entradas"
                            checked={Boolean(replicationOptions.entradas)}
                            onCheckedChange={(checked) => handleOptionChange('entradas', checked)}
                            disabled={!historicalData?.histData.replicar_entradas}
                          />
                          <label htmlFor="entradas" className="text-sm">
                            Entradas (receitas)
                            {!historicalData?.histData.replicar_entradas && (
                              <span className="text-muted-foreground ml-2">(não disponível)</span>
                            )}
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="gastos"
                            checked={Boolean(replicationOptions.gastos)}
                            onCheckedChange={(checked) => handleOptionChange('gastos', checked)}
                            disabled={!historicalData?.histData.replicar_gastos}
                          />
                          <label htmlFor="gastos" className="text-sm">
                            Gastos (despesas)
                            {!historicalData?.histData.replicar_gastos && (
                              <span className="text-muted-foreground ml-2">(não disponível)</span>
                            )}
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="dividas"
                            checked={Boolean(replicationOptions.dividas)}
                            onCheckedChange={(checked) => handleOptionChange('dividas', checked)}
                            disabled={!historicalData?.histData.replicar_dividas}
                          />
                          <label htmlFor="dividas" className="text-sm">
                            Dívidas
                            {!historicalData?.histData.replicar_dividas && (
                              <span className="text-muted-foreground ml-2">(não disponível)</span>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleReplicateData}
                        disabled={isReplicating || !selectedMonth || replicationInProgress}
                        className={`${isReplicating ? 'bg-indigo-600' : 'bg-purple-600 hover:bg-purple-700'} text-white flex-1 relative`}
                      >
                        {isReplicating ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            <span>Replicando...</span>
                            <span className="absolute top-0 right-0 h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            <span>Replicar Dados</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setIsModalOpen(false)}
                        variant="outline"
                        disabled={isReplicating}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget-specific actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-green-200 bg-green-50/50 hover:bg-green-50 dark:bg-green-950/20 dark:border-green-800 dark:hover:bg-green-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/orcamento/entradas')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-green-900 dark:text-green-100 text-sm mb-1">
              Adicionar suas Entradas
            </h3>
            <p className="text-green-700 dark:text-green-300 text-xs">
              Registre suas receitas mensais
            </p>
          </CardContent>
        </Card>

        <Card className="border border-red-200 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/20 dark:border-red-800 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/orcamento/custos')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <ArrowRight className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-medium text-red-900 dark:text-red-100 text-sm mb-1">
              Adicionar seus Custos
            </h3>
            <p className="text-red-700 dark:text-red-300 text-xs">
              Configure suas despesas
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/orcamento/dividas')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Plus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-medium text-orange-900 dark:text-orange-100 text-sm mb-1">
              Adicionar suas Dívidas
            </h3>
            <p className="text-orange-700 dark:text-orange-300 text-xs">
              Gerencie seus compromissos
            </p>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/orcamento/metas')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">
              Adicionar suas Metas
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-xs">
              Defina seus objetivos financeiros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs">
          💡 <strong>Dica:</strong> Após configurar seus dados de orçamento, você terá acesso completo às análises e relatórios financeiros.
        </p>
      </div>
    </div>
  );
}

// Component específico para investimentos quando não há dados
export function InvestmentsNoDataGuidance() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Main guidance card */}
      <Card className="border-dashed border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-700">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
            Configure seus Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
            Para visualizar seu dashboard de investimentos, você precisa cadastrar seus ativos. 
            Adicione suas ações, fundos imobiliários, renda fixa e outros investimentos.
          </p>
        </CardContent>
      </Card>

      {/* Investment-specific actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-green-200 bg-green-50/50 hover:bg-green-50 dark:bg-green-950/20 dark:border-green-800 dark:hover:bg-green-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/investimentos/cadastro')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-green-900 dark:text-green-100 text-sm mb-1">
              Cadastrar Investimentos
            </h3>
            <p className="text-green-700 dark:text-green-300 text-xs">
              Registre seus ativos financeiros
            </p>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/investimentos/patrimonio')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">
              Visualizar Patrimônio
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-xs">
              Acompanhe sua evolução financeira
            </p>
          </CardContent>
        </Card>

        <Card className="border border-orange-200 bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 dark:hover:bg-orange-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/investimentos/comparativos')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-medium text-orange-900 dark:text-orange-100 text-sm mb-1">
              Comparativos
            </h3>
            <p className="text-orange-700 dark:text-orange-300 text-xs">
              Compare o desempenho dos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
              onClick={() => navigate('/dashboard/investimentos/ranking')}>
          <CardContent className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
              Ranking
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-xs">
              Veja seus melhores investimentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help text */}
      <div className="text-center">
        <p className="text-muted-foreground text-xs">
          💡 <strong>Dica:</strong> Após cadastrar seus investimentos, você terá acesso a gráficos de alocação, análises setoriais e acompanhamento de dividendos.
        </p>
      </div>
    </div>
  );
}
