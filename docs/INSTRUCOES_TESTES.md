# Instruções para Testes das Modificações UI

Este documento contém instruções detalhadas para testar todas as modificações implementadas na interface do usuário do projeto OrganizeSee.

## 1. Página de Dívidas

### Verificar Alterações de Labels:
- [ ] O título do formulário mostra apenas "Cadastrar - Empréstimo" (sem o símbolo "$")
- [ ] Os campos não mostram asteriscos "*" desnecessários
- [ ] Campo "Valor Mensal" agora mostra "Valor Mensal (R$)"
- [ ] Campo "Valor Total" agora mostra "Valor Total (R$)"
- [ ] O campo anteriormente com label "Ex:12" agora mostra "Parcelas"
- [ ] Campo "Taxa de juros anual" foi alterado para "Taxa de juros real (CET)"

### Testar Funcionalidades:
- [ ] Ao passar o mouse sobre o campo "Taxa de juros real (CET)", um tooltip explicativo deve aparecer
- [ ] Após adicionar uma dívida, ao abrir o formulário novamente, o botão "Repetir" deve estar presente
- [ ] Ao clicar no botão "Repetir", os campos devem ser preenchidos com os dados da última dívida cadastrada
- [ ] Após cadastrar, uma mensagem de sucesso deve aparecer na lateral (não no topo da página)

## 2. Página de Custos

### Verificar Comportamento:
- [ ] Cadastre um custo fixo e confirme que o parâmetro `flag=true` está sendo mantido
- [ ] Verifique que os custos fixos estão sendo exibidos corretamente na listagem

## 3. Página de Entradas

### Verificar Traduções:
- [ ] Na seleção de categoria, a opção antes mostrada como "Other" agora deve mostrar "Outros"

## 4. Sidebar de Navegação

### Verificar Labels:
- [ ] No menu lateral, o item anteriormente rotulado como "Investimentos" agora deve mostrar "Renda Variável"
- [ ] Trocar de idioma (se disponível) para verificar se a tradução está correta em outros idiomas

## 5. Página de Cadastro de Investimentos

### Verificar Labels e Funcionalidades:
- [ ] Campo "Valor Unitário (R$)" agora deve mostrar "Preço Médio (R$)"
- [ ] Deve haver um botão "Hoje" próximo ao campo de data de compra
- [ ] Clicar no botão "Hoje" deve preencher o campo de data com a data atual

## 6. Visualização de Investimentos

### Verificar o Gráfico de Pizza:
- [ ] Na página de investimentos deve aparecer um gráfico de pizza mostrando a alocação por tipo
- [ ] Ações devem aparecer como "Ação" (não como "ACAO")
- [ ] Fundos Imobiliários devem aparecer como "Fundos Imobiliários" (não como "FII")
- [ ] Ao passar o mouse sobre os segmentos do gráfico, deve aparecer um tooltip com os valores

### Verificar a Legenda:
- [ ] A legenda do gráfico deve estar organizada de maneira compacta
- [ ] Cada item da legenda deve mostrar o tipo de investimento e seu percentual
- [ ] As cores na legenda devem corresponder às cores no gráfico

## 7. Layout Responsivo

### Testar em Diferentes Tamanhos de Tela:
- [ ] Verificar se o gráfico de pizza e a legenda se adaptam bem em telas maiores
- [ ] Verificar se o layout permanece funcional em telas menores
- [ ] Em dispositivos móveis, todos os elementos devem estar visíveis e utilizáveis

## 8. Navegação entre Páginas

- [ ] Verificar se a navegação para a página de investimentos pelo sidebar funciona corretamente
- [ ] Garantir que todas as páginas estão carregando os dados corretamente após as modificações

## Relatório de Testes:

Para cada item testado, documente:
1. Status (Aprovado/Reprovado)
2. Comentários ou problemas encontrados
3. Screenshots (se aplicável para problemas visuais)

Caso encontre problemas, por favor forneça:
- Descrição detalhada
- Passos para reproduzir
- Comportamento esperado vs. comportamento observado
