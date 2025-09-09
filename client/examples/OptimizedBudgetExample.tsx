/**
 * Exemplo de como usar o sistema otimizado de cache em uma página de orçamento
 * 
 * ANTES (múltiplas chamadas de API):
 * - useEffect para carregar dados quando mês muda
 * - useEffect para carregar dados quando ano muda  
 * - useEffect para carregar dados quando componente monta
 * - Chamadas duplicadas quando usuário navega rapidamente
 * 
 * DEPOIS (sistema otimizado com cache):
 * - Uma única fonte de verdade para dados
 * - Cache inteligente com tempo de expiração
 * - Navegação instantânea entre meses do mesmo ano
 * - Refresh otimizado apenas quando necessário
 */

import React from 'react';
import { useBudgetData } from '../hooks/useBudgetData';
import { useTutorialManager } from '../hooks/useTutorialManager';
import BudgetLayout from '../components/BudgetLayout';

// Exemplo de página de orçamento otimizada
export default function OptimizedBudgetPage() {
  // Hook otimizado que gerencia estado e cache automaticamente
  const {
    mes,
    ano,
    data,
    currentMonthData,
    isLoading,
    hasDataForSelectedMonth,
    isCurrentMonthYear,
    mesesDisponiveis,
    histData,
    handleMesChange,
    handleAnoChange,
    refreshData
  } = useBudgetData();

  // Hook para gerenciar tutoriais (agora também usa cache)
  const { shouldShowReplicateButton } = useTutorialManager();

  // Exemplo de como lidar com replicação de dados
  const handleReplicationComplete = async () => {
    console.log('🔄 Replicação concluída, atualizando dados...');
    await refreshData(); // Força refresh do cache
    console.log('✅ Dados atualizados após replicação');
  };

  return (
    <BudgetLayout
      mes={mes}
      ano={ano}
      onMesChange={handleMesChange}
      onAnoChange={handleAnoChange}
    >
      <div className="space-y-6">
        {/* Indicadores de estado */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Estado do Cache:</h3>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <span className="font-medium">Carregando:</span> 
              <span className={isLoading ? "text-orange-600" : "text-green-600"}>
                {isLoading ? " Sim" : " Não"}
              </span>
            </div>
            <div>
              <span className="font-medium">Tem dados:</span>
              <span className={hasDataForSelectedMonth ? "text-green-600" : "text-gray-600"}>
                {hasDataForSelectedMonth ? " Sim" : " Não"}
              </span>
            </div>
            <div>
              <span className="font-medium">Mês atual:</span>
              <span className={isCurrentMonthYear ? "text-blue-600" : "text-gray-600"}>
                {isCurrentMonthYear ? " Sim" : " Não"}
              </span>
            </div>
            <div>
              <span className="font-medium">Pode replicar:</span>
              <span className={shouldShowReplicateButton(mes, ano) ? "text-green-600" : "text-gray-600"}>
                {shouldShowReplicateButton(mes, ano) ? " Sim" : " Não"}
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : hasDataForSelectedMonth ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Dados de {mes}/{ano}
            </h2>
            {/* Renderizar dados do mês */}
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(currentMonthData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Nenhum dado encontrado para {mes}/{ano}
            </p>
            {shouldShowReplicateButton(mes, ano) && (
              <button
                onClick={handleReplicationComplete}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Replicar dados do último mês
              </button>
            )}
          </div>
        )}

        {/* Debug: mostrar todos os meses disponíveis */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900">Meses Disponíveis:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {mesesDisponiveis.map(m => (
              <span
                key={m}
                className={`px-2 py-1 rounded text-sm ${
                  m === mes 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-300'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </BudgetLayout>
  );
}

/**
 * BENEFÍCIOS DA IMPLEMENTAÇÃO:
 * 
 * 1. ⚡ PERFORMANCE
 *    - Cache inteligente evita chamadas desnecessárias
 *    - Navegação entre meses do mesmo ano é instantânea
 *    - Dados são compartilhados entre componentes
 * 
 * 2. 🔄 ATUALIZAÇÕES INTELIGENTES
 *    - Cache invalidado automaticamente após operações
 *    - Refresh forçado apenas quando necessário
 *    - Estados de loading centralizados
 * 
 * 3. 🧠 EXPERIÊNCIA DO USUÁRIO
 *    - Sem recarregamentos desnecessários da página
 *    - Loading states apropriados
 *    - Navegação fluida entre datas
 * 
 * 4. 🛠️ MANUTENIBILIDADE
 *    - Lógica de cache centralizada
 *    - Estado compartilhado entre componentes
 *    - Fácil debug e monitoramento
 * 
 * 5. 📱 RESPONSIVIDADE
 *    - Menos requisições = menos tempo de resposta
 *    - Melhor performance em dispositivos móveis
 *    - Economiza dados móveis dos usuários
 */
