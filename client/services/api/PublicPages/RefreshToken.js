/**
 * RefreshToken.js - Serviço de refresh token para páginas públicas
 * Recebe dados do Rules e faz requisição para API
 * Rules fornece: endpoint completo, body e headers
 */

/**
 * Serviço de RefreshToken
 */
const RefreshTokenService = {
  /**
   * Método POST para refresh token
   * @param {string} endpoint - Endpoint completo da API (já com BACKEND_URL)
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição (já processados)
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("🔄 RefreshTokenService - Iniciando requisição de refresh");
      console.log("📍 Endpoint completo:", endpoint);
      console.log("📦 Body:", { refresh: "***" }); // Não logar token

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 RefreshTokenService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200 || response.status === 201,
        hasData: !!data,
        hasAccessToken: !!(data && data.access),
      });

      return {
        success: response.status === 200 || response.status === 201,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ RefreshTokenService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método GET para verificar status de token
   * @param {string} endpoint - Endpoint completo da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("🔍 RefreshTokenService GET - Endpoint:", endpoint);

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
      console.error("❌ RefreshTokenService GET - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default RefreshTokenService;
