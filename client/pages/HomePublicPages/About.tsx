import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import PublicLayout from "@/components/PublicLayout";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Main Content */}
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Sobre o Organizesee
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma desenvolvida por um desenvolvedor independente para organizar 
            informações financeiras e ajudar nas decisões de investimento.
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Nossa Missão</h2>
          <p>
            O Organizesee nasceu da necessidade de centralizar e organizar informações 
            financeiras que estão dispersas em várias fontes. Como desenvolvedor independente, 
            percebi a dificuldade de acompanhar meus próprios investimentos e decidi criar 
            uma ferramenta que pudesse ajudar não apenas a mim, mas a todos que enfrentam 
            o mesmo desafio.
          </p>

          <h2>O Que Fazemos</h2>
          <p>
            Coletamos dados disponíveis publicamente sobre investimentos, organizamos essas 
            informações de maneira intuitiva e apresentamos análises que ajudam você a tomar 
            decisões mais informadas. Nossa plataforma não oferece recomendações de investimento, 
            mas sim ferramentas para que você possa fazer suas próprias análises.
          </p>

          <h2>Desenvolvimento Independente</h2>
          <p>
            O Organizesee é desenvolvido por uma única pessoa, com foco na qualidade e na 
            usabilidade. Isso significa que cada recurso é cuidadosamente pensado e implementado, 
            sem pressões corporativas ou compromissos com terceiros. Nossa prioridade é atender 
            às necessidades reais dos investidores individuais.
          </p>

          <h2>Transparência</h2>
          <p>
            Acreditamos na transparência total sobre como coletamos, armazenamos e utilizamos 
            dados. Não vendemos suas informações e não compartilhamos seus dados com terceiros 
            sem seu consentimento explícito. Você mantém o controle total sobre seus dados 
            em nossa plataforma.
          </p>

          <h2>Comunidade</h2>
          <p>
            Valorizamos o feedback dos usuários e estamos constantemente aprimorando nossa 
            plataforma com base nas suas sugestões. Nossa comunidade de investidores é fundamental 
            para o crescimento e a evolução do Organizesee.
          </p>

          <h2>Contato</h2>
          <p>
            Se você tiver dúvidas, sugestões ou quiser conversar sobre a plataforma, 
            entre em contato através do nosso formulário de suporte ou diretamente pelo email 
            contato@organizesee.com.br.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
