import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bitcoin,
  BookOpen,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Users,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

export default function InformacoesCripto() {
  const [selectedCategory, setSelectedCategory] = useState("guides");

  const educationalContent = {
    guides: [
      {
        title: "O que são Criptomoedas?",
        description: "Introdução ao mundo das moedas digitais e blockchain",
        difficulty: "Iniciante",
        readTime: "5 min",
        category: "Básico"
      },
      {
        title: "Como Comprar sua Primeira Criptomoeda",
        description: "Passo a passo para investir em Bitcoin e outras cryptos",
        difficulty: "Iniciante",
        readTime: "8 min",
        category: "Prático"
      },
      {
        title: "Análise Técnica para Criptomoedas",
        description: "Aprenda a ler gráficos e identificar tendências",
        difficulty: "Intermediário",
        readTime: "15 min",
        category: "Análise"
      },
      {
        title: "DeFi: Finanças Descentralizadas",
        description: "Entenda o futuro das finanças sem intermediários",
        difficulty: "Avançado",
        readTime: "20 min",
        category: "Avançado"
      }
    ],
    news: [
      {
        title: "Bitcoin atinge nova máxima histórica",
        description: "BTC rompe resistência de R$ 300k com volume recorde",
        date: "2024-03-15",
        source: "CryptoNews BR"
      },
      {
        title: "Ethereum 2.0: Redução de taxas em 90%",
        description: "Upgrade da rede promete revolucionar transações",
        date: "2024-03-14",
        source: "Blockchain Today"
      },
      {
        title: "Brasil aprova marco regulatório para crypto",
        description: "Nova legislação traz segurança jurídica ao setor",
        date: "2024-03-13",
        source: "Regulação Crypto"
      }
    ],
    tools: [
      {
        name: "Calculadora de DCA",
        description: "Calcule estratégias de investimento programado",
        type: "Calculadora"
      },
      {
        name: "Conversor de Moedas",
        description: "Converta entre diferentes criptomoedas e reais",
        type: "Conversor"
      },
      {
        name: "Portfolio Tracker",
        description: "Acompanhe performance da sua carteira crypto",
        type: "Rastreamento"
      },
      {
        name: "Fear & Greed Index",
        description: "Índice de sentimento do mercado cripto",
        type: "Indicador"
      }
    ]
  };

  const cryptoFacts = [
    {
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      title: "2009",
      description: "Ano de criação do Bitcoin por Satoshi Nakamoto"
    },
    {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      title: "21 Milhões",
      description: "Quantidade máxima de Bitcoins que existirão"
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "10 minutos",
      description: "Tempo médio para confirmação de transação Bitcoin"
    },
    {
      icon: <Globe className="h-5 w-5 text-purple-500" />,
      title: "13.000+",
      description: "Número de criptomoedas diferentes no mercado"
    }
  ];

  const riskWarnings = [
    "Criptomoedas são investimentos de alto risco",
    "Volatilidade extrema pode resultar em perdas significativas",
    "Não invista mais do que pode perder",
    "Mantenha suas chaves privadas sempre seguras",
    "Estude bem antes de investir em qualquer projeto"
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Iniciante": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediário": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Avançado": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-indigo-500" />
          <span>Informações Gerais - Crypto</span>
        </h2>
        <p className="text-muted-foreground">
          Centro educacional sobre criptomoedas, blockchain e investimentos digitais
        </p>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cryptoFacts.map((fact, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {fact.icon}
                <div>
                  <p className="font-semibold">{fact.title}</p>
                  <p className="text-xs text-muted-foreground">{fact.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="guides" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">Guias</TabsTrigger>
          <TabsTrigger value="news">Notícias</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          <TabsTrigger value="risks">Avisos</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guias Educacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educationalContent.guides.map((guide, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{guide.title}</h4>
                          <Badge className={getDifficultyColor(guide.difficulty)}>
                            {guide.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {guide.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>📖 {guide.readTime}</span>
                            <span>🏷️ {guide.category}</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ler
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Notícias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {educationalContent.news.map((news, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{news.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {news.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>📅 {news.date}</span>
                          <span>📰 {news.source}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ferramentas Úteis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educationalContent.tools.map((tool, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{tool.name}</h4>
                          <Badge variant="outline">{tool.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                        <Button size="sm" className="w-full">
                          <Zap className="h-3 w-3 mr-2" />
                          Usar Ferramenta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Avisos Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">
                    ⚠️ Riscos dos Investimentos em Criptomoedas
                  </h4>
                  <ul className="space-y-2">
                    {riskWarnings.map((warning, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    💡 Boas Práticas de Segurança
                  </h4>
                  <ul className="space-y-2">
                    {[
                      "Use autenticação de dois fatores (2FA)",
                      "Mantenha suas chaves privadas offline",
                      "Diversifique seus investimentos",
                      "Invista apenas valor que pode perder",
                      "Estude continuamente sobre o mercado"
                    ].map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-blue-700 dark:text-blue-300">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                    📚 Continue Aprendendo
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    O mercado de criptomoedas está em constante evolução. Mantenha-se atualizado:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Livros Recomendados
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Comunidades
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      Sites Confiáveis
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
