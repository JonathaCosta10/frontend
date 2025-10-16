/**
 * Entradas.js - Serviço de entradas para páginas privadas
 * Consulta a API e retorna para Rules
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Serviço de Entradas
 */
const EntradasService = {
  /**
   * Método GET para obter entradas
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("💰 EntradasService - Requisição de dados de entradas");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 EntradasService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasEntradas: !!(
          data.maiores_entradas ||
          data.entradas ||
          data.variacao_entrada
        ),
      });

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ EntradasService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método POST para criar entrada
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("💰 EntradasService POST - Criando entrada");

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: response.status === 200 || response.status === 201,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ EntradasService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método PUT para atualizar entrada
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async put(endpoint, body, headers) {
    try {
      console.log("💰 EntradasService PUT - Atualizando entrada");

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
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
      console.error("❌ EntradasService PUT - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método DELETE para remover entrada
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async delete(endpoint, headers) {
    try {
      console.log("💰 EntradasService DELETE - Removendo entrada");

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "DELETE",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: response.status === 200 || response.status === 204,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ EntradasService DELETE - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default EntradasService;
