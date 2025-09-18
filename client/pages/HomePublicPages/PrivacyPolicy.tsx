import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="py-12 md:py-16 -mt-8">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Política de Privacidade
            </h1>
            <Badge variant="outline" className="mb-8">
              Atualizada em 16 de setembro de 2025
            </Badge>
            
            <Card className="max-w-3xl mx-auto mt-8 shadow-md overflow-hidden">
              <div className="bg-primary h-1 w-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-primary">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  A privacidade do usuário é prioridade no Organizesee. Coletamos apenas o mínimo necessário 
                  para que a plataforma funcione e não utilizamos seus dados para fins comerciais. 
                  Você mantém total controle sobre suas informações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-12">
          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Introdução</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base md:text-lg text-foreground">
                O Organizesee foi criado para ajudar você a organizar seu orçamento doméstico e seus investimentos, 
                não para coletar dados pessoais. Nosso compromisso é oferecer um ambiente seguro e transparente, 
                em que seus dados permanecem sob sua guarda.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Quais Dados Coletamos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-muted p-5 rounded-lg border border-border/50 hover:shadow-sm transition-shadow">
                  <h3 className="text-lg font-medium mb-3 text-primary">Cadastro e login</h3>
                  <p className="text-muted-foreground">Apenas as informações essenciais para criar e acessar sua conta (como e-mail e senha).</p>
                </div>
                
                <div className="bg-muted p-5 rounded-lg border border-border/50 hover:shadow-sm transition-shadow">
                  <h3 className="text-lg font-medium mb-3 text-primary">Preferências do usuário</h3>
                  <p className="text-muted-foreground">Configurações básicas para personalizar sua experiência na plataforma.</p>
                </div>
                
                <div className="bg-muted p-5 rounded-lg border border-border/50 hover:shadow-sm transition-shadow">
                  <h3 className="text-lg font-medium mb-3 text-primary">Dados de uso básicos</h3>
                  <p className="text-muted-foreground">Métricas anônimas, quando necessário, para melhorar a experiência da plataforma.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Como Usamos os Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 my-4">
                <li className="flex items-start bg-muted p-3 rounded-md">
                  <div className="bg-primary/20 rounded-full p-1 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <span>Fornecer e manter os serviços da plataforma.</span>
                </li>
                <li className="flex items-start bg-muted p-3 rounded-md">
                  <div className="bg-primary/20 rounded-full p-1 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <span>Garantir a segurança da sua conta.</span>
                </li>
                <li className="flex items-start bg-muted p-3 rounded-md">
                  <div className="bg-primary/20 rounded-full p-1 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <span>Melhorar funcionalidades com base em estatísticas agregadas e anônimas.</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded-lg text-center">
                <p className="font-medium">
                  Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros sem seu consentimento expresso.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-6 mt-2">
                <div className="flex-1">
                  <p className="text-base md:text-lg">
                    Adotamos medidas técnicas e organizacionais para proteger seus dados. Além disso, como armazenamos 
                    o mínimo possível, o risco de qualquer incidente é significativamente reduzido.
                  </p>
                </div>
                <div className="flex-shrink-0 flex justify-center">
                  <div className="bg-primary/10 p-6 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Seus Direitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-4">Você tem o direito de:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="border border-primary/20 bg-card p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <div className="text-primary font-medium">Acessar</div>
                  <p className="text-xs text-muted-foreground mt-1">Revisar suas informações</p>
                </div>
                
                <div className="border border-primary/20 bg-card p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </div>
                  <div className="text-primary font-medium">Corrigir</div>
                  <p className="text-xs text-muted-foreground mt-1">Modificar dados imprecisos</p>
                </div>
                
                <div className="border border-primary/20 bg-card p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </div>
                  <div className="text-primary font-medium">Excluir</div>
                  <p className="text-xs text-muted-foreground mt-1">Remover seus dados</p>
                </div>
                
                <div className="border border-primary/20 bg-card p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="text-primary font-medium">Retirar consentimento</div>
                  <p className="text-xs text-muted-foreground mt-1">Cancelar permissões</p>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-muted rounded-lg text-center">
                <p>
                  Entre em contato pelo e-mail <a href="mailto:privacidade@organizesee.com.br" className="text-primary hover:underline font-medium">privacidade@organizesee.com.br</a> para exercer esses direitos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md overflow-hidden">
            <div className="bg-primary h-1 w-full"></div>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Atualizações desta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted p-5 rounded-lg">
                <p className="text-base md:text-lg max-w-xl">
                  Podemos atualizar esta política para refletir melhorias na plataforma ou mudanças legais. Sempre que houver alterações relevantes, informaremos por meio do site.
                </p>
                <div className="flex-shrink-0 text-primary">
                  <Badge variant="outline" className="text-sm px-3 py-1 bg-primary/5 border-primary/20">
                    Versão atual: 16/09/2025
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato - Card com destaque */}
          <Card className="shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Entre em contato</h2>
                  <p className="text-white/90 mb-4">
                    Para exercer seus direitos ou esclarecer dúvidas, envie um e-mail para:
                  </p>
                  <a href="mailto:privacidade@organizesee.com.br" 
                     className="inline-flex items-center px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors">
                    privacidade@organizesee.com.br
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Call to Action */}
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <div className="bg-card border border-border/30 rounded-xl shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Você está no controle</h3>
              <p className="text-muted-foreground mt-2">
                O Organizesee foi projetado para priorizar sua privacidade e segurança de dados
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link to="/about">Saiba mais</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/signup">Criar Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
