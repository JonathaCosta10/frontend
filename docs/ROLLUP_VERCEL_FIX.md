# Correção de Erros de Módulos Nativos no Vercel

## Problemas Encontrados
Durante o deploy no Vercel, o processo de build estava falhando com vários erros de módulos nativos:

1. Erro no Rollup:
```
Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
```

2. Erro no SWC:
```
Error: Failed to load native binding
```

## Solução Implementada

1. **Criação de configuração ultra-simplificada para o Vercel**
   - Usando arquivo `vite.config.simple.ts` com configurações mínimas
   - Substituição do plugin react-swc pelo plugin react padrão (sem dependências nativas)
   - Desativação completa de minificação para evitar problemas com módulos nativos
   - Remoção do chunking manual para simplificar a build

2. **Atualização de scripts de build**
   - Modificado o script `build` para usar a configuração ultra-simplificada
   - Atualizado `build:vercel` para apontar para a mesma configuração

3. **Ajuste no arquivo vercel.json**
   - Configurado para usar o comando `npm run build` (que usa vite.config.simple.ts)

4. **Mudanças nas ferramentas de build**:
   - Substituição do plugin react-swc pelo plugin react padrão (sem SWC)
   - Desativação completa da minificação de JavaScript e CSS
   - Remoção de configurações avançadas que podem depender de módulos nativos

## Como funciona

Esta solução contorna o problema através de uma abordagem de "minimal build":

1. Eliminando todas as ferramentas que dependem de módulos nativos (SWC, Terser)
2. Desativando completamente a minificação para evitar dependências de módulos nativos
3. Usando o plugin React vanilla em vez do plugin baseado em SWC
4. Eliminando o chunking manual que pode causar problemas no Vercel

## Impacto no Desempenho

Esta abordagem prioriza a compatibilidade sobre o desempenho:

- O bundle final será maior por não ser minificado
- Os tempos de carregamento podem ser um pouco mais lentos
- O código não será tão otimizado quanto em uma build totalmente minificada

No entanto, essas desvantagens são aceitáveis para garantir que o deploy no Vercel funcione corretamente. Depois que o site estiver no ar, podemos investigar soluções mais otimizadas.

## Próximos Passos
1. Testar esta configuração ultra-simplificada no Vercel
2. Se funcionar, considerar gradualmente reintroduzir otimizações, testando uma a uma
3. Investigar alternativas para ferramentas que dependem de módulos nativos
