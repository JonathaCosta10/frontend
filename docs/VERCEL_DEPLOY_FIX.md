# Solução para Deploy no Vercel

## Problema
O deploy no Vercel estava falhando com vários erros relacionados a módulos nativos:
1. Erro ao carregar `@rollup/rollup-linux-x64-gnu`
2. Erro ao carregar bindings nativos do SWC
3. Erro ao encontrar `@esbuild/linux-x64`
4. Erro "vite: command not found"

## Solução

### 1. Configuração Simplificada do Vite
Foi criado um arquivo `vite.config.simple.ts` que:
- Usa o plugin React padrão em vez do SWC (que depende de binários nativos)
- Desativa a minificação (evita dependência do Terser e ESBuild)
- Simplifica as configurações do Rollup para evitar problemas com módulos nativos

### 2. Scripts de Build Personalizados
- Criado script `vercel.build.sh` para gerenciar o processo de build no Vercel
- Criado `vercel-check.js` para verificar e instalar dependências críticas
- Atualizado `vercel.json` para usar esses scripts personalizados

### 3. Ajustes no package.json
- Movido `vite` das devDependencies para dependencies
- Adicionado script postinstall para garantir que o Vite seja instalado
- Adicionadas dependências opcionais para módulos nativos do Rollup

### 4. Configurações NPM
- Atualizado `.npmrc` para garantir que dependências opcionais sejam instaladas
- Aumentado timeout de rede para dar mais tempo para downloads

## Testes
- O build com a configuração simplificada foi testado localmente e funciona corretamente
- A configuração evita completamente dependências de módulos nativos que causam problemas no Vercel

## Notas Importantes
Esta solução prioriza a funcionalidade sobre a otimização. O arquivo de bundle resultante não será minificado para evitar dependências problemáticas. Esta é uma solução temporária até que possamos investigar uma configuração melhor para o Vercel.
