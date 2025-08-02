/**
 * User.js - Serviço para buscar dados do usuário (páginas privadas)
 * Recebe dados do Rules e faz requisição para API
 * Rules fornece: endpoint completo, body e headers
 */

/**
 * Serviço de User
 */
const UserService = {
  /**
   * Método GET para buscar dados do usuário
   * @param {string} endpoint - Endpoint completo da API (já com BACKEND_URL)
   * @param {object} headers - Headers da requisição (já processados)
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("👤 UserService - Iniciando busca de dados do usuário");
      console.log("📍 Endpoint completo:", endpoint);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 UserService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasData: !!data,
        hasUserInfo: !!(data && (data.id || data.email || data.username)),
      });

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ UserService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método POST para atualizar dados do usuário
   * @param {string} endpoint - Endpoint completo da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("👤 UserService POST - Atualizando dados do usuário");
      console.log("📍 Endpoint completo:", endpoint);
      console.log("📦 Body:", {
        ...body,
        password: "***",
        current_password: "***",
        new_password: "***",
      }); // Não logar senhas

      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 UserService POST - Resposta recebida:", {
        status: response.status,
        success: response.status === 200 || response.status === 201,
        hasData: !!data,
      });

      return {
        success: response.status === 200 || response.status === 201,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ UserService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método PUT para atualizar dados do usuário
   * @param {string} endpoint - Endpoint completo da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async put(endpoint, body, headers) {
    try {
      console.log("👤 UserService PUT - Atualizando dados do usuário");
      console.log("📍 Endpoint completo:", endpoint);

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ UserService PUT - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default UserService;
