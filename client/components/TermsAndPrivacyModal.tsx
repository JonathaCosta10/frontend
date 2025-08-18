import { useState } from "react";
import { useTranslation } from "../contexts/TranslationContext";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface TermsAndPrivacyModalProps {
  triggerText: string;
  className?: string;
}

export function TermsAndPrivacyModal({ triggerText, className }: TermsAndPrivacyModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className={`p-0 h-auto text-primary underline ${className}`}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "terms" ? t("terms_of_service") : t("privacy_policy")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex space-x-4 mb-4">
          <Button
            variant={activeTab === "terms" ? "default" : "outline"}
            onClick={() => setActiveTab("terms")}
          >
            {t("terms_of_service")}
          </Button>
          <Button
            variant={activeTab === "privacy" ? "default" : "outline"}
            onClick={() => setActiveTab("privacy")}
          >
            {t("privacy_policy")}
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {activeTab === "terms" ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Termos de Uso</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium">1. Aceitação dos Termos</h3>
                  <p className="text-sm text-muted-foreground">
                    Ao utilizar nossa plataforma, você concorda em estar vinculado por estes Termos de Uso e todas as leis e regulamentos aplicáveis.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">2. Descrição do Serviço</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossa plataforma oferece ferramentas de gestão financeira pessoal, incluindo controle de orçamento, acompanhamento de investimentos e análises de mercado.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">3. Responsabilidades do Usuário</h3>
                  <p className="text-sm text-muted-foreground">
                    Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades que ocorrem em sua conta.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">4. Uso Aceitável</h3>
                  <p className="text-sm text-muted-foreground">
                    Você concorda em usar o serviço apenas para fins legais e de acordo com estes Termos de Uso.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">5. Propriedade Intelectual</h3>
                  <p className="text-sm text-muted-foreground">
                    Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones e software, é propriedade nossa e protegido por leis de direitos autorais.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">6. Limitação de Responsabilidade</h3>
                  <p className="text-sm text-muted-foreground">
                    Não seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar nosso serviço.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">7. Modificações</h3>
                  <p className="text-sm text-muted-foreground">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. As modificações entrarão em vigor imediatamente após a publicação.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">8. Encerramento</h3>
                  <p className="text-sm text-muted-foreground">
                    Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, por qualquer motivo.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">9. Lei Aplicável</h3>
                  <p className="text-sm text-muted-foreground">
                    Estes Termos de Uso são regidos pelas leis brasileiras.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">10. Contato</h3>
                  <p className="text-sm text-muted-foreground">
                    Para questões sobre estes Termos de Uso, entre em contato conosco através de nossos canais de suporte.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Política de Privacidade</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium">1. Informações que Coletamos</h3>
                  <p className="text-sm text-muted-foreground">
                    Coletamos informações que você nos fornece diretamente, como nome, e-mail, e dados financeiros quando você cria uma conta ou usa nossos serviços.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">2. Como Usamos suas Informações</h3>
                  <p className="text-sm text-muted-foreground">
                    Usamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações e comunicar com você.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">3. Compartilhamento de Informações</h3>
                  <p className="text-sm text-muted-foreground">
                    Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto conforme descrito nesta política.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">4. Segurança dos Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">5. Cookies e Tecnologias Similares</h3>
                  <p className="text-sm text-muted-foreground">
                    Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e personalizar conteúdo.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">6. Seus Direitos</h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem o direito de acessar, corrigir, excluir ou restringir o processamento de suas informações pessoais.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">7. Retenção de Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta política.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">8. Transferências Internacionais</h3>
                  <p className="text-sm text-muted-foreground">
                    Suas informações podem ser transferidas para países fora do Brasil, sempre com garantias adequadas de proteção.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">9. Alterações nesta Política</h3>
                  <p className="text-sm text-muted-foreground">
                    Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">10. Contato</h3>
                  <p className="text-sm text-muted-foreground">
                    Para questões sobre esta Política de Privacidade, entre em contato conosco através de nossos canais de suporte.
                  </p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
