/**
 * Generic.js - Serviço genérico para fallback
 * Consulta a API e retorna para Rules
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Serviço Genérico
 */
const GenericService = {
  /**
   * Método POST genérico
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("🔧 GenericService POST - Requisição genérica");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      console.log("📨 GenericService - Resposta recebida:", {
        status: response.status,
        success: this.isSuccessStatus(response.status),
        hasData: !!data,
      });

      return {
        success: this.isSuccessStatus(response.status),
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ GenericService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método GET genérico
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("🔧 GenericService GET - Requisição genérica");
      console.log("📍 Endpoint:", endpoint);

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: this.isSuccessStatus(response.status),
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ GenericService GET - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método PUT genérico
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async put(endpoint, body, headers) {
    try {
      console.log("🔧 GenericService PUT - Requisição genérica");

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: this.isSuccessStatus(response.status),
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ GenericService PUT - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método DELETE genérico
   * @param {string} endpoint - Endpoint da API
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async delete(endpoint, headers) {
    try {
      console.log("🔧 GenericService DELETE - Requisição genérica");

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "DELETE",
        headers: headers,
      });

      const data = await response.json().catch(() => ({}));

      return {
        success: this.isSuccessStatus(response.status),
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };
    } catch (error) {
      console.error("❌ GenericService DELETE - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Verifica se o status é considerado sucesso conforme as regras
   * 200, 201, 202, 203 = sucesso
   * 400, 401, 404 = erro
   * @param {number} status - Código de status HTTP
   * @returns {boolean} True se for sucesso
   */
  isSuccessStatus(status) {
    const successCodes = [200, 201, 202, 203];
    return successCodes.includes(status);
  },

  /**
   * Verifica se o status é considerado erro conforme as regras
   * @param {number} status - Código de status HTTP
   * @returns {boolean} True se for erro
   */
  isErrorStatus(status) {
    const errorCodes = [400, 401, 404];
    return errorCodes.includes(status);
  },
};

export default GenericService;
