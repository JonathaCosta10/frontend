# Correção de Erro do Rollup no Vercel

## Problema
Durante o deploy no Vercel, o processo de build estava falhando com um erro de módulo nativo do Rollup não encontrado:
```
Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
```

## Solução Implementada

1. **Criação de configuração específica para o Vercel**
   - Criado arquivo `vite.config.vercel.ts` com configurações simplificadas
   - Remoção do minificador Terser em favor do esbuild (não depende de módulos nativos)
   - Simplificação das configurações de chunking para evitar problemas

2. **Atualização de scripts de build**
   - Modificado o script `build` para usar a configuração específica do Vercel
   - Atualizado `build:vercel` para apontar para a mesma configuração

3. **Ajuste no arquivo vercel.json**
   - Configurado para usar o comando `npm run build` (que usa vite.config.vercel.ts)

4. **Adição de dependências opcionais**
   - Incluídas como optionalDependencies os módulos nativos do Rollup:
     - @rollup/rollup-linux-x64-gnu
     - @rollup/rollup-win32-x64-msvc

## Como funciona

Esta solução contorna o problema de duas maneiras:

1. Usando o minificador esbuild em vez do Terser, que não depende de módulos nativos do Rollup
2. Fornecendo as dependências nativas como opcionais, para que o npm tente instalá-las no ambiente do Vercel

## Testes Locais
O build local com a nova configuração foi testado e concluído com sucesso.

## Próximos Passos
1. Fazer commit das alterações
2. Enviar para o GitHub
3. Verificar se o deploy no Vercel é concluído com sucesso
