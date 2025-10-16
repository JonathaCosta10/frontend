/**
 * Market.js - Serviço de mercado para páginas públicas
 * Consulta a API e retorna para Rules
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Serviço de Market
 */
const MarketService = {
  /**
   * Método GET para dados de mercado
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("📈 MarketService - Requisição de dados de mercado");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 MarketService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasResults: !!(data.results || data.data),
      });

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ MarketService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método POST para consultas específicas
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("📈 MarketService POST - Consulta específica");

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
      console.error("❌ MarketService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default MarketService;
