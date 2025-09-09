/**
 * Teste de Conexão Google OAuth
 * Simula o fluxo de autenticação Google do frontend para o backend
 */

const testGoogleAuthConnection = async () => {
  try {
    console.log("🔄 TESTE DE CONEXÃO GOOGLE OAUTH");
    console.log("==============================");

    // Obter API Key do .env
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("❌ API Key não encontrada no .env!");
      return;
    }

    // Verificar primeiro caracteres da API Key
    console.log(`🔑 API Key (primeiros caracteres): ${apiKey.substring(0, 10)}...`);
    console.log(`🔑 API Key comprimento: ${apiKey.length} caracteres`);

    // URL do backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";
    let apiUrl = `${backendUrl.replace(/\/api\/?$/, '')}/auth/google/signin`;
    
    console.log(`🌐 URL do backend: ${apiUrl}`);

    // Simular token Google (este é um formato JWT válido, mas com conteúdo fictício)
    const mockToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0NjAxNDExNDg0MDAtZGpzMXRra3IwZTRlbmVxbWV0ZjdnZnN2b3RwaHV0Y3UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJUZXN0IFVzZXIiLCJnaXZlbl9uYW1lIjoiVGVzdCIsImV4cCI6MTkwMDAwMDAwMCwiaWF0IjoxNjAwMDAwMDAwfQ.test";

    // Simular ID do cliente Google
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "460141148400-djs1tkkr0e4eneqmetf7gfsvotphutcu.apps.googleusercontent.com";

    // Construir o corpo da requisição
    const requestBody = {
      idToken: mockToken,
      clientId: clientId,
      origin: window.location.origin,
      test: true // Indicar que é uma requisição de teste
    };

    console.log("📦 Corpo da requisição:", JSON.stringify(requestBody, null, 2));

    // Definir headers
    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "Origin": window.location.origin,
      "X-Requested-With": "XMLHttpRequest",
      "Referer": window.location.origin + "/",
      "X-Test-Request": "true"
    };

    console.log("🏷️ Headers:", JSON.stringify(headers, null, 2));

    // Verificar conexão OPTIONS primeiro (preflight)
    console.log("\n🔍 Verificando CORS com requisição OPTIONS...");
    
    try {
      const optionsResponse = await fetch(apiUrl, {
        method: "OPTIONS",
        headers: headers
      });
      
      console.log(`✅ OPTIONS ${optionsResponse.status} ${optionsResponse.statusText}`);
      console.log("Headers de resposta:", Object.fromEntries(optionsResponse.headers.entries()));
    } catch (error) {
      console.error("❌ Erro na requisição OPTIONS:", error);
    }

    // Fazer requisição POST
    console.log("\n🚀 Enviando requisição POST...");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
      mode: "cors"
    });

    // Obter resposta como texto
    const responseText = await response.text();
    
    console.log(`\n📝 STATUS: ${response.status} ${response.statusText}`);
    console.log("📝 HEADERS:", Object.fromEntries(response.headers.entries()));
    
    // Tentar parsear como JSON se possível
    try {
      const responseData = JSON.parse(responseText);
      console.log("📝 RESPOSTA JSON:", JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log("📝 RESPOSTA TEXTO:", responseText);
    }

    console.log("\n✅ TESTE CONCLUÍDO");

  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error);
  }
};

export default testGoogleAuthConnection;
