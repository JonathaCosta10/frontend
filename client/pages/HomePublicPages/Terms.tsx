import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="py-12 md:py-16 -mt-8">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Termos de Uso
            </h1>
            <Badge variant="outline" className="mb-8">
              Última atualização: 1 de Janeiro de 2024
            </Badge>
            
            <Card className="max-w-3xl mx-auto mt-8 shadow-md overflow-hidden">
              <div className="bg-primary h-1 w-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-primary">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  Estes termos estabelecem as regras para uso da plataforma Organizesee. 
                  Ao utilizar nossos serviços, você concorda com estas condições, 
                  que incluem seus direitos e responsabilidades como usuário.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12">

        {/* Main Content */}
        <div className="space-y-12">
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">1. Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Bem-vindo à plataforma Organizesee ("nós", "nosso" ou "Organizesee"). Ao acessar ou utilizar nosso website, aplicativo móvel e serviços (coletivamente, os "Serviços"), você concorda em cumprir e ficar vinculado aos seguintes Termos de Uso. Se você não concordar com qualquer parte destes termos, por favor, não utilize nossos Serviços.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">2. Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg mb-4">
                A Organizesee é uma plataforma de gerenciamento financeiro pessoal que permite aos usuários monitorar suas finanças, criar orçamentos, acompanhar investimentos e receber insights personalizados sobre sua saúde financeira.
              </p>
              
              <p className="text-base md:text-lg font-medium mb-2">
                Nossos Serviços podem incluir:
              </p>
              
              <ul className="space-y-2 mb-4 list-disc pl-5">
                <li>Consolidação e visualização de contas financeiras</li>
                <li>Ferramentas de orçamento e controle de gastos</li>
                <li>Análise e acompanhamento de investimentos</li>
                <li>Recomendações financeiras personalizadas</li>
                <li>Conteúdo educativo sobre finanças pessoais</li>
              </ul>
              
              <p className="text-base md:text-lg">
                Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte de nossos Serviços a qualquer momento, com ou sem aviso prévio.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">3. Elegibilidade e Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-2 text-primary">3.1 Requisitos de Idade</h3>
                  <p className="text-base">
                    Você deve ter pelo menos 18 anos de idade para utilizar nossos Serviços. Ao criar uma conta, você confirma que tem pelo menos 18 anos de idade.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-2 text-primary">3.2 Registro de Conta</h3>
                  <p className="text-base">
                    Para acessar determinadas funcionalidades dos Serviços, você precisará criar uma conta. Você concorda em fornecer informações precisas, atuais e completas durante o processo de registro e a manter essas informações atualizadas.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-2 text-primary">3.3 Segurança da Conta</h3>
                  <p className="text-base mb-3">
                    Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta. Você concorda em:
                  </p>
                  <ul className="space-y-1 list-disc pl-5">
                    <li>Criar uma senha forte e segura</li>
                    <li>Não compartilhar suas credenciais de login com terceiros</li>
                    <li>Notificar-nos imediatamente sobre qualquer uso não autorizado da sua conta</li>
                    <li>Garantir que você saia da sua conta ao final de cada sessão</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">4. Uso Aceitável</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-primary">4.1 Condutas Proibidas</h3>
                  <p className="text-base mb-3">
                    Ao utilizar nossos Serviços, você concorda em não:
                  </p>
                  <div className="bg-muted rounded-lg p-4 border border-border/50">
                    <ul className="space-y-1 list-disc pl-5">
                      <li>Violar quaisquer leis ou regulamentos aplicáveis</li>
                      <li>Fornecer informações falsas ou enganosas</li>
                      <li>Tentar acessar contas de outros usuários</li>
                      <li>Interferir ou interromper a integridade ou o desempenho dos Serviços</li>
                      <li>Contornar medidas de segurança ou limitações de acesso</li>
                      <li>Utilizar qualquer forma de mineração de dados, raspagem ou extração de dados</li>
                      <li>Utilizar os Serviços para fins ilegais ou não autorizados</li>
                      <li>Transmitir vírus, malware ou outros códigos maliciosos</li>
                      <li>Utilizar os Serviços para spam, phishing ou fraudes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2 text-primary">4.2 Conteúdo do Usuário</h3>
                  <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                    <p className="text-base">
                      Você é o único responsável por qualquer conteúdo que envie, publique ou exiba através dos Serviços ("Conteúdo do Usuário"). Você garante que possui todos os direitos necessários sobre qualquer Conteúdo do Usuário e que tal conteúdo não viola estes Termos ou quaisquer direitos de terceiros.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">5. Direitos de Propriedade Intelectual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">5.1 Nossos Direitos</h3>
                  <p className="text-sm md:text-base">
                    A Organizesee e seus licenciadores possuem todos os direitos, títulos e interesses, incluindo todos os direitos de propriedade intelectual relacionados aos Serviços, incluindo, mas não se limitando a, software, texto, gráficos, designs, marcas registradas, logotipos, sons, imagens e outros conteúdos.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">5.2 Licença Limitada</h3>
                  <p className="text-sm md:text-base">
                    Concedemos a você uma licença limitada, não exclusiva, não transferível e revogável para usar os Serviços para seus fins pessoais e não comerciais, sujeita a estes Termos.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">5.3 Feedback</h3>
                  <p className="text-sm md:text-base">
                    Se você fornecer sugestões, ideias, comentários ou outros feedbacks relacionados aos Serviços ("Feedback"), concede à Organizesee uma licença perpétua, mundial, irrevogável, gratuita e não exclusiva para usar, implementar e explorar comercialmente tal Feedback de qualquer maneira.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">6. Privacidade e Dados do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between bg-muted p-6 rounded-lg border border-border/50">
                <div className="max-w-xl">
                  <p className="text-base md:text-lg">
                    Nossa Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações pessoais. Ao utilizar nossos Serviços, você consente com as práticas descritas na Política de Privacidade.
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Button variant="outline" asChild className="border-primary/30 hover:bg-primary/5">
                    <Link to="/privacy-policy" className="flex items-center">
                      Política de Privacidade
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-2">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">7. Pagamentos e Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted rounded-lg p-5 border border-border/50">
                  <div className="flex items-start">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">7.1</Badge>
                    <h3 className="text-lg font-medium ml-2 text-primary">Planos e Preços</h3>
                  </div>
                  <p className="text-base">
                    A Organizesee oferece diferentes planos de serviço, incluindo um plano básico gratuito e planos pagos com recursos adicionais. Os preços, recursos e limitações de cada plano serão apresentados durante o processo de inscrição e podem ser atualizados periodicamente.
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-5 border border-border/50">
                  <div className="flex items-start">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">7.2</Badge>
                    <h3 className="text-lg font-medium ml-2 text-primary">Faturamento e Renovação</h3>
                  </div>
                  <p className="text-base">
                    Para planos pagos, você concorda em pagar todas as taxas aplicáveis no momento do faturamento. As assinaturas serão renovadas automaticamente a menos que você as cancele antes do próximo ciclo de faturamento. Os preços estão sujeitos a alterações, mas notificaremos você com antecedência sobre quaisquer alterações.
                  </p>
                </div>
                
                <div className="bg-muted rounded-lg p-5 border border-border/50">
                  <div className="flex items-start">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mb-3">7.3</Badge>
                    <h3 className="text-lg font-medium ml-2 text-primary">Cancelamentos e Reembolsos</h3>
                  </div>
                  <p className="text-base">
                    Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. Os reembolsos serão processados de acordo com nossa Política de Reembolso, disponível em nosso site.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">8. Limitação de Responsabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-5 rounded-lg border border-border/50 mb-6">
                <p className="text-base font-medium mb-4 text-foreground">
                  NA EXTENSÃO MÁXIMA PERMITIDA POR LEI, EM NENHUMA CIRCUNSTÂNCIA A ORGANIZESEE OU SEUS DIRETORES, FUNCIONÁRIOS, PARCEIROS, AGENTES OU FORNECEDORES SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS, INCLUINDO, MAS NÃO SE LIMITANDO A, PERDA DE LUCROS, DADOS, USO, REPUTAÇÃO OU OUTRAS PERDAS INTANGÍVEIS, RESULTANTES DE:
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-medium text-sm">a</span>
                    </div>
                    <p>SEU ACESSO OU USO, OU INCAPACIDADE DE ACESSAR OU USAR OS SERVIÇOS;</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-medium text-sm">b</span>
                    </div>
                    <p>QUALQUER CONDUTA OU CONTEÚDO DE TERCEIROS NOS SERVIÇOS;</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-medium text-sm">c</span>
                    </div>
                    <p>QUALQUER CONTEÚDO OBTIDO DOS SERVIÇOS; E</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-medium text-sm">d</span>
                    </div>
                    <p>ACESSO NÃO AUTORIZADO, USO OU ALTERAÇÃO DE SUAS TRANSMISSÕES OU CONTEÚDO.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg text-center">
                <p className="font-medium">
                  NOSSA RESPONSABILIDADE TOTAL POR QUAISQUER RECLAMAÇÕES RELACIONADAS AOS SERVIÇOS NÃO EXCEDERÁ O VALOR PAGO POR VOCÊ À ORGANIZESEE NOS 12 MESES ANTERIORES OU R$ 100,00, O QUE FOR MAIOR.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">9. Indenização</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Você concorda em indenizar, defender e isentar a Organizesee, suas afiliadas, diretores, funcionários e agentes de e contra quaisquer reclamações, responsabilidades, danos, perdas e despesas, incluindo, sem limitação, honorários advocatícios razoáveis, decorrentes de ou de qualquer forma relacionados ao seu uso dos Serviços, violação destes Termos ou violação de direitos de terceiros.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">10. Modificações dos Termos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <p className="text-base md:text-lg">
                  Reservamo-nos o direito de modificar estes Termos a qualquer momento, a nosso critério. Se fizermos alterações, publicaremos os Termos atualizados em nosso site e atualizaremos a data da "Última atualização" no topo destes Termos. Seu uso continuado dos Serviços após a publicação de Termos modificados constitui sua aceitação e concordância com tais modificações.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">11. Rescisão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-base md:text-lg">
                  Podemos encerrar ou suspender seu acesso e uso dos Serviços, incluindo sua conta, a qualquer momento e por qualquer motivo, sem aviso prévio, incluindo, mas não se limitando a, se acreditarmos que você violou estes Termos. Você pode descontinuar o uso dos Serviços e encerrar sua conta a qualquer momento.
                </p>
                <p className="text-base md:text-lg">
                  Após o término, seu direito de usar os Serviços cessará imediatamente. As disposições destes Termos que, por sua natureza, devem sobreviver ao término, permanecerão em vigor após o término do seu acesso aos Serviços.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">12. Disposições Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">12.1 Lei Aplicável</h3>
                  <p className="text-sm md:text-base">
                    Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, independentemente de conflitos de princípios legais.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">12.2 Resolução de Disputas</h3>
                  <p className="text-sm md:text-base">
                    Qualquer disputa decorrente ou relacionada a estes Termos ou aos Serviços será resolvida por meio de negociação amigável. Se a disputa não puder ser resolvida amigavelmente, será submetida à jurisdição exclusiva dos tribunais da cidade de São Paulo, Brasil.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">12.3 Integralidade do Acordo</h3>
                  <p className="text-sm md:text-base">
                    Estes Termos, juntamente com nossa Política de Privacidade, constituem o acordo integral entre você e a Organizesee em relação aos Serviços e substituem todos os acordos anteriores ou contemporâneos.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <h3 className="text-lg font-medium mb-3 text-primary">12.4 Renúncia e Separabilidade</h3>
                  <p className="text-sm md:text-base">
                    A falha da Organizesee em exercer ou fazer cumprir qualquer direito ou disposição destes Termos não constituirá uma renúncia a tal direito ou disposição. Se qualquer disposição destes Termos for considerada inválida ou inexequível, tal disposição será alterada e interpretada para cumprir os objetivos de tal disposição na medida do possível sob a lei aplicável, e as disposições restantes continuarão em pleno vigor e efeito.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">13. Contato</h2>
                  <p className="text-white/90 mb-4">
                    Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco:
                  </p>
                  <ul className="space-y-2 text-white mb-4">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                      E-mail: legal@organizesee.com
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      Endereço: Av. Paulista, 1000, São Paulo - SP
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      Telefone: (11) 3333-4444
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <Card className="shadow-md border border-border/30 rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold">Pronto para começar?</h3>
                <p className="text-muted-foreground mt-2">
                  Crie sua conta gratuita e comece a organizar suas finanças hoje mesmo.
                </p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link to="/privacy-policy">Política de Privacidade</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/signup">Criar Conta</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Terms;
