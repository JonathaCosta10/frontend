# Correção de Rentabilidade na Página de Investimentos

## Problema
O valor da rentabilidade na página https://www.organizesee.com.br/dashboard/investimentos estava sendo exibido como um valor fixo (+8.5%) em vez de ser calculado dinamicamente com base nos valores reais da carteira.

## Solução Implementada
1. Criado um novo arquivo `index-prod.tsx` na pasta `client/pages/sistema/dashboard/investimentos/` que contém a versão corrigida da página de investimentos.
2. Modificado o `App.tsx` para importar este novo arquivo em vez do arquivo original.
3. Implementada a lógica de cálculo da rentabilidade com base nos valores reais da carteira:
   ```typescript
   rentabilidade = ((valorAtual - valorInvestido) / valorInvestido) * 100
   ```

## Instruções para Deploy
1. Certifique-se de fazer build e deploy da nova versão para garantir que as alterações sejam aplicadas.
2. Execute o comando `npm run prod:prepare` para preparar o build para produção.
3. Verifique o Netlify para confirmar que o deploy foi concluído com sucesso.
4. Após verificar que a correção está funcionando em produção, você pode remover este arquivo de marcação e unificar as implementações.

## Observações
- É possível que haja problemas de cache no Netlify após o deploy. Se necessário, force uma limpeza de cache.
- Se o problema persistir, verifique se não há alguma configuração específica no servidor de produção que esteja substituindo este arquivo.

Data da Correção: 14 de agosto de 2025
