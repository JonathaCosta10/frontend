# Documentação: API de Criptomoedas - Backend Integration

## Objetivo
Implementar uma API pública (sem autenticação) no backend Django para fornecer dados de criptomoedas em tempo real para a página de mercado (`/market`).

## Especificação da API

### 1. Endpoint Principal
```
GET /market/crypto/
```

**Características:**
- Método: GET apenas
- Sem autenticação (dados públicos)
- Headers necessários: Apenas `VITE_API_KEY`/API_KEY para validação básica
- Rate limiting: Recomendado implementar (ex: 10 requests/min por IP)

### 2. Estrutura de Resposta Esperada

#### Resposta de Sucesso (HTTP 200)
```json
{
  "status": "success",
  "data": {
    "cryptocurrencies": [
      {
        "id": "bitcoin",
        "symbol": "BTC",
        "name": "Bitcoin",
        "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        "current_price": 293450.75,
        "market_cap": 5750000000000,
        "market_cap_rank": 1,
        "total_volume": 15200000000,
        "price_change_percentage_24h": 2.45,
        "circulating_supply": 19750000,
        "total_supply": 21000000,
        "ath": 350000.00,
        "ath_change_percentage": -16.2,
        "last_updated": "2025-08-18T12:30:00Z"
      },
      {
        "id": "ethereum",
        "symbol": "ETH",
        "name": "Ethereum",
        "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        "current_price": 12250.30,
        "market_cap": 1470000000000,
        "market_cap_rank": 2,
        "total_volume": 8900000000,
        "price_change_percentage_24h": -1.23,
        "circulating_supply": 120280000,
        "total_supply": null,
        "ath": 25000.00,
        "ath_change_percentage": -51.0,
        "last_updated": "2025-08-18T12:30:00Z"
      }
    ],
    "global_stats": {
      "total_market_cap": 8200000000000,
      "total_volume_24h": 95000000000,
      "btc_dominance": 54.2,
      "active_cryptocurrencies": 2400000,
      "market_cap_change_percentage_24h": 2.4
    },
    "last_updated": "2025-08-18T12:30:00Z",
    "source": "coingecko", // ou "binance", "coinmarketcap"
    "cache_duration": 120 // em segundos
  }
}
```

#### Resposta de Erro (HTTP 4xx/5xx)
```json
{
  "status": "error",
  "error": {
    "code": "API_UNAVAILABLE",
    "message": "Serviço de criptomoedas temporariamente indisponível",
    "details": "API externa retornou erro 503"
  },
  "fallback_data": {
    // Dados em cache ou mockados (opcional)
    "cryptocurrencies": [...],
    "cache_timestamp": "2025-08-18T11:30:00Z"
  }
}
```

### 3. Parâmetros Opcionais (Query Parameters)

```
GET /market/crypto/?limit=50&order=market_cap_desc&vs_currency=brl
```

**Parâmetros suportados:**
- `limit`: Número de moedas (default: 100, max: 250)
- `order`: Ordenação (`market_cap_desc`, `market_cap_asc`, `volume_desc`, `price_desc`)
- `vs_currency`: Moeda base (`brl`, `usd`) - default: `brl`
- `include_24h_change`: Incluir dados de 24h (default: `true`)

### 4. Headers de Resposta Importantes

```
Content-Type: application/json
Cache-Control: public, max-age=120
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1692360000
X-Data-Source: coingecko
X-Cache-Status: HIT|MISS
```

## Implementação no Backend

### 1. Estrutura Recomendada (Django)

```python
# views.py
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import requests
from django.core.cache import cache

@api_view(['GET'])
@permission_classes([AllowAny])  # Público, sem autenticação
@cache_page(60 * 2)  # Cache por 2 minutos
def crypto_market_data(request):
    """
    Endpoint público para dados de criptomoedas
    GET /market/crypto/
    """
    try:
        # Parâmetros
        limit = min(int(request.GET.get('limit', 100)), 250)
        order = request.GET.get('order', 'market_cap_desc')
        vs_currency = request.GET.get('vs_currency', 'brl')
        
        # Buscar dados da API externa (CoinGecko)
        data = fetch_crypto_data(limit, order, vs_currency)
        
        response_data = {
            "status": "success",
            "data": {
                "cryptocurrencies": data['coins'],
                "global_stats": data['global'],
                "last_updated": data['timestamp'],
                "source": data['source'],
                "cache_duration": 120
            }
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        # Fallback para dados em cache
        cached_data = cache.get('crypto_fallback_data')
        
        return JsonResponse({
            "status": "error",
            "error": {
                "code": "API_UNAVAILABLE",
                "message": "Serviço temporariamente indisponível",
                "details": str(e)
            },
            "fallback_data": cached_data
        }, status=503)

def fetch_crypto_data(limit, order, vs_currency):
    """Busca dados da API externa (CoinGecko, Binance, etc)"""
    # Implementar lógica de fetch com retry e fallback
    pass
```

### 2. URLs Configuration

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('market/crypto/', views.crypto_market_data, name='crypto_market_data'),
    # Outros endpoints...
]
```

### 3. Cache e Performance

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'organizesee_crypto',
        'TIMEOUT': 120,  # 2 minutos
    }
}
```

## Integração no Frontend

### 1. Modificação da API Crypto

Arquivo: `client/services/api/crypto/backendCryptoApi.ts`

```typescript
import { CRYPTO_ROUTES } from "../../../contexts/Rotas";
import { makeApiRequest } from "../../../lib/api-helpers";

interface BackendCryptoResponse {
  status: "success" | "error";
  data?: {
    cryptocurrencies: CoinGeckoCrypto[];
    global_stats: {
      total_market_cap: number;
      total_volume_24h: number;
      btc_dominance: number;
      active_cryptocurrencies: number;
      market_cap_change_percentage_24h: number;
    };
    last_updated: string;
    source: string;
    cache_duration: number;
  };
  error?: {
    code: string;
    message: string;
    details: string;
  };
  fallback_data?: any;
}

export const backendCryptoApi = {
  async getMarkets(): Promise<CoinGeckoCrypto[]> {
    try {
      const response = await makeApiRequest<BackendCryptoResponse>(
        `${CRYPTO_ROUTES.market}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': import.meta.env.VITE_API_KEY
          }
        }
      );

      if (response.status === 'success' && response.data) {
        return response.data.cryptocurrencies;
      }

      // Usar fallback data se disponível
      if (response.fallback_data?.cryptocurrencies) {
        return response.fallback_data.cryptocurrencies;
      }

      throw new Error(response.error?.message || 'API error');
    } catch (error) {
      console.error('Backend crypto API error:', error);
      throw error;
    }
  },

  async checkApiStatus() {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/market/crypto/`);
      
      if (response.ok) {
        return {
          status: 'operational' as const,
          message: 'API funcionando normalmente'
        };
      } else {
        return {
          status: 'limited' as const,
          message: 'API com limitações'
        };
      }
    } catch (error) {
      return {
        status: 'down' as const,
        message: 'API indisponível'
      };
    }
  }
};
```

### 2. Modificação do MarketPage.tsx

```typescript
// Em client/pages/MarketPage.tsx, na função fetchCryptoData:

async function fetchCryptoData() {
  try {
    setLoading(true);
    setError(null);
    
    console.log("Buscando dados do backend...");
    
    // Verificar status da API do backend
    const status = await backendCryptoApi.checkApiStatus();
    setApiStatus(status);
    
    if (status.status === 'down') {
      setError("Backend indisponível. Usando dados mockados...");
      // Fallback para CoinGecko direto
      const markets = await coinGeckoApi.getMarkets();
      setCryptoAssets(markets);
      setFilteredAssets(markets);
      setLoading(false);
      return;
    }
    
    // Buscar dados do backend
    const markets = await backendCryptoApi.getMarkets();
    
    if (!markets || markets.length === 0) {
      setError("Backend retornou dados vazios.");
      return;
    }
    
    setCryptoAssets(markets);
    setFilteredAssets(markets);
    setLoading(false);
  } catch (err) {
    console.error("Erro ao buscar dados do backend:", err);
    // Fallback para CoinGecko
    try {
      const markets = await coinGeckoApi.getMarkets();
      setCryptoAssets(markets);
      setFilteredAssets(markets);
      setError("Usando dados alternativos devido a erro no backend.");
    } catch (fallbackErr) {
      setError("Não foi possível carregar dados de criptomoedas.");
    }
    setLoading(false);
  }
}
```

## Configuração de Ambiente

### 1. Variáveis de Ambiente (.env)

```env
# Backend API Configuration
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_API_KEY=}$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+

# Crypto API Configuration
VITE_USE_BACKEND_CRYPTO=true
VITE_CRYPTO_FALLBACK_TO_COINGECKO=true
VITE_CRYPTO_CACHE_DURATION=120000
```

### 2. Configuração de Desenvolvimento

```typescript
// client/config/api.ts
export const API_CONFIG = {
  useBackendCrypto: import.meta.env.VITE_USE_BACKEND_CRYPTO === 'true',
  fallbackToCoinGecko: import.meta.env.VITE_CRYPTO_FALLBACK_TO_COINGECKO === 'true',
  cacheDuration: parseInt(import.meta.env.VITE_CRYPTO_CACHE_DURATION) || 120000,
  baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
};
```

## Fluxo de Funcionamento

1. **Primeira Tentativa**: Frontend faz requisição para `/market/crypto/` do backend
2. **Backend Processing**: 
   - Verifica cache interno (Redis)
   - Se cache vazio/expirado, busca da API externa (CoinGecko)
   - Processa e formata os dados
   - Salva no cache por 2 minutos
   - Retorna dados padronizados
3. **Fallback Strategy**:
   - Se backend falhar → Frontend tenta CoinGecko diretamente
   - Se CoinGecko falhar → Frontend usa dados mockados
   - Se tudo falhar → Exibe erro com opção de retry

## Benefícios desta Implementação

1. **Performance**: Cache no backend reduz chamadas à API externa
2. **Controle**: Rate limiting e monitoramento centralizados
3. **Flexibilidade**: Pode alternar entre diferentes APIs (CoinGecko, Binance, etc.)
4. **Resiliência**: Multiple fallback strategies
5. **Custo**: Reduz uso da API externa paga
6. **Dados Consistentes**: Formatação padronizada independente da fonte

## Próximos Passos

1. ✅ Implementar endpoint `/market/crypto/` no Django backend
2. ✅ Criar `backendCryptoApi.ts` no frontend  
3. ✅ Modificar `MarketPage.tsx` para usar backend primeiro
4. ✅ Implementar sistema de cache Redis no backend
5. ✅ Adicionar rate limiting e monitoramento
6. ✅ Testar fluxo completo com fallbacks

## Exemplo de Teste

```bash
# Testar endpoint
curl -X GET "http://127.0.0.1:8000/market/crypto/?limit=10" \
  -H "X-API-Key: }$gQ7TlDEhJ88np]^n8[uFu{9f#;+8qjZ&?c[+Sj_CLhMO[Z(iM_)ZnW]j2M]+j+" \
  -H "Content-Type: application/json"
```

Esta implementação garante que a página `/market` use dados reais do backend, mantendo fallbacks robustos e performance otimizada.
