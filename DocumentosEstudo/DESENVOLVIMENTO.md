# Configuração de Desenvolvimento

## Modo Mock Data

Por padrão, a aplicação está configurada para usar dados fictícios (mock data) quando o backend não estiver disponível. Isso permite desenvolvimento frontend sem dependência do backend.

### Variáveis de Ambiente

- `VITE_USE_REAL_APIS=false` - Usa dados mock (padrão para desenvolvimento)
- `VITE_USE_REAL_APIS=true` - Tenta usar APIs reais do backend
- `VITE_BACKEND_URL=http://127.0.0.1:8000` - URL do backend
- `VITE_API_KEY=minha-chave-secreta` - Chave da API

### Como Alternar Entre Mock e APIs Reais

1. **Para usar dados mock (recomendado para desenvolvimento frontend):**
   ```bash
   # No dev server, a variável já está configurada como false
   VITE_USE_REAL_APIS=false
   ```

2. **Para usar APIs reais (quando backend estiver rodando):**
   ```bash
   # Configure para true quando o backend estiver disponível
   VITE_USE_REAL_APIS=true
   ```

### Estrutura de APIs

```
client/services/api/
├── budget.ts          # APIs de orçamento
├── investments.ts     # APIs de investimentos  
├── auth.ts           # APIs de autenticação
└── index.ts          # Exportações centralizadas
```

### Dados Mock Disponíveis

#### Budget API
- `getVariacaoEntrada()` - Dados de entrada dos últimos 6 meses
- `getDistribuicaoGastos()` - Distribuição por categoria de gastos
- `getBudgetOverview()` - Resumo completo do orçamento

#### Investments API
- `getAlocacaoTipo()` - Alocação por tipo (Ações, FIIs, Renda Fixa)
- `getSetores()` - Distribuição setorial
- `getDividendosFII()` - Histórico de dividendos

### Logs de Desenvolvimento

Quando `VITE_USE_REAL_APIS=false`, você verá logs no console indicando que dados mock estão sendo usados:

```
Usando dados mock para variação de entrada
Usando dados mock para distribuição de gastos
Usando dados mock para budget overview
```

### Simulação de Delay

Para simular latência de rede real, os dados mock incluem delays artificiais:
- Chamadas rápidas: 200ms
- Chamadas complexas: 300ms

### Estrutura de Páginas

```
client/pages/
├── HomePublicPages/    # Páginas públicas (sem autenticação)
│   ├── Home.tsx
│   ├── Demo.tsx
│   └── ...
├── Sistema/           # Páginas do sistema (protegidas)
│   ├── Budget.tsx
│   ├── Investment.tsx
│   └── ...
└── [auth pages]       # Login, Signup, etc.
```

### Proteção de Autenticação

Atualmente **DESABILITADA** para facilitar desenvolvimento:
- `developmentConfig.skipAuthentication = true`
- Para reabilitar, altere para `false` em `client/config/development.ts`

### Como Testar

1. **Desenvolvimento Frontend (modo atual):**
   - Todos os dados são mock
   - Não requer backend rodando
   - Carregamento rápido com delays simulados

2. **Teste com Backend:**
   - Configure `VITE_USE_REAL_APIS=true`
   - Certifique-se que o backend está rodando em `http://127.0.0.1:8000`
   - APIs reais são chamadas com fallback para mock em caso de erro

### Troubleshooting

**Erro "Failed to fetch":**
- ✅ **Resolvido**: APIs agora usam dados mock por padrão
- Se ocorrer, verifique se `VITE_USE_REAL_APIS=false`

**Dados não carregam:**
- Verifique o console para logs de mock data
- Confirme que o dev server foi reiniciado após mudanças de ambiente

**Performance lenta:**
- Reduza `mockApiDelay` em `client/config/development.ts`
