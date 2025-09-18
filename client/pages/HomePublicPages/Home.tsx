import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Play,
  CheckCircle,
  LockKeyhole,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import PublicLayout from "@/components/PublicLayout";

export default function Home() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block">{t("Organize seu")}</span>
                  <span className="block text-blue-600 dark:text-blue-500">
                    {t("Futuro Financeiro")}
                  </span>
                </h1>
                <p className="mt-6 max-w-lg text-xl text-gray-500 dark:text-gray-400">
                  {t(
                    "Controle suas finanças pessoais e acompanhe seus investimentos em um único lugar, com ferramentas poderosas e intuitivas."
                  )}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="text-lg">
                    <Link to="/signup">{t("Comece Grátis")}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-lg"
                  >
                    <Link to="/demo" className="inline-flex items-center">
                      {t("Saiba Mais")} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-8">
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                    {t("Sem taxas ocultas")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="ml-2 px-3 py-1 text-sm"
                  >
                    <LockKeyhole className="mr-1 h-4 w-4 text-blue-500" />
                    {t("Segurança de dados")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="ml-2 px-3 py-1 text-sm"
                  >
                    <Shield className="mr-1 h-4 w-4 text-purple-500" />
                    {t("Proteção de privacidade")}
                  </Badge>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-w-5 aspect-h-3 lg:aspect-w-4 lg:aspect-h-3">
                  <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-1 shadow-2xl">
                    <div className="h-full w-full rounded-xl bg-white/20 p-4 backdrop-blur-sm">
                      <div className="flex h-full flex-col justify-between rounded-lg bg-white/80 p-6 dark:bg-gray-900/90">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {t("Resumo Financeiro")}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t("Receitas")}
                              </div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                R$ 5.240,00
                              </div>
                              <div className="mt-1 text-xs text-green-500 flex items-center">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                +8.2%
                              </div>
                            </div>
                            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t("Despesas")}
                              </div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                R$ 3.180,00
                              </div>
                              <div className="mt-1 text-xs text-red-500 flex items-center">
                                <TrendingUp className="mr-1 h-3 w-3 transform rotate-180" />
                                -12.4%
                              </div>
                            </div>
                          </div>
                          <div className="h-24 overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-2">
                            <div className="flex h-full items-end justify-around px-2">
                              {[0.4, 0.6, 0.5, 0.8, 0.6, 0.7, 0.9].map(
                                (height, i) => (
                                  <div
                                    key={i}
                                    className="w-6 rounded-t bg-gradient-to-t from-blue-500 to-indigo-500"
                                    style={{ height: `${height * 100}%` }}
                                  ></div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button asChild size="sm" className="text-xs">
                            <Link to="/login">
                              {t("Tenha sua Análise Completa")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 blur-3xl opacity-50"></div>
                <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 blur-3xl opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t("Tudo que você precisa para gerenciar suas finanças")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              {t(
                "Ferramentas poderosas que o ajudam a tomar decisões financeiras inteligentes"
              )}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="mb-4 h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">{t("Orçamento Inteligente")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    "Acompanhe seus gastos automaticamente, categorize transações e visualize para onde está indo seu dinheiro."
                  )}
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="mt-4 p-0 hover:bg-transparent"
                >
                  <Link to="/demo" className="flex items-center text-blue-600 dark:text-blue-400">
                    {t("Saiba mais")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="mb-4 h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">{t("Acompanhamento de Investimentos")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    "Visualize todos os seus investimentos em um só lugar, acompanhe o desempenho e receba análises personalizadas."
                  )}
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="mt-4 p-0 hover:bg-transparent"
                >
                  <Link to="/market" className="flex items-center text-green-600 dark:text-green-400">
                    {t("Explorar mercados")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="mb-4 h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">{t("Segurança Avançada")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    "Seus dados são protegidos com criptografia de nível bancário. Você mantém o controle completo das suas informações."
                  )}
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="mt-4 p-0 hover:bg-transparent"
                >
                  <Link to="/privacy-policy" className="flex items-center text-purple-600 dark:text-purple-400">
                    {t("Política de privacidade")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white dark:bg-gray-950 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t("Como funciona")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              {t("Simples de configurar, fácil de usar, poderoso em resultados")}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white">
                    1
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Crie uma conta")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    "Registre-se gratuitamente em menos de 2 minutos e acesse todas as ferramentas."
                  )}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white">
                    2
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Conecte suas contas")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    "Importe seus dados financeiros de forma segura ou adicione informações manualmente."
                  )}
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white">
                    3
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Tome melhores decisões")}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t(
                    "Visualize insights, defina metas e acompanhe seu progresso em tempo real."
                  )}
                </p>
              </div>
            </div>
            <div className="mt-16 flex justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link to="/signup">
                  <Play className="mr-2 h-5 w-5" />
                  {t("Comece agora")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t("O que nossos usuários dizem")}
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">Marcos S.</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t("Empresário")}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "{t(
                    "Finalmente consigo ter uma visão clara das minhas finanças pessoais e empresariais. A plataforma é intuitiva e os gráficos me ajudam a entender meus gastos rapidamente."
                  )}"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">Ana L.</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t("Investidora")}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "{t(
                    "Como investidora, eu precisava de uma ferramenta para acompanhar meu portfólio diversificado. Esta plataforma me dá exatamente isso, com análises detalhadas e atualizações em tempo real."
                  )}"
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">Renata C.</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{t("Profissional Liberal")}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "{t(
                    "Consegui economizar mais de 20% dos meus ganhos mensais desde que comecei a usar o sistema. As dicas personalizadas e o acompanhamento de metas fizeram toda a diferença."
                  )}"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t("Pronto para organizar suas finanças?")}
              </h2>
              <p className="mt-3 max-w-md text-lg text-blue-100">
                {t("Junte-se a milhares de pessoas que estão transformando sua relação com o dinheiro.")}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-yellow-400 text-gray-900 font-semibold hover:bg-yellow-500 shadow-lg">
                <Link to="/signup">{t("Criar conta grátis")}</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-gray-900 font-semibold hover:bg-gray-100 shadow-lg">
                <Link to="/demo">{t("Saber mais")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
