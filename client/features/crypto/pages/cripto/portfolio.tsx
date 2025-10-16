import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Bitcoin,
  Plus,
  Trash2,
  Edit,
  Bell,
  BellOff,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useToast } from '@/shared/hooks/use-toast';

interface CryptoWishlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  change24h: number;
  alertsEnabled: boolean;
  notes: string;
  dateAdded: string;
  alertType: "above" | "below";
}

export default function ListaDesejoCripto() {
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<CryptoWishlistItem[]>([
    {
      id: "1",
      symbol: "BTC",
      name: "Bitcoin",
      currentPrice: 293450.5,
      targetPrice: 320000,
      change24h: 2.45,
      alertsEnabled: true,
      notes: "Aguardando rompimento dos R$ 320k para entrada adicional",
      dateAdded: "2024-02-15",
      alertType: "above",
    },
    {
      id: "2",
      symbol: "ETH",
      name: "Ethereum",
      currentPrice: 12250.75,
      targetPrice: 10000,
      change24h: -1.23,
      alertsEnabled: true,
      notes: "Oportunidade de compra se cair para R$ 10k",
      dateAdded: "2024-02-10",
      alertType: "below",
    },
    {
      id: "3",
      symbol: "SOL",
      name: "Solana",
      currentPrice: 485.3,
      targetPrice: 500,
      change24h: 5.67,
      alertsEnabled: false,
      notes: "Acompanhando para possível entrada",
      dateAdded: "2024-02-08",
      alertType: "above",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CryptoWishlistItem | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    symbol: "",
    name: "",
    targetPrice: "",
    notes: "",
    alertType: "above" as "above" | "below",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getAlertStatus = (item: CryptoWishlistItem) => {
    const isTriggered =
      item.alertType === "above"
        ? item.currentPrice >= item.targetPrice
        : item.currentPrice <= item.targetPrice;

    return isTriggered;
  };

  const handleAddItem = () => {
    if (!newItem.symbol || !newItem.name || !newItem.targetPrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos símbolo, nome e preço alvo",
        variant: "destructive",
      });
      return;
    }

    const item: CryptoWishlistItem = {
      id: Date.now().toString(),
      symbol: newItem.symbol.toUpperCase(),
      name: newItem.name,
      currentPrice: Math.random() * 100000, // Mock current price
      targetPrice: parseFloat(newItem.targetPrice),
      change24h: (Math.random() - 0.5) * 10,
      alertsEnabled: true,
      notes: newItem.notes,
      dateAdded: new Date().toISOString().split("T")[0],
      alertType: newItem.alertType,
    };

    setWishlistItems([...wishlistItems, item]);
    setNewItem({
      symbol: "",
      name: "",
      targetPrice: "",
      notes: "",
      alertType: "above",
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Item adicionado",
      description: `${item.symbol} foi adicionado à sua lista de desejos`,
    });
  };

  const handleDeleteItem = (id: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
    toast({
      title: "Item removido",
      description: "Item removido da lista de desejos",
    });
  };

  const toggleAlerts = (id: string) => {
    setWishlistItems(
      wishlistItems.map((item) =>
        item.id === id ? { ...item, alertsEnabled: !item.alertsEnabled } : item,
      ),
    );
  };

  const handleEditItem = (item: CryptoWishlistItem) => {
    setEditingItem(item);
    setNewItem({
      symbol: item.symbol,
      name: item.name,
      targetPrice: item.targetPrice.toString(),
      notes: item.notes,
      alertType: item.alertType,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (
      !editingItem ||
      !newItem.symbol ||
      !newItem.name ||
      !newItem.targetPrice
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos símbolo, nome e preço alvo",
        variant: "destructive",
      });
      return;
    }

    setWishlistItems(
      wishlistItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              symbol: newItem.symbol.toUpperCase(),
              name: newItem.name,
              targetPrice: parseFloat(newItem.targetPrice),
              notes: newItem.notes,
              alertType: newItem.alertType,
            }
          : item,
      ),
    );

    setNewItem({
      symbol: "",
      name: "",
      targetPrice: "",
      notes: "",
      alertType: "above",
    });
    setEditingItem(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Item atualizado",
      description: `${newItem.symbol} foi atualizado na sua lista de desejos`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Target className="h-6 w-6 text-purple-500" />
            <span>Lista de Desejos - Crypto</span>
          </h2>
          <p className="text-muted-foreground">
            Monitore criptomoedas e configure alertas de preço
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cripto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Criptomoeda à Lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Símbolo</Label>
                  <Input
                    id="symbol"
                    placeholder="Ex: BTC, ETH"
                    value={newItem.symbol}
                    onChange={(e) =>
                      setNewItem({ ...newItem, symbol: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Bitcoin, Ethereum"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Preço Alvo (R$)</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    placeholder="0.00"
                    value={newItem.targetPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, targetPrice: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertType">Tipo de Alerta</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newItem.alertType}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        alertType: e.target.value as "above" | "below",
                      })
                    }
                  >
                    <option value="above">Acima do preço</option>
                    <option value="below">Abaixo do preço</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione suas observações sobre este ativo..."
                  value={newItem.notes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddItem}>Adicionar à Lista</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? `Editar ${editingItem.symbol}`
                  : "Editar Criptomoeda"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-symbol">Símbolo</Label>
                  <Input
                    id="edit-symbol"
                    placeholder="Ex: BTC, ETH"
                    value={newItem.symbol}
                    onChange={(e) =>
                      setNewItem({ ...newItem, symbol: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    placeholder="Ex: Bitcoin, Ethereum"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-targetPrice">Preço Alvo (R$)</Label>
                  <Input
                    id="edit-targetPrice"
                    type="number"
                    placeholder="0.00"
                    value={newItem.targetPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, targetPrice: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-alertType">Tipo de Alerta</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newItem.alertType}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        alertType: e.target.value as "above" | "below",
                      })
                    }
                  >
                    <option value="above">Acima do preço</option>
                    <option value="below">Abaixo do preço</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas (opcional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Adicione suas observações sobre este ativo..."
                  value={newItem.notes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingItem(null);
                  setNewItem({
                    symbol: "",
                    name: "",
                    targetPrice: "",
                    notes: "",
                    alertType: "above",
                  });
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateItem}>Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total na Lista</p>
                <p className="font-semibold">{wishlistItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="font-semibold">
                  {wishlistItems.filter((item) => item.alertsEnabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Alertas Atingidos
                </p>
                <p className="font-semibold">
                  {wishlistItems.filter((item) => getAlertStatus(item)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Em Alta (24h)</p>
                <p className="font-semibold">
                  {wishlistItems.filter((item) => item.change24h > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Criptomoedas de Interesse</CardTitle>
        </CardHeader>
        <CardContent>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lista vazia</h3>
              <p className="text-muted-foreground mb-4">
                Adicione criptomoedas à sua lista para monitorar preços e
                receber alertas
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Cripto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Preço Atual</TableHead>
                  <TableHead>Preço Alvo</TableHead>
                  <TableHead>Variação 24h</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alertas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlistItems.map((item) => {
                  const isAlertTriggered = getAlertStatus(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <Bitcoin className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{item.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.currentPrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {item.alertType === "above" ? (
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                          )}
                          <span>{formatCurrency(item.targetPrice)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center space-x-1 ${
                            item.change24h > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.change24h > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {item.change24h > 0 ? "+" : ""}
                            {item.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAlertTriggered ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Atingido
                          </Badge>
                        ) : (
                          <Badge variant="outline">Aguardando</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.alertsEnabled}
                          onCheckedChange={() => toggleAlerts(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditItem(item)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                            title="Editar item"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem(item.id)}
                            className="hover:bg-red-50 hover:text-red-600 text-destructive"
                            title="Excluir item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
