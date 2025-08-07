#!/usr/bin/env node

// Script simples para testar autenticação com o servidor Django
// Para uso: node scripts/test-auth.js

const baseURL = "http://127.0.0.1:8000";
const apiKey = "organizesee-api-key-2025-secure";

// Função para fazer login
async function testLogin() {
  console.log("🔐 Testando login...");

  try {
    const response = await fetch(`${baseURL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        username: "user@test.com", // Ajuste conforme necessário
        password: "password123", // Ajuste conforme necessário
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Login bem-sucedido:", {
      hasAccess: !!data.access,
      hasRefresh: !!data.refresh,
      hasUser: !!data.user,
    });

    return data;
  } catch (error) {
    console.error("❌ Erro no login:", error.message);
    return null;
  }
}

// Função para testar refresh token
async function testRefreshToken(refreshToken) {
  console.log("🔄 Testando refresh token...");

  try {
    const response = await fetch(`${baseURL}/api/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Refresh bem-sucedido:", {
      hasNewAccess: !!data.access,
      hasNewRefresh: !!data.refresh,
    });

    if (data.access) {
      console.log(
        "🔑 Novo access token:",
        data.access.substring(0, 50) + "...",
      );
    }

    if (data.refresh) {
      console.log(
        "🔄 Novo refresh token:",
        data.refresh.substring(0, 50) + "...",
      );
    }

    return data;
  } catch (error) {
    console.error("❌ Erro no refresh:", error.message);
    return null;
  }
}

// Executar teste completo
async function runTests() {
  console.log("🚀 Iniciando testes de autenticação...\n");

  // Teste 1: Login
  const loginData = await testLogin();
  if (!loginData) {
    console.log("❌ Teste falhou no login");
    return;
  }

  console.log("\n⏳ Aguardando 2 segundos...\n");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Teste 2: Refresh Token
  if (loginData.refresh) {
    const refreshData = await testRefreshToken(loginData.refresh);
    if (!refreshData) {
      console.log("❌ Teste falhou no refresh");
      return;
    }
  } else {
    console.log("⚠️ Não foi possível testar refresh - token não fornecido");
  }

  console.log("\n✅ Todos os testes completados com sucesso!");
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testLogin, testRefreshToken };
