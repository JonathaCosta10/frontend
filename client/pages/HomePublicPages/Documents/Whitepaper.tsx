import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Download,
  Menu, 
  X, 
  Moon, 
  Sun,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Whitepaper() {
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introducao");
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const tableOfContents = [
    { id: "introducao", title: "Introdução" },
    { id: "visao", title: "Visão da Organizesee" },
    { id: "solucao", title: "Nossa Solução" },
    { id: "arquitetura", title: "Arquitetura da Plataforma" },
    { id: "seguranca", title: "Segurança e Privacidade" },
    { id: "planos", title: "Planos Futuros" },
    { id: "conclusao", title: "Conclusão" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`border-b bg-card transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Link to="/">
                <Button variant="outline" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-center flex items-center space-x-2 text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar para Home</span>
                  </Button>
                </Link>
                
                {/* Mobile Table of Contents */}
                <div className="px-2 pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Índice:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {tableOfContents.map((section) => (
                      <Button
                        key={section.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start ${
                          activeSection === section.id ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={() => scrollToSection(section.id)}
                      >
                        {section.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className={`container mx-auto px-4 pb-20 ${isScrolled ? 'pt-28' : 'pt-8'}`}>
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - Table of Contents (Desktop) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="font-semibold mb-4 text-lg">Índice</h3>
              <ul className="space-y-2">
                {tableOfContents.map((section) => (
                  <li key={section.id}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        activeSection === section.id ? "bg-primary/10 text-primary" : ""
                      }`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.title}
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-4 border-t border-border">
                <a 
                  href="https://bitcoin.org/files/bitcoin-paper/bitcoin_pt_br.pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Baixar PDF</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 md:ml-10">
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Whitepaper Organizesee</h1>
              <p className="text-muted-foreground">Publicado em: 24 de agosto de 2023</p>
              <div className="border border-border rounded-lg p-4 bg-card my-6">
                <h3 className="font-semibold mb-2">Sumário Executivo</h3>
                <p className="text-sm text-muted-foreground">
                  Este documento apresenta a visão da Organizesee para revolucionar a gestão financeira pessoal e 
                  democratizar o acesso a ferramentas profissionais de investimento. Descrevemos nosso sistema, 
                  soluções e arquitetura de segurança que protege todos os dados dos usuários.
                </p>
              </div>
              
              <section id="introducao" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
                <p>
                  O mercado financeiro brasileiro tem passado por transformações significativas nos últimos anos, 
                  com um crescimento exponencial no número de investidores pessoa física. No entanto, a maioria 
                  das pessoas ainda enfrenta dificuldades para gerenciar suas finanças pessoais e tomar decisões 
                  de investimento informadas.
                </p>
                <p className="mt-4">
                  A Organizesee nasceu da necessidade de democratizar o acesso a ferramentas financeiras profissionais, 
                  fornecendo uma plataforma completa e intuitiva para o gerenciamento financeiro pessoal e acompanhamento 
                  de investimentos.
                </p>
                <p className="mt-4">
                  Inspirados pela revolução que as criptomoedas trouxeram para o mundo financeiro, nossa plataforma 
                  busca trazer o mesmo nível de transparência, segurança e controle para as finanças pessoais 
                  tradicionais.
                </p>
              </section>

              <section id="visao" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">2. Visão da Organizesee</h2>
                <p>
                  Nossa visão é construir um ecossistema financeiro completo que permita a qualquer pessoa, 
                  independentemente de seu conhecimento financeiro prévio, gerenciar suas finanças pessoais 
                  e investimentos com eficiência e segurança.
                </p>
                <p className="mt-4">
                  Identificamos três problemas principais que a maioria das pessoas enfrenta:
                </p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      <strong>Falta de visibilidade:</strong> A maioria das pessoas não tem uma visão clara 
                      de sua situação financeira completa, com informações dispersas em diferentes aplicativos 
                      e bancos.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      <strong>Complexidade dos investimentos:</strong> O mercado financeiro é cheio de jargões 
                      e complexidades que dificultam a entrada de novos investidores.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>
                      <strong>Ferramentas fragmentadas:</strong> As soluções existentes são fragmentadas, 
                      obrigando os usuários a utilizar múltiplos aplicativos para gestão financeira completa.
                    </span>
                  </li>
                </ul>
              </section>

              <section id="solucao" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">3. Nossa Solução</h2>
                <p>
                  A Organizesee oferece uma plataforma integrada que aborda esses problemas através de:
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="font-semibold mb-3">Gestão Financeira Unificada</h3>
                    <p className="text-sm text-muted-foreground">
                      Centralização de todas as informações financeiras em uma única plataforma, 
                      permitindo uma visão holística das finanças pessoais.
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="font-semibold mb-3">Análise de Investimentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Ferramentas profissionais para análise de investimentos, com visualizações 
                      intuitivas e insights personalizados.
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="font-semibold mb-3">Educação Financeira</h3>
                    <p className="text-sm text-muted-foreground">
                      Conteúdo educativo integrado à plataforma, para ajudar os usuários a 
                      desenvolver habilidades financeiras enquanto utilizam a aplicação.
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <h3 className="font-semibold mb-3">Inteligência Artificial</h3>
                    <p className="text-sm text-muted-foreground">
                      Algoritmos de IA que analisam padrões de gastos e sugerem melhorias, 
                      além de recomendar investimentos baseados no perfil do usuário.
                    </p>
                  </div>
                </div>
              </section>

              <section id="arquitetura" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">4. Arquitetura da Plataforma</h2>
                <p>
                  Nossa plataforma foi construída com uma arquitetura moderna e escalável, utilizando 
                  as mais recentes tecnologias para garantir desempenho, segurança e usabilidade:
                </p>
                <ul className="space-y-2 mt-4">
                  <li>
                    <strong>Frontend responsivo:</strong> Utilizando React e Tailwind CSS para uma 
                    experiência fluida em qualquer dispositivo.
                  </li>
                  <li>
                    <strong>Backend robusto:</strong> APIs RESTful construídas com Node.js e Express, 
                    garantindo alta performance e escalabilidade.
                  </li>
                  <li>
                    <strong>Processamento em tempo real:</strong> Integração com APIs de mercado financeiro 
                    para dados de investimentos em tempo real.
                  </li>
                  <li>
                    <strong>Análise de dados:</strong> Algoritmos de processamento e análise de dados para 
                    gerar insights personalizados.
                  </li>
                </ul>
              </section>

              <section id="seguranca" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">5. Segurança e Privacidade</h2>
                <p>
                  A segurança e privacidade dos dados dos usuários são nossas maiores prioridades. 
                  Implementamos medidas rigorosas para proteger todas as informações:
                </p>
                <ul className="space-y-2 mt-4">
                  <li>
                    <strong>Criptografia de ponta a ponta:</strong> Todos os dados sensíveis são 
                    criptografados em trânsito e em repouso.
                  </li>
                  <li>
                    <strong>Autenticação em múltiplos fatores:</strong> Camada adicional de segurança 
                    para proteger o acesso às contas.
                  </li>
                  <li>
                    <strong>Conformidade com LGPD:</strong> Estrito cumprimento da Lei Geral de 
                    Proteção de Dados do Brasil.
                  </li>
                  <li>
                    <strong>Auditoria regular:</strong> Testes de penetração e auditorias de segurança 
                    realizados regularmente por empresas especializadas.
                  </li>
                </ul>
              </section>

              <section id="planos" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">6. Planos Futuros</h2>
                <p>
                  Nossa visão para o futuro da Organizesee inclui:
                </p>
                <ul className="space-y-2 mt-4">
                  <li>
                    <strong>Integração com instituições financeiras:</strong> Conexão direta com 
                    bancos e corretoras para importação automática de dados.
                  </li>
                  <li>
                    <strong>Marketplace de serviços financeiros:</strong> Plataforma para contratação 
                    de serviços financeiros personalizados.
                  </li>
                  <li>
                    <strong>Expansão internacional:</strong> Adaptação da plataforma para diferentes 
                    mercados e regulações.
                  </li>
                  <li>
                    <strong>Tecnologia blockchain:</strong> Implementação de soluções baseadas em 
                    blockchain para maior transparência e segurança.
                  </li>
                </ul>
              </section>

              <section id="conclusao" className="mt-10 scroll-mt-32">
                <h2 className="text-2xl font-bold mb-4">7. Conclusão</h2>
                <p>
                  A Organizesee está comprometida em transformar a maneira como as pessoas gerenciam 
                  suas finanças e investimentos, democratizando o acesso a ferramentas profissionais 
                  e simplificando conceitos complexos.
                </p>
                <p className="mt-4">
                  Acreditamos que todos devem ter acesso a ferramentas de qualidade para gerir seus 
                  recursos financeiros, independentemente de seu conhecimento prévio ou quantidade 
                  de recursos disponíveis.
                </p>
                <p className="mt-4">
                  Convidamos você a fazer parte desta revolução financeira e experimentar o poder de 
                  ter controle total sobre suas finanças pessoais.
                </p>
                <div className="mt-8 pt-4 border-t border-border">
                  <p className="text-center text-muted-foreground">
                    © 2023-2025 Organizesee. Todos os direitos reservados.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Download Button */}
      <div className="md:hidden fixed bottom-6 right-4 z-40">
        <a 
          href="https://bitcoin.org/files/bitcoin-paper/bitcoin_pt_br.pdf" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <Button className="flex items-center space-x-2 shadow-lg">
            <Download className="h-4 w-4" />
            <span>Baixar PDF</span>
          </Button>
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-6 h-6" />
              <span className="font-semibold">Organizesee</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Termos de Uso
              </Link>
              <p className="text-sm text-muted-foreground">
                © 2024 Organizesee. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
