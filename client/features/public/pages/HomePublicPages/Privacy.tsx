import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from '../../../../contexts/TranslationContext';
import PublicLayout from "@/features/public/components/PublicLayout";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              (Atualizada em 16 de Setembro de 2025)
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-muted p-6 rounded-lg border border-border mb-8">
              <h2 className="text-xl font-bold mb-2">Em resumo:</h2>
              <p className="text-lg mb-0">
                Não temos acesso aos seus dados por pura preguiça. Você não é tão importante assim, 
                nem está me dando dinheiro suficiente para eu me importar com seus dados pessoais. 
                Sua privacidade é total - não porque nos importamos tanto, mas porque realmente 
                não nos importamos o suficiente para extrair.
              </p>
            </div>
            
            <h2>Introdução Sincera</h2>
            <p>
              Vamos ser diretos: desenvolver esta plataforma já dá trabalho suficiente. 
              Coletar, armazenar e analisar seus dados seria um esforço adicional que, 
              francamente, não temos interesse em fazer. Você pode usar nossa plataforma 
              com a tranquilidade de saber que sua privacidade está protegida pela nossa 
              indiferença benevolente.
            </p>

            <h2>Dados Que Coletamos (ou Não)</h2>
            <p>
              • O mínimo possível para fazer o login funcionar<br />
              • Suas informações financeiras ficam no seu navegador<br />
              • Não rastreamos seus hábitos de navegação - seria trabalhoso demais<br />
              • Não vendemos seus dados - porque nem os temos direito
            </p>

            <h2>Por Que Isso É Bom Para Você</h2>
            <p>
              Em um mundo onde todo mundo quer seus dados, oferecemos algo refrescante: 
              desinteresse total pelas suas informações pessoais. Nós desenvolvemos ferramentas 
              úteis para você organizar sua vida financeira, mas o que você faz com elas é 
              problema seu. Consideramos isso uma forma de respeito à sua privacidade.
            </p>

            <h2>Segurança Por Simplicidade</h2>
            <p>
              Nossa abordagem de segurança é simples: quanto menos dados coletamos, menos 
              riscos de vazamento. Não podemos perder o que não temos. Se acontecer alguma 
              invasão ao nosso sistema, o hacker provavelmente sairá desapontado com a falta 
              de informações valiosas.
            </p>

            <h2>Seus Direitos</h2>
            <p>
              Você tem o direito de saber que não sabemos quase nada sobre você. Se quiser 
              confirmar isso, pode solicitar todos os dados que temos sobre você - provavelmente 
              será um arquivo bem pequeno. Você também tem o direito de ser esquecido, o que 
              neste caso é bastante fácil, já que quase nem nos lembramos de você para começar.
            </p>

            <h2>Atualizações desta Política</h2>
            <p>
              Podemos atualizar esta política quando tivermos energia suficiente para isso. 
              Se isso acontecer, será provavelmente para torná-la ainda mais descontraída e 
              menos invasiva, se é que isso é possível.
            </p>

            <h2>Contato</h2>
            <p>
              Se tiver dúvidas sobre esta política de privacidade ou quiser confirmar nosso 
              desinteresse pelos seus dados, entre em contato através do email 
              privacidade@organizesee.com.br. Responderemos quando tivermos tempo, 
              provavelmente com uma mensagem igualmente descontraída.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
