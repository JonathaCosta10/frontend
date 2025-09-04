import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Copy, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface HistData {
  replicar_entradas: boolean;
  replicar_gastos: boolean;
  replicar_dividas: boolean;
  ultimo_registro_mes: number;
  ultimo_registro_ano: number;
}

interface ReplicateDataProps {
  histData: HistData;
  onReplicationComplete?: () => void;
  onCancel?: () => void;
}

// Função para converter número do mês para nome
const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1] || 'Mês inválido';
};

// Função para verificar se os dados são de um período diferente do atual
const isDataFromDifferentPeriod = (dataMonth: number, dataYear: number): boolean => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  return dataMonth !== currentMonth || dataYear !== currentYear;
};

export default function ReplicateDataComponent({ histData, onReplicationComplete, onCancel }: ReplicateDataProps) {
  const [isReplicating, setIsReplicating] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    entradas: histData.replicar_entradas,
    gastos: histData.replicar_gastos,
    dividas: histData.replicar_dividas
  });
  const { toast } = useToast();

  // Verificar se há pelo menos uma opção selecionada
  const hasSelectedOptions = Object.values(selectedOptions).some(Boolean);

  // Informações do período de origem
  const sourceMonth = getMonthName(histData.ultimo_registro_mes);
  const sourceYear = histData.ultimo_registro_ano;

  const handleReplication = async () => {
    if (!hasSelectedOptions) {
      toast({
        title: "Nenhuma opção selecionada",
        description: "Selecione pelo menos um tipo de dado para replicar.",
        variant: "destructive"
      });
      return;
    }

    setIsReplicating(true);

    // Obter a data atual para usar como destino
    const now = new Date();
    const targetMonth = now.getMonth() + 1; // 1-12
    const targetYear = now.getFullYear();

    try {
      console.log('🔄 Iniciando replicação de dados:', {
        entradas: selectedOptions.entradas,
        gastos: selectedOptions.gastos,
        dividas: selectedOptions.dividas,
        mes_origem: histData.ultimo_registro_mes,
        ano_origem: histData.ultimo_registro_ano,
        mes_destino: targetMonth,
        ano_destino: targetYear
      });

      // Usar a URL selecionada no componente principal para replicar dados
      const response = await api.post('/api/orcamento/replica', {
        replicar_entradas: selectedOptions.entradas,
        replicar_gastos: selectedOptions.gastos,
        replicar_dividas: selectedOptions.dividas,
        mes_origem: histData.ultimo_registro_mes,
        ano_origem: histData.ultimo_registro_ano,
        mes_destino: targetMonth,
        ano_destino: targetYear
      });

      console.log('✅ Replicação concluída:', response);

      toast({
        title: "Dados replicados com sucesso! 🎉",
        description: `Os dados de ${sourceMonth}/${sourceYear} foram copiados para o mês atual.`,
      });

      // Chamar callback se fornecido
      if (onReplicationComplete) {
        onReplicationComplete();
      }

    } catch (error) {
      console.error('❌ Erro na replicação:', error);
      
      toast({
        title: "Erro na replicação",
        description: "Não foi possível replicar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsReplicating(false);
    }
  };

  const handleOptionChange = (option: keyof typeof selectedOptions, checked: boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900">
        <CardHeader className="pb-3 relative">
          {/* Botão de fechar */}
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={onCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2 mb-2">
            <Copy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base font-semibold text-blue-900 dark:text-blue-100">
              Replicar Dados
            </CardTitle>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>De {sourceMonth}/{sourceYear}</span>
          </div>
        </CardHeader>
      
      <CardContent className="space-y-4">
        
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Selecione o que deseja replicar:
          </h3>
          
          {/* Entradas */}
          <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded border">
            <Checkbox 
              id="entradas"
              checked={selectedOptions.entradas}
              onCheckedChange={(checked) => handleOptionChange('entradas', checked as boolean)}
              disabled={!histData.replicar_entradas}
            />
            <div className="flex items-center space-x-1 flex-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs">Entradas</span>
            </div>
            <Badge variant={histData.replicar_entradas ? "default" : "secondary"} className="text-xs">
              {histData.replicar_entradas ? "✓" : "✗"}
            </Badge>
          </div>

          {/* Gastos */}
          <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded border">
            <Checkbox 
              id="gastos"
              checked={selectedOptions.gastos}
              onCheckedChange={(checked) => handleOptionChange('gastos', checked as boolean)}
              disabled={!histData.replicar_gastos}
            />
            <div className="flex items-center space-x-1 flex-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs">Gastos</span>
            </div>
            <Badge variant={histData.replicar_gastos ? "default" : "secondary"} className="text-xs">
              {histData.replicar_gastos ? "✓" : "✗"}
            </Badge>
          </div>

          {/* Dívidas */}
          <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded border">
            <Checkbox 
              id="dividas"
              checked={selectedOptions.dividas}
              onCheckedChange={(checked) => handleOptionChange('dividas', checked as boolean)}
              disabled={!histData.replicar_dividas}
            />
            <div className="flex items-center space-x-1 flex-1">
              <CreditCard className="h-3 w-3 text-orange-600" />
              <span className="text-xs">Dívidas</span>
            </div>
            <Badge variant={histData.replicar_dividas ? "default" : "secondary"} className="text-xs">
              {histData.replicar_dividas ? "✓" : "✗"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Button 
            onClick={handleReplication}
            disabled={!hasSelectedOptions || isReplicating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
            size="sm"
          >
            {isReplicating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Replicando...
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Replicar
              </>
            )}
          </Button>

          {!hasSelectedOptions && (
            <div className="flex items-center justify-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              <span>Selecione uma opção</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
