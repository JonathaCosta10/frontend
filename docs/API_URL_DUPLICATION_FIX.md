# Correção de Duplicação de URLs da API

## 🚨 Problema Identificado

As APIs estavam gerando URLs duplicadas com o padrão `/services/api/api/`, causando URLs incorretas como:

```
❌ INCORRETO:
https://www.organizesee.com.br/services/api/services/api/api/dashboard/orcamento/custos/distribuicao_gastos?ano=2025

✅ CORRETO:
https://www.organizesee.com.br/services/api/api/dashboard/orcamento/custos/distribuicao_gastos?ano=2025
```

## 🔍 Causa Raiz

A duplicação ocorreu porque:

1. **VITE_BACKEND_URL** = `https://www.organizesee.com.br/services/api`
2. **Endpoints** estavam definidos como `/services/api/api/dashboard/...`
3. **Resultado** = `https://www.organizesee.com.br/services/api` + `/services/api/api/dashboard/...`

## ✅ Correções Implementadas

### 1. **Arquivos de API Corrigidos:**

#### **budget.ts:**
```typescript
// ANTES
`/services/api/api/dashboard/orcamento/custos/maiores_gastos?categoria=${categoria}&mes=${mes}&ano=${ano}`

// DEPOIS  
`/api/maiores_gastos?categoria=${categoria}&mes=${mes}&ano=${ano}`
```

#### **entradas/charts.ts, data.ts, tables.ts:**
```typescript
// ANTES
'/services/api/api/dashboard/orcamento/entradas/charts'

// DEPOIS
'/api/dashboard/orcamento/entradas/charts'
```

#### **custos/charts.ts, data.ts, tables.ts:**
```typescript
// ANTES
'/services/api/api/dashboard/orcamento/custos/charts'

// DEPOIS
'/api/dashboard/orcamento/custos/charts'
```

### 2. **Lógica de Construção de URL:**

```typescript
// base.ts (já estava correto)
const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;

// Onde:
// this.config.baseURL = https://www.organizesee.com.br/services/api
// endpoint = /api/dashboard/orcamento/custos/...
// Resultado = https://www.organizesee.com.br/services/api/api/dashboard/orcamento/custos/...
```

## 🎯 URLs Finais Corretas

### **Entradas:**
- `https://www.organizesee.com.br/services/api/api/maiores_entradas?categoria=Salario&mes=08&ano=2025`
- `https://www.organizesee.com.br/services/api/api/dashboard/orcamento/entradas/charts`
- `https://www.organizesee.com.br/services/api/api/dashboard/orcamento/entradas/data`

### **Custos:**
- `https://www.organizesee.com.br/services/api/api/maiores_gastos?categoria=...&mes=...&ano=...`
- `https://www.organizesee.com.br/services/api/api/distribuicao_gastos?ano=2025`
- `https://www.organizesee.com.br/services/api/api/dashboard/orcamento/custos/charts`

## ⚠️ Sobre o Erro 503

O erro 503 que você mencionou:
```
Request URL: https://www.organizesee.com.br/dashboard/orcamento/entradas
Request Method: GET
Purpose: prefetch
```

Este erro é diferente das APIs. É uma requisição de **prefetch** do navegador tentando carregar a **página** `/dashboard/orcamento/entradas`, não a API. Isso é comportamento normal do navegador tentando fazer prefetch de links na página.

## 🔧 Teste das Correções

Para verificar se as correções funcionaram:

1. **APIs devem usar:**
   - Base: `https://www.organizesee.com.br/services/api/`
   - Endpoint: `/api/dashboard/orcamento/...`
   - Resultado: `https://www.organizesee.com.br/services/api/api/dashboard/orcamento/...`

2. **Não deve mais haver:**
   - `/services/api/services/api/api/` (duplicação)
   - URLs com padrão repetido

## 📦 Arquivos Modificados

- ✅ `client/services/api/budget.ts` - Endpoints principais
- ✅ `client/services/api/dashboard/orcamento/entradas/charts.ts`
- ✅ `client/services/api/dashboard/orcamento/entradas/data.ts` 
- ✅ `client/services/api/dashboard/orcamento/entradas/tables.ts`
- ✅ `client/services/api/dashboard/orcamento/entradas/charts/entradasChart.ts`
- ✅ `client/services/api/dashboard/orcamento/custos/charts.ts`
- ✅ `client/services/api/dashboard/orcamento/custos/data.ts`
- ✅ `client/services/api/dashboard/orcamento/custos/tables.ts`
- ✅ `client/debug/testApiConfig.ts` - Exemplo de teste

## 🚀 Status

- [x] ✅ Removida duplicação `/services/api/api/` dos endpoints
- [x] ✅ Corrigidos todos os arquivos de API de entradas e custos  
- [x] ✅ Corrigido arquivo principal budget.ts
- [x] ✅ Atualizado script de teste
- [x] ✅ Commits e push realizados

**Resultado:** As URLs da API agora são construídas corretamente sem duplicação, seguindo o padrão `https://www.organizesee.com.br/services/api/api/...` 🎉
