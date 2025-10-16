/**
 * Dividas.js - Serviço d      console.log("📨 DividasService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasDividas: !!(
          data.maiores_dividas ||
          data.dividas
        ),
        hasResumo: !!data.resumo,
        hasTotaisPorCategoria: !!(data.totais_por_categoria && data.totais_por_categoria.length > 0),
      });idas para páginas privadas
 * Consulta a API e retorna para Rules
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Serviço de Dívidas
 */
const DividasService = {
  /**
   * Método GET para obter dívidas
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("🏦 DividasService - Requisição de dados de dívidas");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      console.log("��� DividasService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasDividas: !!(data.maiores_dividas || data.dividas),
      });

      return {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ DividasService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método POST para criar dívida
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("🏦 DividasService POST - Criando dívida");

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
      console.error("❌ DividasService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método PUT para atualizar dívida
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async put(endpoint, body, headers) {
    try {
      console.log("🏦 DividasService PUT - Atualizando dívida");

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
      console.error("❌ DividasService PUT - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método DELETE para remover dívida
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async delete(endpoint, headers) {
    try {
      console.log("🏦 DividasService DELETE - Removendo dívida");

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
      console.error("❌ DividasService DELETE - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default DividasService;
