import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileText,
  Plus,
  Download,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  TrendingUp,
  Building,
  Save,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface Investimento {
  id: number;
  codigo: string;
  tipo: string;
  quantidade: number;
  precoMedio: number;
  valorTotal: number;
  dataCompra: string;
  corretora: string;
}

export default function Cadastro() {
  const { t, formatCurrency } = useTranslation();
  const [tipoOperacao, setTipoOperacao] = useState("manual");
  const [investimentos, setInvestimentos] = useState<Investimento[]>([
    {
      id: 1,
      codigo: "HGLG11",
      tipo: "FII",
      quantidade: 100,
      precoMedio: 125.5,
      valorTotal: 12550.0,
      dataCompra: "2024-01-15",
      corretora: "XP Investimentos",
    },
    {
      id: 2,
      codigo: "VALE3",
      tipo: t("stock"),
      quantidade: 50,
      precoMedio: 68.2,
      valorTotal: 3410.0,
      dataCompra: "2024-02-10",
      corretora: "Rico",
    },
  ]);

  const [formData, setFormData] = useState({
    codigo: "",
    tipo: "",
    quantidade: "",
    precoMedio: "",
    dataCompra: "",
    corretora: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const adicionarInvestimento = () => {
    if (editingId) {
      salvarEdicao();
      return;
    }

    if (!formData.codigo || !formData.quantidade || !formData.precoMedio) {
      alert(t("fill_required_fields"));
      return;
    }

    const novoInvestimento: Investimento = {
      id: Date.now(),
      codigo: formData.codigo.toUpperCase(),
      tipo: formData.tipo,
      quantidade: parseInt(formData.quantidade),
      precoMedio: parseFloat(formData.precoMedio),
      valorTotal:
        parseInt(formData.quantidade) * parseFloat(formData.precoMedio),
      dataCompra: formData.dataCompra,
      corretora: formData.corretora,
    };

    setInvestimentos([...investimentos, novoInvestimento]);
    limparFormulario();
  };

  const limparFormulario = () => {
    setFormData({
      codigo: "",
      tipo: "",
      quantidade: "",
      precoMedio: "",
      dataCompra: "",
      corretora: "",
    });
  };

  const excluirInvestimento = (id: number) => {
    if (window.confirm(t("confirm_delete_investment"))) {
      setInvestimentos(investimentos.filter((inv) => inv.id !== id));
    }
  };

  const editarInvestimento = (investimento: Investimento) => {
    setFormData({
      codigo: investimento.codigo,
      tipo: investimento.tipo,
      quantidade: investimento.quantidade.toString(),
      precoMedio: investimento.precoMedio.toString(),
      dataCompra: investimento.dataCompra || "",
      corretora: investimento.corretora || "",
    });
    setEditingId(investimento.id);
  };

  const salvarEdicao = () => {
    if (!formData.codigo || !formData.quantidade || !formData.precoMedio) {
      alert(t("fill_required_fields"));
      return;
    }

    const investimentoAtualizado: Investimento = {
      id: editingId!,
      codigo: formData.codigo.toUpperCase(),
      tipo: formData.tipo,
      quantidade: parseInt(formData.quantidade),
      precoMedio: parseFloat(formData.precoMedio),
      valorTotal:
        parseInt(formData.quantidade) * parseFloat(formData.precoMedio),
      dataCompra: formData.dataCompra,
      corretora: formData.corretora,
    };

    setInvestimentos(
      investimentos.map((inv) =>
        inv.id === editingId ? investimentoAtualizado : inv,
      ),
    );

    limparFormulario();
    setEditingId(null);
  };

  const cancelarEdicao = () => {
    limparFormulario();
    setEditingId(null);
  };

  const valorTotalCarteira = investimentos.reduce(
    (total, inv) => total + inv.valorTotal,
    0,
  );

  const distribuicaoTipo = investimentos.reduce(
    (acc, inv) => {
      acc[inv.tipo] = (acc[inv.tipo] || 0) + inv.valorTotal;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("investment_registration")}</h1>
        <p className="text-muted-foreground">
          {t("manage_portfolio_import_manual")}
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_invested")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold text-success">
                {formatCurrency(valorTotalCarteira)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("registered_assets")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{investimentos.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("different_types")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-warning" />
              <span className="text-2xl font-bold">
                {Object.keys(distribuicaoTipo).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("last_update")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Operação */}
      <div className="flex space-x-2">
        <Button
          variant={tipoOperacao === "manual" ? "default" : "outline"}
          onClick={() => setTipoOperacao("manual")}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("manual_registration")}
        </Button>
        <Button
          variant={tipoOperacao === "importar" ? "default" : "outline"}
          onClick={() => setTipoOperacao("importar")}
        >
          <Upload className="h-4 w-4 mr-2" />
          {t("import_data")}
        </Button>
      </div>

      {/* Cadastro Manual */}
      {tipoOperacao === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("add_new_investment")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codigo">{t("asset_code")} *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  placeholder={t("asset_code_placeholder")}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="tipo">{t("type")} *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => handleInputChange("tipo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ação">{t("stock")}</SelectItem>
                    <SelectItem value="FII">{t("real_estate_fund")}</SelectItem>
                    <SelectItem value="ETF">{t("etf")}</SelectItem>
                    <SelectItem value="BDR">{t("bdr")}</SelectItem>
                    <SelectItem value="Renda Fixa">
                      {t("fixed_income")}
                    </SelectItem>
                    <SelectItem value="Cripto">
                      {t("cryptocurrency")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantidade">{t("quantity")} *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) =>
                    handleInputChange("quantidade", e.target.value)
                  }
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="precoMedio">{t("average_price")} *</Label>
                <Input
                  id="precoMedio"
                  type="number"
                  step="0.01"
                  value={formData.precoMedio}
                  onChange={(e) =>
                    handleInputChange("precoMedio", e.target.value)
                  }
                  placeholder="125.50"
                />
              </div>

              <div>
                <Label htmlFor="dataCompra">{t("purchase_date")}</Label>
                <Input
                  id="dataCompra"
                  type="date"
                  value={formData.dataCompra}
                  onChange={(e) =>
                    handleInputChange("dataCompra", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="corretora">{t("broker")}</Label>
                <Input
                  id="corretora"
                  value={formData.corretora}
                  onChange={(e) =>
                    handleInputChange("corretora", e.target.value)
                  }
                  placeholder={t("broker_placeholder")}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={adicionarInvestimento}>
                {editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("save_changes")}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("add_investment")}
                  </>
                )}
              </Button>
              {editingId ? (
                <Button variant="outline" onClick={cancelarEdicao}>
                  {t("cancel")}
                </Button>
              ) : (
                <Button variant="outline" onClick={limparFormulario}>
                  {t("clear_form")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Importar Dados */}
      {tipoOperacao === "importar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>{t("import_file")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {t("drag_csv_excel_files")}
                </p>
                <Button>{t("select_files")}</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("accepted_formats")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>{t("connect_broker")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  "XP Investimentos",
                  "Rico",
                  "Clear",
                  "Inter",
                  "BTG Pactual",
                ].map((corretora) => (
                  <div
                    key={corretora}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{corretora}</span>
                    <Button variant="outline" size="sm">
                      {t("connect")}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("import_positions_automatically")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>{t("my_investments")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("code")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("quantity")}</TableHead>
                <TableHead>{t("average_price")}</TableHead>
                <TableHead>{t("total_value")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("broker")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div>
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t("complete_registration_access_visualization")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t("use_form_add_investments")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                investimentos.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.codigo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.tipo}</Badge>
                    </TableCell>
                    <TableCell>{inv.quantidade}</TableCell>
                    <TableCell>{formatCurrency(inv.precoMedio)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(inv.valorTotal)}
                    </TableCell>
                    <TableCell>
                      {inv.dataCompra
                        ? new Date(inv.dataCompra).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{inv.corretora || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarInvestimento(inv)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirInvestimento(inv.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Distribuição por Tipo */}
      {Object.keys(distribuicaoTipo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("distribution_by_asset_type")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(distribuicaoTipo).map(([tipo, valor]) => (
                <div key={tipo} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{tipo}</span>
                    <span>
                      {formatCurrency(valor)} (
                      {((valor / valorTotalCarteira) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(valor / valorTotalCarteira) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
