# Correção de Erro do esbuild no Vercel

## Problema
Após resolver o problema com o Rollup, encontramos outro erro com o esbuild:
```
Error: The package "@esbuild/linux-x64" could not be found, and is needed by esbuild.
```

## Solução Implementada

1. **Simplificação Completa da Configuração do Vite**
   - Atualizado o arquivo `vite.config.simple.ts` para:
     - Remover qualquer dependência do `createESModulesFixPlugin`
     - Usar o plugin react padrão sem SWC
     - Definir JSX runtime para 'classic' para evitar dependências de transformadores
     - Desativar completamente a minificação
     - Evitar configurações que possam usar esbuild internamente

2. **Adição de Todas as Dependências Nativas como Opcionais**
   - Adicionado ao package.json como optionalDependencies:
     - @esbuild/linux-x64
     - @esbuild/win32-x64
     - @swc/core-linux-x64-gnu
     - @swc/core-win32-x64-msvc
     - (Além das dependências do Rollup que já tínhamos adicionado)

3. **Configuração do NPM para Garantir Instalação de Dependências Opcionais**
   - Atualizado o arquivo `.npmrc` para:
     - Definir `optional=true` para garantir que dependências opcionais sejam instaladas
     - Aumentar o timeout de rede para dar tempo de baixar os binários nativos

## Como Funciona
Esta solução contorna os problemas de dependências nativas no ambiente do Vercel de três maneiras:

1. Evitando completamente o uso de recursos que dependem de módulos nativos
2. Fornecendo as dependências nativas como opcionais para que o npm tente instalá-las
3. Configurando o NPM para garantir que ele tente instalar essas dependências

## Testes Locais
O build local com a configuração simplificada foi testado e concluído com sucesso.

## Próximos Passos
1. Fazer commit das alterações
2. Enviar para o GitHub
3. Verificar se o deploy no Vercel é concluído com sucesso

## Observações
- O build resultante não será otimizado (sem minificação, sem tree-shaking), mas será funcional
- Em uma etapa futura, podemos investigar como reabilitar algumas dessas otimizações de forma seletiva
- Esta é uma solução temporária até que possamos configurar corretamente o ambiente do Vercel para suportar módulos nativos
