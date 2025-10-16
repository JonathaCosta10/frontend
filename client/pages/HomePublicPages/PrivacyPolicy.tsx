import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Users, FileText, MessageCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-lg text-muted-foreground">
            Atualizada em 16 de setembro de 2025
          </p>
        </div>

        {/* Resumo Card */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Resumo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              A privacidade do usuário é prioridade no Organizesee. Coletamos apenas o mínimo necessário para que a plataforma funcione e não utilizamos seus dados para fins comerciais. Você mantém total controle sobre suas informações.
            </p>
          </CardContent>
        </Card>

        {/* Main Content Cards */}
        <div className="space-y-8">
          {/* Introdução */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Introdução</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                O Organizesee foi criado para ajudar você a organizar seu orçamento doméstico e seus investimentos, não para coletar dados pessoais. Nosso compromisso é oferecer um ambiente seguro e transparente, em que seus dados permanecem sob sua guarda.
              </p>
            </CardContent>
          </Card>

          {/* Quais Dados Coletamos */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Quais Dados Coletamos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Cadastro e login:</h4>
                <p className="text-muted-foreground">
                  apenas as informações essenciais para criar e acessar sua conta (como e-mail e senha).
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Informações financeiras:</h4>
                <p className="text-muted-foreground">
                  ficam armazenadas localmente no seu navegador, não em nossos servidores.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Dados de uso básicos:</h4>
                <p className="text-muted-foreground">
                  métricas anônimas, quando necessário, para melhorar a experiência da plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Como Usamos os Dados */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-2xl">Como Usamos os Dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Fornecer e manter os serviços da plataforma.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Garantir a segurança da sua conta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Melhorar funcionalidades com base em estatísticas agregadas e anônimas.</span>
                </li>
              </ul>
              
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros sem seu consentimento expresso.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-2xl">Segurança</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Adotamos medidas técnicas e organizacionais para proteger seus dados. Além disso, como armazenamos o mínimo possível, o risco de qualquer incidente é significativamente reduzido.
              </p>
            </CardContent>
          </Card>

          {/* Seus Direitos */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
                <CardTitle className="text-2xl">Seus Direitos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Você tem o direito de:
              </p>
              
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Acessar e revisar as informações que temos sobre você.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Solicitar correção ou exclusão de seus dados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Retirar seu consentimento a qualquer momento.</span>
                </li>
              </ul>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200">
                  Entre em contato pelo e-mail{" "}
                  <a href="mailto:privacidade@organizesee.com.br" className="font-medium hover:underline">
                    privacidade@organizesee.com.br
                  </a>
                  {" "}para exercer esses direitos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Atualizações desta Política */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-2xl">Atualizações desta Política</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta política para refletir melhorias na plataforma ou mudanças legais. Sempre que houver alterações relevantes, informaremos por meio do site.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Nossa equipe está pronta para ajudar com qualquer questão relacionada à privacidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/contact">Fale Conosco</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/signup">Criar Conta</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}