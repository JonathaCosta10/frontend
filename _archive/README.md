# Arquivo de Versões Obsoletas

Esta pasta contém arquivos que não são mais utilizados no projeto principal, mas foram mantidos para referência histórica.

## Estrutura

### `app-versions/`
Contém diferentes versões do componente principal App.tsx que foram criadas durante o desenvolvimento:
- `App.balanced.tsx` - Versão com balanceamento de carga
- `App.current.tsx` - Versão marcada como "atual" em algum momento
- `App.debug.tsx` - Versão com logs de debug
- `App.extreme.tsx` - Versão com otimizações extremas
- `App.lazy.tsx` - Versão com lazy loading
- `App.minimal-entry.tsx` - Versão com entry point mínimo
- `App.minimal.tsx` - Versão minimalista
- `App.new.tsx` - Nova versão em desenvolvimento
- `App.old.tsx` - Versão antiga
- `AppCore.tsx` - Componente core separado
- `AppRouter.tsx` - Router separado
- `AppRoutes.tsx` - Rotas separadas

### `components-versions/`
Contém diferentes versões de componentes que foram criadas durante iterações:
- `GoogleOAuthCallback.backup.tsx` - Backup do callback OAuth
- `GoogleOAuthCallback.new.tsx` - Nova versão do callback OAuth
- `GoogleOAuthCallbackSimple.tsx` - Versão simplificada
- `GoogleOAuthCallbackFixed.tsx` - Versão com correções
- `GoogleOAuthCallbackFinal.tsx` - Versão final anterior
- `GoogleOAuthCallbackUltimate.tsx` - Versão definitiva anterior

### `pages-versions/orcamento/`
Contém versões antigas das páginas de orçamento:
- `custos-new.tsx` - Nova versão da página de custos
- `custos.tsx.new` - Outra nova versão
- `custos.tsx.temp` - Versão temporária
- `custos.tsx.fixed` - Versão com correções
- `custos_temp.tsx` - Arquivo temporário
- `custos-updated.tsx` - Versão atualizada
- `entradas_fixed.tsx` - Versão corrigida das entradas
- `entradas-updated.tsx` - Versão atualizada das entradas
- `dividas-updated.tsx` - Versão atualizada das dívidas

### `vite-configs/`
Contém diferentes configurações do Vite que foram testadas:
- `vite.config.dev.ts` - Configuração para desenvolvimento
- `vite.config.extreme.ts` - Configuração com otimizações extremas
- `vite.config.focused.ts` - Configuração focada
- `vite.config.maximum.ts` - Configuração máxima
- `vite.config.minimal.ts` - Configuração mínima
- `vite.config.simple.ts` - Configuração simples
- `vite.config.ultra-simple.ts` - Configuração ultra simples
- `vite.config.ultra.backup.ts` - Backup da configuração ultra
- `vite.config.vercel-fix-new.ts` - Nova correção para Vercel
- `vite.config.vercel-fix.ts` - Correção para Vercel

### `hooks-versions/`
Contém versões antigas de hooks personalizados:
- `useTutorialManager.ts.new` - Nova versão do hook de tutorial
- `useProfileVerification_fixed.ts` - Hook de verificação corrigido

### `lib-versions/`
Contém versões antigas de bibliotecas e utilitários:
- `api.ts.backup` - Backup da API principal
- `api.ts.fixed` - Versão corrigida da API
- `marketInsights_fixed.ts` - Insights de mercado corrigidos

### `contexts-versions/`
Contém versões antigas de contextos React:
- `ResponseParms_NEW.ts` - Nova versão dos parâmetros de resposta
- `TranslationContext.backup.tsx` - Backup do contexto de tradução

### `config-versions/`
Contém versões antigas de configurações:
- `development-new.ts` - Nova configuração de desenvolvimento
- `development-mock.ts` - Configuração com mocks

### `scripts-versions/`
Contém versões antigas de scripts:
- `set-environment-fixed.ps1` - Script de ambiente corrigido
- `set-environment-simple.ps1` - Script de ambiente simplificado
- `set-environment-clean.ps1` - Script de ambiente limpo

### `charts-versions/`
Contém versões antigas de componentes de gráficos:
- `MetaRealidadeChart_new.tsx` - Nova versão do gráfico de metas

### `pages-versions/home-public/`
Contém versões antigas das páginas públicas:
- `Home.tsx.old` - Versão antiga da página inicial
- `Home.tsx.new` - Nova versão da página inicial
- `Market.tsx.old` - Versão antiga da página de mercado
- `Market.tsx.new` - Nova versão da página de mercado
- `Demo.tsx.new` - Nova versão da página de demo
- `CriptoMarket.tsx.new` - Nova versão da página de cripto
- `Terms.tsx.new` - Nova versão dos termos
- `PrivacyPolicy.tsx.new` - Nova versão da política de privacidade
- `Whitepaper.tsx.new` - Nova versão do whitepaper

### `pages-versions/mercado/`
Contém versões antigas das páginas de mercado:
- `analise-ticker-fii-new.tsx` - Nova análise de FII
- `analise-ticker-acoes-new.tsx` - Nova análise de ações

### `pages-versions/` (outros)
Contém outras páginas com versões:
- `MarketPage_NEW.tsx` - Nova página de mercado
- `MarketPage_BROKEN.tsx` - Página de mercado quebrada
- `perfil_new.tsx` - Nova página de perfil
- `analise-ticker.backup.tsx` - Backup da análise de ticker

## Arquivos Ativos no Projeto

### Principais em uso:
- `client/App.tsx` - Componente principal da aplicação
- `client/main.tsx` - Entry point da aplicação
- `client/components/GoogleOAuthCallback.tsx` - Callback OAuth ativo
- `client/pages/sistema/dashboard/orcamento/custos.tsx` - Página de custos ativa
- `client/pages/sistema/dashboard/orcamento/entradas.tsx` - Página de entradas ativa
- `client/pages/sistema/dashboard/orcamento/dividas.tsx` - Página de dívidas ativa
- `vite.config.ts` - Configuração principal do Vite
- `vite.config.prod.ts` - Configuração de produção
- `vite.config.ultra.ts` - Configuração ultra otimizada
- `vite.config.vercel.ts` - Configuração para Vercel

## Como Usar

Se precisar referenciar alguma implementação anterior, consulte os arquivos nesta pasta. 
**NÃO** mova arquivos desta pasta de volta para o projeto sem antes verificar as dependências e compatibilidade.

## Limpeza Realizada em

Data: 15 de outubro de 2025
Responsável: Organização automática para reduzir complexidade do projeto

## Nota Importante

Estes arquivos podem ser removidos permanentemente após um período de estabilidade do projeto (recomendado: 30-60 dias).