// This is a backup of the modified file before reverting
// Original file content follows

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Building2,
  PieChart,
  BarChart3,
  ExternalLink,
  Loader2,
  LineChart,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import MarketPremiumGuard from "@/components/MarketPremiumGuard";
import { useTranslation } from "@/contexts/TranslationContext";
import investmentService from "@/services/investmentService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Registro dos componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement
);

interface TickerSearchResult {
  ticker: string;
  descricao: string;
  tipo_ativo: string;
}

// Interface completa da resposta da API FII
interface FIIAnalysisResponse {
  ticker: string;
  cnpj: string;
  razao_social: string;
  qt_de_cotas: number;
  ultima_data_cotas: string;
  aumento_cotas: {
    houve_aumento: boolean;
    quantidade_aumentos: number;
    total_cotas_emitidas: number;
    variacao_percentual_total: number;
    detalhes_aumentos: any[];
  };
  administrador: string;
  segmento: string;
  situacao: string;
  data_inicio_atividade: string;
  categoria: string;
  data_registro_cvm: string;
  numero_registro_cvm: string;
  patrimonio_liquido: number;
  valor_patrimonial_cota: number;
  valor_patrimonial_cota: number;
  valor_patrimonial_cotas?: number; // alias para compatibilidade // alias para compatibilidade
  cotistas_pf: number | null;
  cotistas_pj: number | null;
  cotistas_bancos: number | null;
  cotistas_estrangeiros: number | null;
  numero_total_cotistas: number;
  dividendo: number;
  ultimo_dividendo: number; // alias para compatibilidade
  taxa_administracao: number;
  outras_despesas: number;
  resultado_liquido: number;
  caixa: number;
  contas_receber: number;
  alugueis_receber: number;
  terrenos: number;
  edificacoes: number;
  obras_curso: number;
  outros_investimentos: number;
  total_investimentos: number;
  total_investido: number; // alias para compatibilidade
  quantidade_ativos_fundo: number;
  last_price: number;
  volume_ultimo_dia: number;
  preco_minimo_mes: number;
  preco_maximo_mes: number;
  volume_medio_mes: number;
  data_ultimo_preco: string;
  variacao_mes: number;
  p_vp: number;
  valor_patrimonial_cota_calculado: number;
  dividend_yield_anualizado: number;
  valor_mercado: number;
  desconto_premio_vp: number;
  data_analise: string;
  status: string;
  tipo_ativo: string;
  historico_mensal: Array<{
    mes: string;
    total_ativo: number;
    total_passivo: number;
    caixa: number;
    total_imoveis: number;
    contas_receber: number;
  }>;