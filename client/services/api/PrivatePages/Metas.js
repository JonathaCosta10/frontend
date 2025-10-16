/**
 * Metas.js - Serviço de metas para páginas privadas
 * Consulta a API e retorna para Rules
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Serviço de Metas
 */
const MetasService = {
  /**
   * Método GET para obter metas
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("🎯 MetasService - Requisição de dados de metas");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 MetasService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasMetas: !!(data.metas || data.progresso),
      });

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ MetasService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método POST para criar meta
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("🎯 MetasService POST - Criando meta");

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
      console.error("❌ MetasService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método PUT para atualizar meta
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async put(endpoint, body, headers) {
    try {
      console.log("🎯 MetasService PUT - Atualizando meta");

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
      console.error("❌ MetasService PUT - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método DELETE para remover meta
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async delete(endpoint, headers) {
    try {
      console.log("🎯 MetasService DELETE - Removendo meta");

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
      console.error("❌ MetasService DELETE - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default MetasService;
