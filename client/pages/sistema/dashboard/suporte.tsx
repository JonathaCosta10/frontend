import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LifeBuoy,
  Mail,
  MessageSquare,
  Clock,
  Send,
  FileText,
  HelpCircle,
  Zap,
  Shield,
  Bug,
  Star,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import EmailService from "@/services/emailService";

interface SupportForm {
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  attachments?: FileList;
}

export default function Suporte() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupportForm>({
    name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || "",
    email: user?.email || "",
    category: "",
    priority: "medium",
    subject: "",
    message: "",
  });

  const contactChannels = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: "Email",
      description: "suporte@organizesee.com",
      subtitle: t("response_time_24h"),
      color: "bg-blue-100 text-blue-700",
      action: "mailto:suporte@organizesee.com",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "WhatsApp",
      description: "+55 (11) 99999-9999",
      subtitle: t("monday_to_friday_9_to_18"),
      color: "bg-green-100 text-green-700",
      action: "https://wa.me/5511999999999",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Discord",
      description: "Comunidade Organizesee",
      subtitle: t("real_time_chat"),
      color: "bg-purple-100 text-purple-700",
      action: "https://discord.gg/organizesee",
    },
    {
      icon: <Send className="h-5 w-5" />,
      title: "Telegram",
      description: "@OrganizeseeSupport",
      subtitle: t("direct_support"),
      color: "bg-sky-100 text-sky-700",
      action: "https://t.me/OrganizeseeSupport",
    },
  ];  const socialMediaLinks = [
    {
      name: "Twitter",
      url: "https://twitter.com/organizesee",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/organizesee",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      color: "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700",
    },
    {
      name: "Facebook",
      url: "https://facebook.com/organizesee",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@organizesee",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@organizesee",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
    },
  ];

  const categories = [
    {
      value: "technical",
      label: "Problema Técnico",
      icon: <Bug className="h-4 w-4" />,
    },
    {
      value: "billing",
      label: "Cobrança e Pagamento",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: "account",
      label: "Conta e Login",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      value: "feature",
      label: "Solicitação de Recurso",
      icon: <Star className="h-4 w-4" />,
    },
    {
      value: "general",
      label: "Dúvida Geral",
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      value: "integration",
      label: "Integração B3",
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  const priorities = [
    { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-700" },
    { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-700" },
    { value: "high", label: "Alta", color: "bg-orange-100 text-orange-700" },
    { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-700" },
  ];

  const faqItems = [
    {
      question: "Como conectar minha conta B3?",
      answer:
        "Vá em Configurações > Integração B3 e siga as instruções para autorizar o acesso aos seus dados. É necessário apenas o CPF para integração segura.",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Sim! Utilizamos criptografia de ponta a ponta e seguimos rigorosos protocolos de segurança. Nunca armazenamos senhas ou dados sensíveis da B3.",
    },
    {
      question: "Como funciona o plano Premium?",
      answer:
        "O plano Premium oferece análises avançadas, relatórios personalizados, alertas em tempo real e acesso a funcionalidades exclusivas por R$ 29,90/mês.",
    },
    {
      question: "Posso exportar meus dados?",
      answer:
        "Sim! Em Configurações > Dados e Backup você pode exportar todos os seus dados em formato CSV ou JSON a qualquer momento.",
    },
    {
      question: "Como funciona a autenticação 2FA?",
      answer:
        "Configure autenticação de dois fatores por email em Configurações > Segurança para adicionar uma camada extra de proteção à sua conta.",
    },
    {
      question: "Problemas com sincronização de dados?",
      answer:
        "Verifique sua conexão com a internet e tente atualizar os dados manualmente. Se o problema persistir, entre em contato conosco.",
    },
  ];

  const systemStatus = [
    { service: "API Principal", status: "operational", uptime: "99.9%" },
    { service: "Integração B3", status: "operational", uptime: "99.7%" },
    { service: "Sistema de Login", status: "operational", uptime: "99.95%" },
    { service: "Relatórios", status: "maintenance", uptime: "99.8%" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar dados antes de enviar
      if (!formData.subject.trim() || !formData.message.trim()) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha o assunto e a mensagem.",
          variant: "destructive",
        });
        return;
      }

      // Chamar a API de contato de suporte
      const response = await EmailService.contatoSuporte({
        assunto: formData.subject,
        mensagem: `
Categoria: ${formData.category}
Prioridade: ${formData.priority}
Nome: ${formData.name}
Email: ${formData.email}

Mensagem:
${formData.message}
        `.trim(),
        email: user?.email !== formData.email ? formData.email : undefined,
      });

      toast({
        title: "Ticket criado com sucesso!",
        description: response.message || "Seu ticket foi criado. Você receberá uma resposta em até 24h.",
      });

      // Limpar formulário
      setFormData({
        name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || "",
        email: user?.email || "",
        category: "",
        priority: "medium",
        subject: "",
        message: "",
      });

    } catch (error: any) {
      console.error("Erro ao enviar ticket de suporte:", error);
      
      toast({
        title: "Erro ao enviar ticket",
        description: error.message || "Não foi possível enviar o ticket. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "maintenance":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "down":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-700";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "down":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <LifeBuoy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t("support")}</h1>
          <p className="text-muted-foreground">
            {t("help_center_technical_support")}
          </p>
        </div>
      </div>

      {/* Social Media Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>{t("our_social_networks")}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("follow_us_for_tips")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {socialMediaLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${social.color}`}
              >
                <div className="mb-2">{social.icon}</div>
                <span className="text-sm font-medium text-center">
                  {social.name}
                </span>
              </a>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              💡 <strong>Dica:</strong> Siga nossas redes para receber alertas
              de mercado, análises semanais e webinars exclusivos!
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Methods */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Canais de Contato</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactChannels.map((method, index) => (
                <div
                  key={index}
                  className="group border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50"
                  onClick={() => window.open(method.action, "_blank")}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${method.color}`}>
                        {method.icon}
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {method.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {method.description}
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {method.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Status do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium">{item.service}</span>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status === "operational"
                      ? "Operacional"
                      : item.status === "maintenance"
                        ? "Manutenção"
                        : "Indisponível"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{item.uptime}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Última atualização: {new Date().toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Abrir Ticket de Suporte</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Descreva detalhadamente seu problema para que possamos ajudá-lo
            melhor.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          {cat.icon}
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Resumo do problema ou dúvida"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Descrição detalhada *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Descreva o problema em detalhes, incluindo passos para reproduzir o erro, mensagens de erro exatas, etc."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Anexos (opcional)</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.txt,.log"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                Máximo 5MB por arquivo. Formatos aceitos: JPG, PNG, PDF, TXT,
                LOG
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Perguntas Frequentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Documentação</h3>
            <p className="text-sm text-muted-foreground">
              Guias detalhados e tutoriais
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Comunidade</h3>
            <p className="text-sm text-muted-foreground">
              Conecte-se com outros usuários
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Treinamentos</h3>
            <p className="text-sm text-muted-foreground">
              Webinars e cursos online
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
