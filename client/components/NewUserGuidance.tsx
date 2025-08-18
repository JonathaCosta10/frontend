import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ArrowRight, TrendingUp, Plus, BarChart3, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';

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
            Para visualizar seus dados financeiros, você precisa configurar as informações do seu orçamento. 
            Comece adicionando suas entradas, custos, dívidas e metas financeiras.
          </p>
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
