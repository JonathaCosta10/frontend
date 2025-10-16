import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Users, Building, Scale, MessageCircle } from "lucide-react";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Termos de Uso
          </h1>
          <p className="text-lg text-muted-foreground">
            Última atualização: 16 de setembro de 2025
          </p>
        </div>

        {/* Main Content Cards */}
        <div className="space-y-8">
          {/* Aceitação dos Termos */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Aceitação dos Termos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Bem-vindo à plataforma Organizesee ("nós", "nosso" ou "Organizesee"). Ao acessar ou utilizar nosso website, aplicativo móvel e serviços (coletivamente, os "Serviços"), você concorda em cumprir e ficar vinculado aos seguintes Termos de Uso. Se você não concordar com qualquer parte destes termos, por favor, não utilize nossos Serviços.
              </p>
            </CardContent>
          </Card>

          {/* Descrição do Serviço */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Building className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Descrição do Serviço</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Organizesee é uma plataforma de gerenciamento financeiro pessoal que permite aos usuários monitorar suas finanças, criar orçamentos, acompanhar investimentos e receber insights personalizados sobre sua saúde financeira.
              </p>
              
              <h4 className="font-semibold text-lg mb-3">Nossos Serviços podem incluir:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consolidação e visualização de contas financeiras</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ferramentas de orçamento e controle de gastos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Análise e acompanhamento de investimentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Recomendações financeiras personalizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Conteúdo educativo sobre finanças pessoais</span>
                </li>
              </ul>

              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-200">
                  Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte de nossos Serviços a qualquer momento, com ou sem aviso prévio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Elegibilidade e Contas */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-2xl">Elegibilidade e Contas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">Requisitos de Idade</h4>
                <p className="text-muted-foreground">
                  Você deve ter pelo menos 18 anos de idade para utilizar nossos Serviços. Ao criar uma conta, você confirma que tem pelo menos 18 anos de idade.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Registro de Conta</h4>
                <p className="text-muted-foreground">
                  Para acessar determinadas funcionalidades dos Serviços, você precisará criar uma conta. Você concorda em fornecer informações precisas, atuais e completas durante o processo de registro e a manter essas informações atualizadas.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Segurança da Conta</h4>
                <p className="text-muted-foreground mb-3">
                  Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta. Você concorda em:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Criar uma senha forte e segura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Não compartilhar suas credenciais de login com terceiros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Garantir que você saia da sua conta ao final de cada sessão</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Uso Aceitável */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-2xl">Uso Aceitável</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-3">Condutas Proibidas</h4>
                  <p className="text-muted-foreground mb-3">
                    Ao utilizar nossos Serviços, você concorda em não:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Violar quaisquer leis ou regulamentos aplicáveis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fornecer informações falsas ou enganosas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Tentar acessar contas de outros usuários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Interferir ou interromper a integridade ou o desempenho dos Serviços</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Utilizar os Serviços para fins ilegais ou não autorizados</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Conteúdo do Usuário</h4>
                  <p className="text-muted-foreground">
                    Você é o único responsável por qualquer conteúdo que envie, publique ou exiba através dos Serviços ("Conteúdo do Usuário"). Você garante que possui todos os direitos necessários sobre qualquer Conteúdo do Usuário e que tal conteúdo não viola estes Termos ou quaisquer direitos de terceiros.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidade e Dados do Usuário */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-indigo-500" />
                </div>
                <CardTitle className="text-2xl">Privacidade e Dados do Usuário</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Nossa Política de Privacidade, disponível em{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
                  Política de Privacidade
                </Link>
                , descreve como coletamos, usamos e compartilhamos suas informações pessoais. Ao utilizar nossos Serviços, você consente com as práticas descritas na Política de Privacidade.
              </p>
            </CardContent>
          </Card>

          {/* Limitação de Responsabilidade */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Scale className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-2xl">Limitação de Responsabilidade</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-orange-800 dark:text-orange-200 font-medium mb-3">
                  IMPORTANTE: Limitações de Responsabilidade
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-sm leading-relaxed">
                  Na extensão máxima permitida por lei, em nenhuma circunstância a Organizesee será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, mas não se limitando a, perda de lucros, dados, uso ou outras perdas intangíveis.
                </p>
              </div>
              
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Nossa responsabilidade total por quaisquer reclamações relacionadas aos Serviços não excederá o valor pago por você à Organizesee nos 12 meses anteriores ou R$ 100,00, o que for maior.
              </p>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-600/10 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Contato</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco:
              </p>
              
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>E-mail:</strong>{" "}
                  <a href="mailto:legal@organizesee.com" className="text-primary hover:underline">
                    legal@organizesee.com
                  </a>
                </p>
                <p><strong>Endereço:</strong> Av. Paulista, 1000, São Paulo - SP</p>
                <p><strong>Telefone:</strong> (11) 3333-4444</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Crie sua conta gratuita e comece a organizar suas finanças hoje mesmo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/signup">Criar Conta</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/privacy-policy">Política de Privacidade</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Terms;