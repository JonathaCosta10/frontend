# Diagnóstico de Chamadas API - Info Diária

## Problema Identificado
As chamadas para "Índices e Mercado" (`/api/infodaily/`) e "Insights de Mercado" (`/api/insights-mercado/`) não estão sendo executadas automaticamente na página `info-diaria.tsx`.

## Testes Realizados

### 1. Endpoint Backend
✅ **Status**: Funcionando
- URL: `http://127.0.0.1:8000/api/infodaily/`
- Requer: API Key + Token de autenticação
- Erro sem auth: `{"detail":"Authentication credentials were not provided."}`

### 2. Configuração do Sistema

#### Arquivo `Rules.ts`:
✅ **Mapeamento correto**:
- `infodaily` → `InfoDaily` (serviço)
- `marketInsights` → `InfoDaily` (serviço)

#### Arquivo `Rotas.ts`:
✅ **Endpoints configurados**:
- `infodaily`: `/api/infodaily/`
- `marketInsights`: `/api/insights-mercado/`

#### Arquivo `InfoDaily.js`:
✅ **Serviço implementado com logs detalhados**

## Debugging Implementado

### Logs Adicionados:
1. **Rules.ts**: Logs completos do processo de importação e execução
2. **InfoDaily.js**: Logs detalhados das requisições HTTP
3. **info-diaria.tsx**: Logs do ciclo de vida dos useEffect

### Botões de Teste:
Adicionados botões "Test Índices" e "Test Insights" no header da página para forçar chamadas manuais.

## Como Diagnosticar

### 1. Abrir DevTools
```bash
F12 → Console
```

### 2. Recarregar Página
```
Ctrl + F5
```

### 3. Verificar Logs Sequenciais
Procurar por estas mensagens em ordem:

```
🚀 INFO-DIARIA - useEffect executado
👤 Usuário logado: true
🔑 Token no localStorage: true
🔄 Iniciando chamadas de dados...
⏰ Timeout executado - fazendo chamadas agora
🔄 Buscando dados dos índices de mercado via Rules...
🔍 Rules GET chamado para chave: infodaily
🔍 Buscando serviço de API para chave: infodaily
📁 Tipo de página: Privada
📄 Arquivo de serviço: InfoDaily
📥 Tentando importar serviço...
✅ Serviço importado com sucesso: true
📡 Fazendo requisição GET...
📈 InfoDailyService - Requisição de dados
📍 Endpoint completo: http://127.0.0.1:8000/api/infodaily/
📤 Headers enviados: {Authorization: "Bearer ...", ...}
📨 InfoDailyService - Status da resposta: 200
✅ InfoDailyService - Resultado final: {...}
```

### 4. Usar Botões de Teste
Clicar nos botões "Test Índices" e "Test Insights" para forçar chamadas manuais.

### 5. Verificar Network Tab
- DevTools → Network
- Filtrar por XHR/Fetch
- Verificar se aparecem requisições para:
  - `http://127.0.0.1:8000/api/infodaily/`
  - `http://127.0.0.1:8000/api/insights-mercado/`

## Possíveis Causas

### 1. Token de Autenticação
- Token expirado
- Token mal formatado
- Header Authorization incorreto

### 2. Timing de Execução
- useEffect executando antes do token estar disponível
- Contexto AuthContext ainda não inicializado

### 3. Dependências do useEffect
- Array de dependências vazio pode não reagir a mudanças de estado

### 4. Serviço Backend
- Endpoints indisponíveis
- CORS mal configurado
- Rate limiting

## Próximos Passos

1. **Testar com botões manuais** - Verificar se chamadas funcionam quando forçadas
2. **Verificar logs no console** - Identificar onde o processo para
3. **Analisar Network tab** - Ver se requisições HTTP são feitas
4. **Verificar Headers** - Confirmar se Authorization header está correto
5. **Testar endpoint direto** - Usar Postman/Insomnia para testar API

## Comandos de Teste

### PowerShell (com token real):
```powershell
$token = "seu_token_aqui"
$headers = @{
    "accept" = "application/json"
    "Content-Type" = "application/json"
    "X-API-Key" = "organizesee-api-key-2025-secure"
    "Authorization" = "Bearer $token"
}
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/infodaily/" -Method GET -Headers $headers
```

### JavaScript Console:
```javascript
// Testar token no localStorage
console.log('Token:', localStorage.getItem('organizesee_auth_token'));

// Testar chamada manual
rulesInstance.get({chave: "infodaily", withAuth: true}).then(console.log);
```
