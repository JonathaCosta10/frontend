import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="py-12 md:py-16 -mt-8 mb-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Sobre o Organizesee
            </h1>
            
            <Card className="max-w-3xl mx-auto mt-8 shadow-md overflow-hidden">
              <div className="bg-primary h-1 w-full"></div>
              <CardContent className="py-6">
                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                  O Organizesee é uma plataforma completa de organização financeira pessoal, 
                  desenvolvida especialmente para quem vive no Brasil e quer ter controle total 
                  sobre orçamento doméstico e investimentos — tudo em um só lugar, de forma simples e acessível.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {/* Nossa Missão */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="m16 6-4 4-4-4"></path>
                  <path d="M16 18a4 4 0 0 0 0-8"></path>
                  <path d="M8 18a4 4 0 0 1 0-8"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Nossa Missão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Trazer clareza e praticidade para a sua vida financeira. O Organizesee nasceu 
                da necessidade de centralizar informações que, até então, ficavam dispersas em diferentes fontes. 
                Como desenvolvedor independente, senti na pele a dificuldade de acompanhar meus próprios 
                investimentos e decidi criar uma ferramenta que atendesse não apenas às minhas necessidades, 
                mas às de todos que buscam autonomia financeira.
              </p>
            </CardContent>
          </Card>

          {/* O que oferecemos */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">O que oferecemos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Reunimos dados públicos do mercado financeiro brasileiro, organizamos essas informações 
                em um painel intuitivo e apresentamos análises que facilitam a tomada de decisão. 
                Não fazemos recomendações de investimento: fornecemos ferramentas e insights para 
                que você possa analisar, planejar e agir com confiança.
              </p>
            </CardContent>
          </Card>

          {/* Independência e Qualidade */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M12 2v4"></path>
                  <path d="M12 18v4"></path>
                  <path d="M4.93 4.93l2.83 2.83"></path>
                  <path d="M16.24 16.24l2.83 2.83"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                  <path d="M4.93 19.07l2.83-2.83"></path>
                  <path d="M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Independência e Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Cada recurso é planejado e desenvolvido por uma única pessoa, com atenção aos detalhes 
                e foco absoluto na experiência do usuário. Sem pressões corporativas nem compromissos 
                com terceiros, garantimos uma evolução contínua voltada para as reais necessidades 
                de quem usa a plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Transparência Total */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Transparência Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Privacidade e controle dos dados são princípios fundamentais. Não vendemos nem 
                compartilhamos suas informações sem consentimento. Você é e sempre será o único 
                dono dos seus dados dentro do Organizesee.
              </p>
            </CardContent>
          </Card>

          {/* Comunidade em Crescimento */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Comunidade em Crescimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Ouvimos cada sugestão e incorporamos melhorias constantemente. A participação da 
                comunidade de usuários é parte essencial para que a plataforma se mantenha relevante, 
                moderna e em constante aperfeiçoamento.
              </p>
            </CardContent>
          </Card>

          {/* Acessibilidade Premium */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Acessibilidade Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                Nosso plano premium oferece recursos avançados por um valor extremamente acessível — 
                quase de graça — para que qualquer pessoa possa alcançar um nível profissional de 
                organização financeira, sem pesar no bolso.
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Contato - Full Width */}
        <Card className="shadow-md overflow-hidden mt-16">
          <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="bg-white/20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Contato</h2>
                <p className="text-white/90 mb-4">
                  Tem dúvidas, ideias ou quer conversar? Fale com a gente pelo formulário de suporte 
                  ou envie um e-mail para:
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <a href="mailto:contato@organizesee.com.br" 
                    className="inline-flex items-center px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors">
                    contato@organizesee.com.br
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <Link to="/contato" className="inline-flex items-center px-6 py-3 bg-primary/30 border border-white/30 text-white font-medium rounded-lg hover:bg-primary/40 transition-colors">
                    Formulário de Contato
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default About;
