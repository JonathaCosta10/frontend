import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, PiggyBank, Target } from 'lucide-react';

const BudgetNoDataGuidance: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <PiggyBank className="h-6 w-6 text-blue-600" />
          Comece seu Orçamento Pessoal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-gray-600">
          <p className="mb-4">
            Organize suas finanças e tome o controle dos seus gastos! 
            Comece criando suas primeiras categorias de orçamento.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Receitas
            </h3>
            <p className="text-sm text-gray-600">
              Adicione suas fontes de renda mensais como salário, freelances, investimentos.
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Gastos
            </h3>
            <p className="text-sm text-gray-600">
              Organize seus gastos por categorias como moradia, alimentação, transporte.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            className="flex items-center gap-2"
            onClick={() => console.log('Adicionar receita')}
          >
            <Plus className="h-4 w-4" />
            Adicionar Receita
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => console.log('Adicionar gasto')}
          >
            <Plus className="h-4 w-4" />
            Adicionar Gasto
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Dica</h4>
          <p className="text-sm text-blue-700">
            Comece simples! Adicione suas principais receitas e gastos mensais. 
            Você pode sempre refinar e adicionar mais detalhes depois.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetNoDataGuidance;