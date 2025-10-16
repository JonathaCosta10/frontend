import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
} from "lucide-react";
import { useTranslation } from '../../../contexts/TranslationContext';
import { useToast } from '@/shared/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: "credit" | "debit";
  brand: string;
  lastFour: string;
  expiry: string;
  isDefault: boolean;
  nickname?: string;
}

export default function PaymentOptions() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "credit",
      brand: "Visa",
      lastFour: "4532",
      expiry: "12/26",
      isDefault: true,
      nickname: "Cartão Principal",
    },
    {
      id: "2",
      type: "credit",
      brand: "Mastercard",
      lastFour: "8901",
      expiry: "08/25",
      isDefault: false,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    nickname: "",
  });

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: "credit",
      brand: "Visa", // Detectar automaticamente baseado no número
      lastFour: newCard.number.slice(-4),
      expiry: newCard.expiry,
      isDefault: paymentMethods.length === 0,
      nickname: newCard.nickname,
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({ number: "", expiry: "", cvv: "", name: "", nickname: "" });
    setIsAddDialogOpen(false);

    toast({
      title: "Sucesso",
      description: "Cartão adicionado com sucesso",
    });
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este cartão?")) {
      setPaymentMethods(paymentMethods.filter((card) => card.id !== id));
      toast({
        title: "Sucesso",
        description: "Cartão removido com sucesso",
      });
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((card) => ({
        ...card,
        isDefault: card.id === id,
      })),
    );
    toast({
      title: "Sucesso",
      description: "Cartão padrão alterado",
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opções de Pagamento</h1>
          <p className="text-muted-foreground">
            Gerencie seus métodos de pagamento e assinatura
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cartão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Número do Cartão</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) =>
                    setNewCard({
                      ...newCard,
                      number: formatCardNumber(e.target.value),
                    })
                  }
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/AA"
                    value={newCard.expiry}
                    onChange={(e) =>
                      setNewCard({
                        ...newCard,
                        expiry: formatExpiry(e.target.value),
                      })
                    }
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) =>
                      setNewCard({
                        ...newCard,
                        cvv: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Nome no Cartão</Label>
                <Input
                  id="card-name"
                  placeholder="Nome conforme aparece no cartão"
                  value={newCard.name}
                  onChange={(e) =>
                    setNewCard({ ...newCard, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido (opcional)</Label>
                <Input
                  id="nickname"
                  placeholder="Ex: Cartão Principal, Cartão Trabalho"
                  value={newCard.nickname}
                  onChange={(e) =>
                    setNewCard({ ...newCard, nickname: e.target.value })
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
              <Button onClick={handleAddCard}>Adicionar Cartão</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assinatura Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Assinatura Ativa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="font-semibold">Premium Mensal</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
              <p className="font-semibold">15 de Março, 2024</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-semibold">R$ 29,90/mês</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg ${method.isDefault ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {method.brand} •••• {method.lastFour}
                        </p>
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {method.nickname && `${method.nickname} • `}
                        Expira em {method.expiry}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Tornar Padrão
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCard(method.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {paymentMethods.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum cartão cadastrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Adicione um cartão para continuar com sua assinatura
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Histórico de Faturas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: "15/02/2024",
                amount: "R$ 29,90",
                status: "Pago",
                invoice: "INV-2024-02-001",
              },
              {
                date: "15/01/2024",
                amount: "R$ 29,90",
                status: "Pago",
                invoice: "INV-2024-01-001",
              },
              {
                date: "15/12/2023",
                amount: "R$ 29,90",
                status: "Pago",
                invoice: "INV-2023-12-001",
              },
            ].map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{invoice.invoice}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">{invoice.amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Seus dados de pagamento são protegidos com criptografia de nível
          bancário. Nunca armazenamos informações completas do cartão em nossos
          servidores.
        </AlertDescription>
      </Alert>
    </div>
  );
}
