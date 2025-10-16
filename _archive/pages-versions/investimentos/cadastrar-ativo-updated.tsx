import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, HelpCircle, Calendar, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { InvestmentApi } from "@/services/api/investment";
import { useToast } from "@/hooks/use-toast";
import { assetClassMap, assetTypeMap } from "@/utils/mappings";
import useFormRepeat from "@/hooks/useFormRepeat";
import { FORM_STORAGE_KEYS } from "@/utils/formRepeat";

interface FormData {
  ticker: string;
  nome: string;
  tipo: string;
  classe: string;
  setor: string;
  risco: string;
  data_compra: string;
  preco_compra: string;
  quantidade: string;
}

export default function CadastrarAtivo() {
  const { carteira_id } = useParams<{ carteira_id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Hook para gerenciar repetição de formulários
  const { saveValues, applyLastValues } = useFormRepeat<FormData>(FORM_STORAGE_KEYS.ATIVOS);
  
  const [tab, setTab] = useState("info");
  const [carteiraInfo, setCarteiraInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    ticker: "",
    nome: "",
    tipo: "",
    classe: "",
    setor: "",
    risco: "",
    data_compra: "",
    preco_compra: "",
    quantidade: "",
  });

  useEffect(() => {
    if (!isAuthenticated || !carteira_id) {
      return;
    }

    // Carrega informações da carteira
    const carregarCarteira = async () => {
      try {
        const response = await InvestmentApi.getCarteiraById(
          parseInt(carteira_id)
        );
        setCarteiraInfo(response.data);
      } catch (error) {
        console.error("Erro ao carregar carteira:", error);
        toast({
          title: t("error_loading_portfolio"),
          description: t("please_try_again"),
          variant: "destructive",
        });
      }
    };

    carregarCarteira();
  }, [isAuthenticated, carteira_id, t, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Definir a data de hoje
  const setToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    setFormData((prev) => ({ ...prev, data_compra: formattedDate }));
  };

  // Aplicar último formulário
  const aplicarUltimoFormulario = () => {
    const lastForm = applyLastValues();
    if (lastForm) {
      setFormData(lastForm);
    } else {
      toast({
        title: t("no_previous_form_data"),
        description: t("no_previous_form_data_description"),
        variant: "default",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: t("authentication_required"),
        variant: "destructive",
      });
      return;
    }

    // Validações básicas
    if (tab === "info" && (!formData.ticker || !formData.nome || !formData.tipo || !formData.classe)) {
      toast({
        title: t("fill_required_fields"),
        description: t("asset_info_required"),
        variant: "destructive",
      });
      return;
    }

    if (tab === "transaction" && (!formData.data_compra || !formData.preco_compra || !formData.quantidade)) {
      toast({
        title: t("fill_required_fields"),
        description: t("transaction_info_required"),
        variant: "destructive",
      });
      return;
    }

    // Se estiver na primeira aba, muda para a segunda
    if (tab === "info") {
      setTab("transaction");
      return;
    }

    try {
      setLoading(true);
      
      // Salvar dados do formulário para repetição futura
      saveValues(formData);
      
      const data = {
        ticker: formData.ticker,
        nome: formData.nome,
        tipo: formData.tipo,
        classe: formData.classe,
        setor: formData.setor || null,
        risco: formData.risco || null,
        transacao_inicial: {
          data: formData.data_compra,
          preco: parseFloat(formData.preco_compra),
          quantidade: parseFloat(formData.quantidade),
          tipo: "compra"
        }
      };

      await InvestmentApi.criarAtivo(parseInt(carteira_id!), data);

      toast({
        title: t("asset_registered_successfully"),
        variant: "default",
      });

      // Redireciona para a página da carteira
      navigate(`/sistema/dashboard/investimentos/carteira/${carteira_id}`);
    } catch (error) {
      console.error("Erro ao cadastrar ativo:", error);
      toast({
        title: t("asset_registration_error"),
        description: t("please_check_data_and_try_again"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {t("register_asset")} 
            {carteiraInfo && (
              <span className="text-muted-foreground ml-2">
                {t("in")} {carteiraInfo.nome}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Formulário em Abas */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new_asset")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">{t("asset_information")}</TabsTrigger>
              <TabsTrigger value="transaction">{t("purchase_details")}</TabsTrigger>
            </TabsList>

            {/* Aba 1: Informações do Ativo */}
            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">
                    {t("ticker")} / {t("code")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ticker"
                    name="ticker"
                    placeholder="PETR4, ITUB3, XPLG11..."
                    value={formData.ticker}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">
                    {t("name")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    placeholder={t("asset_name")}
                    value={formData.nome}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="tipo">
                      {t("asset_type")} <span className="text-destructive">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("asset_type_tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleSelectChange("tipo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_asset_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(assetTypeMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="classe">
                      {t("asset_class")} <span className="text-destructive">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("asset_class_tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select
                    value={formData.classe}
                    onValueChange={(value) => handleSelectChange("classe", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_asset_class")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(assetClassMap).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setor">{t("sector")}</Label>
                  <Input
                    id="setor"
                    name="setor"
                    placeholder={t("asset_sector_optional")}
                    value={formData.setor}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risco">{t("risk")}</Label>
                  <Select
                    value={formData.risco}
                    onValueChange={(value) => handleSelectChange("risco", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_risk_level")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">{t("low")}</SelectItem>
                      <SelectItem value="medio">{t("medium")}</SelectItem>
                      <SelectItem value="alto">{t("high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={aplicarUltimoFormulario}
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {t("repeat")}
                </Button>
                <Button onClick={handleSubmit}>
                  {t("continue")}
                </Button>
              </div>
            </TabsContent>

            {/* Aba 2: Detalhes da Transação */}
            <TabsContent value="transaction" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_compra">
                    {t("purchase_date")} <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="data_compra"
                      name="data_compra"
                      type="date"
                      value={formData.data_compra}
                      onChange={handleChange}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={setToday}
                      className="whitespace-nowrap"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {t("today")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="preco_compra">
                      {t("purchase_price")} (R$) <span className="text-destructive">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("purchase_price_tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="preco_compra"
                    name="preco_compra"
                    type="number"
                    step="0.01"
                    placeholder="25.40"
                    value={formData.preco_compra}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">
                  {t("quantity")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  step="0.01"
                  placeholder="100"
                  value={formData.quantidade}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setTab("info")}>
                  {t("back")}
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={aplicarUltimoFormulario}
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {t("repeat")}
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                  >
                    {loading ? t("registering") : t("register_asset")}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
