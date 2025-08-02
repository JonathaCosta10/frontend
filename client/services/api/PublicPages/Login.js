/**
 * Login.js - Serviço de autenticação para páginas públicas
 * Recebe dados do Rules e faz requisição para API
 * Rules fornece: endpoint completo, body e headers
 */

/**
 * Serviço de Login
 */
const LoginService = {
  /**
   * Método POST para login
   * @param {string} endpoint - Endpoint completo da API (já com BACKEND_URL)
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição (já processados)
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("🔐 LoginService - Iniciando requisição de login");
      console.log("📍 Endpoint completo:", endpoint);
      console.log("📦 Body:", { ...body, password: "***" }); // Não logar senha

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 LoginService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200 || response.status === 201,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      });

      return {
        success: response.status === 200 || response.status === 201,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ LoginService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método GET para verificar status
   * @param {string} endpoint - Endpoint completo da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("🔍 LoginService GET - Endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ LoginService GET - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default LoginService;
