/**
 * Ranking.js - Serviço de ranking para páginas públicas
 * Consulta a API e retorna para Rules
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Serviço de Ranking
 */
const RankingService = {
  /**
   * Método GET para obter dados de ranking
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("🏆 RankingService - Requisição de dados de ranking");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 RankingService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasResults: !!(data.results || data.ranking),
      });

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ RankingService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método POST para consultas específicas de ranking
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("🏆 RankingService POST - Consulta específica");

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
      console.error("❌ RankingService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default RankingService;
