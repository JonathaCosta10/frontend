import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { HistoricoMensalItem } from '@/types/fii-analysis';
import { formatBrazilianDate, formatLeverage, formatDividendYield, formatLargeNumber } from '@/utils/fii-formatters';
import { formatCurrency } from '@/utils/formatters';

interface HistoricalDataTableProps {
  historico: HistoricoMensalItem[];
}

const HistoricalDataTable: React.FC<HistoricalDataTableProps> = ({ historico }) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | '6m' | '12m'>('all');
  
  // Filter data based on selected period
  const filteredData = React.useMemo(() => {
    if (filterPeriod === 'all') return historico;
    
    const monthsToShow = filterPeriod === '6m' ? 6 : 12;
    return historico.slice(0, monthsToShow);
  }, [historico, filterPeriod]);

  const formatPercentageValue = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getAlavancagemColor = (alavancagem: number): "destructive" | "secondary" | "outline" | "default" => {
    if (alavancagem > 0.4) return 'destructive';
    if (alavancagem > 0.25) return 'secondary';
    return 'outline';
  };

  const getDividendoColor = (dividendo: number): "destructive" | "secondary" | "outline" | "default" => {
    if (dividendo >= 0.7) return 'default';
    if (dividendo >= 0.5) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Dados Históricos</CardTitle>
          <Select value={filterPeriod} onValueChange={(value: 'all' | '6m' | '12m') => setFilterPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dados</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Gap Liquidez</TableHead>
                <TableHead className="text-center">Alavancagem</TableHead>
                <TableHead className="text-center">% Imobiliário</TableHead>
                <TableHead className="text-right">Total Investido</TableHead>
                <TableHead className="text-right">Total Passivo</TableHead>
                <TableHead className="text-right">Valores a Receber</TableHead>
                <TableHead className="text-center">Dividendo</TableHead>
                <TableHead className="text-center">% Aluguel</TableHead>
                <TableHead className="text-center">% Imóveis Renda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item.data_referencia} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {formatBrazilianDate(item.data_referencia)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {formatPercentageValue(item.gap_liquidez)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant={getAlavancagemColor(item.alavancagem)}>
                      {formatPercentageValue(item.alavancagem)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {formatPercentageValue(item.percent_imobiliario)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {formatLargeNumber(item.total_investido)}
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {formatLargeNumber(item.total_passivo)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {formatLargeNumber(item.valores_receber)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant={getDividendoColor(item.dividendo_periodo)}>
                      R$ {item.dividendo_periodo.toFixed(2)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {formatPercentageValue(item.percent_aluguel)}
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {formatPercentageValue(item.imoveis_renda_percentual)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado histórico disponível para o período selecionado.
          </div>
        )}
        
        {filteredData.length < historico.length && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Mostrando {filteredData.length} de {historico.length} registros
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalDataTable;
