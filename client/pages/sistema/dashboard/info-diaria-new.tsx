import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../contexts/TranslationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import DailyInfoPremiumGuard from "../../../components/DailyInfoPremiumGuard";
import {
  Calendar,
  BarChart3,
  Star,
  Edit,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  ExternalLink,
  Briefcase,
  Youtube,
  Instagram,
} from "lucide-react";

// Interfaces para os novos dados
interface MarketIndex {
  symbol: string;
  name: string;
  currentValue: number;
  change7d: number;
  change1m: number;
  change3m: number;
}

interface WishlistAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MarketInsight {
  title: string;
  assets: {
    symbol: string;
    name: string;
    volume: number;
    price: number;
    change1d: number;
    change7d: number;
  }[];
}

interface Influencer {
  id: string;
  name: string;
  expertise: string;
  avatar: string;
  imageUrl: string;
  youtube?: string;
  instagram?: string;
  description: string;
  followers: string;
}

export default function InformacoesSemanais() {
  const { t, formatCurrency } = useTranslation();
  const { user } = useAuth();
  const today = new Date();
  const todayFormatted = today.toLocaleDateString();

  // States
  const [activeTab, setActiveTab] = useState("influencers");
  const [favoriteInfluencers, setFavoriteInfluencers] = useState<Set<string>>(new Set());
  const [currentInfluencerIndex, setCurrentInfluencerIndex] = useState(0);

  // Mock data - Novos dados para Informações Semanais
  const marketIndices: MarketIndex[] = [
    { symbol: "USD/BRL", name: "Dólar", currentValue: 5.13, change7d: 0.39, change1m: -2.1, change3m: 5.8 },
    { symbol: "IFIX", name: "IFIX", currentValue: 2756.32, change7d: 1.2, change1m: 3.4, change3m: -1.8 },
    { symbol: "SELIC", name: "SELIC", currentValue: 10.75, change7d: 0.0, change1m: 0.0, change3m: 0.25 },
    { symbol: "IBOV", name: "IBOVESPA", currentValue: 126845.67, change7d: 2.1, change1m: 4.8, change3m: 8.2 },
    { symbol: "IPCA", name: "IPCA", currentValue: 4.62, change7d: 0.0, change1m: 0.15, change3m: 0.42 },
    { symbol: "INPC", name: "INPC", currentValue: 4.77, change7d: 0.0, change1m: 0.18, change3m: 0.38 },
    { symbol: "IGPM", name: "IGP-M", currentValue: 2.95, change7d: 0.0, change1m: 0.25, change3m: 0.73 },
  ];

  const wishlistAssets: WishlistAsset[] = [
    { symbol: "PETR4", name: "Petrobras PN", currentPrice: 32.45, change: 0.85, changePercent: 2.69, volume: 45820000 },
    { symbol: "VALE3", name: "Vale ON", currentPrice: 68.90, change: -1.20, changePercent: -1.71, volume: 32150000 },
    { symbol: "ITUB4", name: "Itaú Unibanco PN", currentPrice: 28.76, change: 0.45, changePercent: 1.59, volume: 28900000 },
    { symbol: "BBDC4", name: "Bradesco PN", currentPrice: 15.83, change: 0.12, changePercent: 0.76, volume: 22100000 },
  ];

  const marketInsights: MarketInsight[] = [
    {
      title: "Maiores Volumes de Negociação",
      assets: [
        { symbol: "PETR4", name: "Petrobras PN", volume: 45820000, price: 32.45, change1d: 2.69, change7d: 5.2 },
        { symbol: "VALE3", name: "Vale ON", volume: 32150000, price: 68.90, change1d: -1.71, change7d: 3.8 },
        { symbol: "ITUB4", name: "Itaú Unibanco PN", volume: 28900000, price: 28.76, change1d: 1.59, change7d: 2.1 },
      ]
    },
    {
      title: "Variação de Portfólio",
      assets: [
        { symbol: "MGLU3", name: "Magazine Luiza ON", volume: 18500000, price: 12.45, change1d: 8.5, change7d: 15.2 },
        { symbol: "ABEV3", name: "Ambev SA ON", volume: 15200000, price: 14.89, change1d: -2.1, change7d: -0.8 },
        { symbol: "B3SA3", name: "B3 SA ON", volume: 12800000, price: 11.23, change1d: 1.8, change7d: 4.2 },
      ]
    },
    {
      title: "Oportunidades Preço Médio",
      assets: [
        { symbol: "WEGE3", name: "WEG SA ON", volume: 8900000, price: 45.67, change1d: 0.8, change7d: 6.5 },
        { symbol: "SUZB3", name: "Suzano SA ON", volume: 7200000, price: 52.18, change1d: 2.3, change7d: 8.1 },
        { symbol: "RENT3", name: "Localiza ON", volume: 6500000, price: 38.92, change1d: -0.5, change7d: 2.8 },
      ]
    }
  ];

  const influencers: Influencer[] = [
    {
      id: "1",
      name: "Carlos Investimentos",
      expertise: "Ações e FIIs",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_1 || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      imageUrl: import.meta.env.VITE_AVATAR_IMAGE_1 || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      youtube: "https://youtube.com/@carlosinvestimentos",
      instagram: "https://instagram.com/carlosinvestimentos",
      description: "Especialista em análise fundamentalista com foco em dividendos",
      followers: "250K"
    },
    {
      id: "2", 
      name: "Ana Finanças",
      expertise: "Educação Financeira",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_2 || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      imageUrl: import.meta.env.VITE_AVATAR_IMAGE_2 || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      youtube: "https://youtube.com/@anafinancas",
      instagram: "https://instagram.com/anafinancas",
      description: "Educadora financeira focada em planejamento e organização",
      followers: "180K"
    }
  ];

  const consultores = [
    {
      id: "1",
      name: "Roberto Silva CFP",
      expertise: "Planejamento Financeiro",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_3 || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      description: "Certified Financial Planner com 15 anos de experiência",
      certification: "CFP®",
      rating: 4.9
    },
    {
      id: "2",
      name: "Maria Santos CGA",
      expertise: "Investimentos",
      avatar: import.meta.env.VITE_AVATAR_IMAGE_4 || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      description: "Especialista em carteiras de investimento diversificadas",
      certification: "CGA",
      rating: 4.8
    }
  ];

  const isPremium = user?.plano === "premium";

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Informações Semanais</h1>
          <p className="text-muted-foreground">
            Acompanhe os principais indicadores e oportunidades do mercado - {todayFormatted}
          </p>
        </div>
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Primeira seção: Índices e Mercado + WishList */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Índices e Mercado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Índices e Mercado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketIndices.map((index) => (
                <div key={index.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{index.name}</div>
                    <div className="text-sm text-muted-foreground">{index.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(index.currentValue)}</div>
                    <div className="flex space-x-3 text-sm">
                      <span className={`flex items-center ${index.change7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {index.change7d >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        7D: {index.change7d}%
                      </span>
                      <span className={`${index.change1m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        1M: {index.change1m}%
                      </span>
                      <span className={`${index.change3m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        3M: {index.change3m}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* WishList */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Lista de Desejos</span>
              </CardTitle>
              {isPremium && (
                <Link to="/dashboard/mercado/lista-de-desejo">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isPremium ? (
              <div className="text-center p-6">
                <Star className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Recurso Premium</h3>
                <p className="text-muted-foreground mb-4">
                  Acesse sua lista de desejos personalizada e acompanhe seus ativos favoritos
                </p>
                <Button variant="default">
                  Se torne Premium
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlistAssets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                      <div className={`text-sm flex items-center ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.changePercent >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {asset.changePercent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights de Mercado */}
      <DailyInfoPremiumGuard feature="market_insights">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Insights de Mercado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-6">
              {marketInsights.map((insight, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold">{insight.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insight.assets.map((asset) => (
                      <div key={asset.symbol} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{asset.symbol}</div>
                            <div className="text-sm text-muted-foreground">{asset.name}</div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Volume:</span>
                            <span>{(asset.volume / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Preço:</span>
                            <span>{formatCurrency(asset.price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>1D:</span>
                            <span className={asset.change1d >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {asset.change1d}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>7D:</span>
                            <span className={asset.change7d >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {asset.change7d}%
                            </span>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </DailyInfoPremiumGuard>

      {/* Influencers e Consultores */}
      <DailyInfoPremiumGuard feature="specialists">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
            <span>Especialistas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="consultores">Consultores Financeiros</TabsTrigger>
            </TabsList>
            
            <TabsContent value="influencers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {influencers.map((influencer) => (
                  <div key={influencer.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <img
                        src={influencer.avatar}
                        alt={influencer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{influencer.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFavorites = new Set(favoriteInfluencers);
                              if (newFavorites.has(influencer.id)) {
                                newFavorites.delete(influencer.id);
                              } else {
                                newFavorites.add(influencer.id);
                              }
                              setFavoriteInfluencers(newFavorites);
                            }}
                          >
                            <Star className={`h-4 w-4 ${favoriteInfluencers.has(influencer.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                        </div>
                        <Badge variant="secondary" className="mb-2">{influencer.expertise}</Badge>
                        <p className="text-sm text-muted-foreground mb-3">{influencer.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{influencer.followers} seguidores</span>
                          <div className="flex space-x-2">
                            {influencer.youtube && (
                              <a href={influencer.youtube} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">
                                  <Youtube className="h-4 w-4 text-red-600" />
                                </Button>
                              </a>
                            )}
                            {influencer.instagram && (
                              <a href={influencer.instagram} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">
                                  <Instagram className="h-4 w-4 text-pink-600" />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="consultores" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultores.map((consultor) => (
                  <div key={consultor.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <img
                        src={consultor.avatar}
                        alt={consultor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{consultor.name}</h3>
                          <Badge variant="outline">{consultor.certification}</Badge>
                        </div>
                        <Badge variant="secondary" className="mb-2">{consultor.expertise}</Badge>
                        <p className="text-sm text-muted-foreground mb-3">{consultor.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{consultor.rating}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Contatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Faça parte da nossa equipe</h3>
                <p className="text-muted-foreground mb-4">
                  Conheça nossas condições e se torne um consultor parceiro
                </p>
                <Link to="/dashboard/info-diaria/join-team">
                  <Button variant="default">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Entre em contato para fazer parte da equipe
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </DailyInfoPremiumGuard>
    </div>
  );
}
