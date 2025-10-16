import React from "react";
import { useTranslation } from '../../../../contexts/TranslationContext';
import PublicLayout from "@/features/public/components/PublicLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Users, Target, Building, MessageCircle } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sobre o Organizesee
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            O Organizesee é uma plataforma completa de organização financeira pessoal, desenvolvida especialmente para quem vive no Brasil e quer ter controle total sobre orçamento doméstico e investimentos — tudo em um só lugar, de forma simples e acessível.
          </p>
        </div>

        {/* Main Content Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Nossa Missão */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Nossa Missão</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Trazer clareza e praticidade para a sua vida financeira. O Organizesee nasceu da necessidade de centralizar informações que, até então, ficavam dispersas em diferentes fontes. Como desenvolvedor independente, senti na pele a dificuldade de acompanhar meus próprios investimentos e decidi criar uma ferramenta que atendesse não apenas às minhas necessidades, mas às de todos que buscam autonomia financeira.
              </p>
            </CardContent>
          </Card>

          {/* O que oferecemos */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">O que oferecemos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Reunimos dados públicos do mercado financeiro brasileiro, organizamos essas informações em um painel intuitivo e apresentamos análises que facilitam a tomada de decisão. Não fazemos recomendações de investimento: fornecemos ferramentas e insights para que você possa analisar, planejar e agir com confiança.
              </p>
            </CardContent>
          </Card>

          {/* Independência e Qualidade */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Heart className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Independência e Qualidade</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Cada recurso é planejado e desenvolvido por uma única pessoa, com atenção aos detalhes e foco absoluto na experiência do usuário. Sem pressões corporativas nem compromissos com terceiros, garantimos uma evolução contínua voltada para as reais necessidades de quem usa a plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Transparência Total */}
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-2xl">Transparência Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Privacidade e controle dos dados são princípios fundamentais. Não vendemos nem compartilhamos suas informações sem consentimento. Você é e sempre será o único dono dos seus dados dentro do Organizesee.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="space-y-8">
          {/* Comunidade em Crescimento */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-2xl">Comunidade em Crescimento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Ouvimos cada sugestão e incorporamos melhorias constantemente. A participação da comunidade de usuários é parte essencial para que a plataforma se mantenha relevante, moderna e em constante aperfeiçoamento.
              </p>
            </CardContent>
          </Card>

          {/* Acessibilidade Premium */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Acessibilidade Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Nosso plano premium oferece recursos avançados por um valor extremamente acessível — quase de graça — para que qualquer pessoa possa alcançar um nível profissional de organização financeira, sem pesar no bolso.
              </p>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-indigo-500" />
                </div>
                <CardTitle className="text-2xl">Contato</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Tem dúvidas, ideias ou quer conversar? Fale com a gente pelo formulário de suporte ou envie um e-mail para{" "}
                <a href="mailto:contato@organizesee.com.br" className="text-primary hover:underline font-medium">
                  contato@organizesee.com.br
                </a>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4">Pronto para organizar suas finanças?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Junte-se a milhares de brasileiros que já estão no controle de suas finanças pessoais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/signup">Começar Gratuitamente</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/demo">Ver Demonstração</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
