# Configuração de Build para Vercel

## Resumo das Alterações

Para resolver problemas de compatibilidade com ES Modules durante o deploy no Vercel, foram realizadas as seguintes alterações:

1. Configuração específica no `vercel.json`:
   - Adicionado `buildCommand` específico para usar a configuração de produção
   - Configurado para usar o script `build:vercel` que usa `vite.config.prod.ts`

2. Modificação no `package.json`:
   - Script `build:vercel` atualizado para usar a configuração de produção
   - Garantia de que as configurações de produção incluem o plugin `ESModulesFix`

3. Arquivos de redirecionamento:
   - Adicionado `_redirects` para configuração SPA no Netlify
   - Adicionado `vercel.json` na pasta public para configuração de rotas SPA

4. Plugin ESModulesFix:
   - Uso consistente do plugin tanto no ambiente de desenvolvimento quanto de produção
   - Configurado para resolver problemas específicos com `react-is` e `eventemitter3`

## Como testar o deploy

Para testar localmente antes de enviar ao Vercel:

```bash
npm run build:vercel
npx serve dist
```

## Possíveis problemas e soluções

Se ocorrerem erros de ES modules:
- Verifique se o plugin `ESModulesFix` está sendo carregado corretamente
- Certifique-se de que os polyfills para `react-is` e `eventemitter3` estão disponíveis

Se ocorrerem problemas com rotas:
- Verifique a configuração de redirecionamento no `vercel.json`
- Certifique-se de que todas as rotas estão sendo direcionadas para `index.html`
