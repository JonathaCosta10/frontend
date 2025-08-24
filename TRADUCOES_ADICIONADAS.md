# Modificações nas Traduções

Esta modificação adiciona a chave de tradução `variable_income` no contexto de traduções para suportar a mudança no sidebar de "Investimentos" para "Renda Variável".

## Arquivo: client/contexts/TranslationContext.tsx

```tsx
// Adicionar nas traduções em português (pt-BR)
variable_income: "Renda Variável",

// Adicionar nas traduções em inglês (en-US) se existirem
variable_income: "Variable Income",

// Adicionar nas traduções em espanhol (es) se existirem
variable_income: "Renta Variable",
```

Esta nova chave será usada pelo DashboardSidebar.tsx que já foi modificado para utilizar `labelKey: "variable_income"` ao invés de `investment_portfolio`.

## Testes Recomendados

1. Verificar se a sidebar exibe corretamente "Renda Variável" no lugar de "Investimentos"
2. Verificar se a troca de idioma altera corretamente este texto para os idiomas disponíveis
3. Verificar se o link ainda direciona para a página de investimentos correta
