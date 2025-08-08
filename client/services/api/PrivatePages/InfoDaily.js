/**
 * InfoDaily.js - Serviço de informações diárias para páginas privadas
 * Recebe dados do Rules e faz requisição para API
 * Rules fornece: endpoint completo, body e headers
 */

// Importar sistema de rotas
import { getRoute } from "../../../contexts/Rotas";

// URL base do backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Serviço de InfoDaily
 */
const InfoDailyService = {
  /**
   * Método GET genérico para buscar dados
   * @param {string} endpoint - Endpoint completo da API (já com BACKEND_URL)
   * @param {object} headers - Headers da requisição (já processados)
   * @returns {Promise<object>} Resposta da API
   */
  async get(endpoint, headers) {
    try {
      console.log("📈 InfoDailyService - Requisição de dados");
      console.log("📍 Endpoint completo:", endpoint);
      console.log("📤 Headers enviados:", headers);

      const response = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      console.log("📨 InfoDailyService - Status da resposta:", response.status);

      const data = await response.json().catch((error) => {
        console.warn("⚠️ Erro ao parsear JSON:", error);
        return {};
      });

      console.log("📨 InfoDailyService - Resposta recebida:", {
        status: response.status,
        success: response.status === 200,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        dataType: typeof data,
      });

      const result = {
        success: response.status === 200,
        data: data,
        status: response.status,
        message: data.detail || data.message || `HTTP ${response.status}`,
      };

      console.log("✅ InfoDailyService - Resultado final:", result);
      return result;
    } catch (error) {
      console.error("❌ InfoDailyService - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método específico para buscar insights de mercado
   * @param {object} headers - Headers da requisição com token e API key
   * @returns {Promise<object>} Resposta da API com dados dos insights
   */
  async getMarketInsights(headers) {
    try {
      console.log("💡 InfoDailyService - Buscando insights de mercado");
      
      // Usar o sistema de rotas do projeto
      const endpoint = getRoute("marketInsights");
      console.log("🎯 Endpoint insights obtido:", endpoint);
      
      if (!endpoint) {
        console.error("❌ Endpoint 'marketInsights' não encontrado nas rotas");
        return {
          success: false,
          message: "Endpoint não configurado",
          data: null,
        };
      }
      
      const response = await this.get(endpoint, headers);
      
      console.log("📋 Resposta do insights detalhada:", {
        success: response.success,
        status: response.status,
        hasData: !!response.data,
        dataStructure: response.data ? Object.keys(response.data) : null,
        message: response.message,
      });
      
      if (response.success && response.data) {
        // Verificar diferentes estruturas possíveis de resposta
        const insightsData = response.data.insights_mercado || response.data;
        
        console.log("✅ Insights de mercado carregados com sucesso:", {
          temInsights: !!insightsData,
          estrutura: Object.keys(insightsData || {}),
          maioresVolumes: insightsData?.maiores_volumes_negociacao,
          variacaoPortfolio: insightsData?.variacao_portfolio,
          oportunidadesPreco: insightsData?.oportunidades_preco_medio,
          temTitulo: !!insightsData?.titulo,
          temUltimaAtualizacao: !!insightsData?.ultima_atualizacao,
        });
        
        return {
          success: true,
          data: insightsData,
        };
      } else {
        console.warn("⚠️ Dados dos insights não encontrados na resposta");
        return {
          success: false,
          message: response.message || "Dados dos insights não encontrados",
          data: null,
        };
      }
    } catch (error) {
      console.error("❌ Erro ao buscar insights de mercado:", error);
      return {
        success: false,
        message: "Erro ao carregar insights de mercado",
        data: null,
        error: error,
      };
    }
  },

  /**
   * Método específico para buscar índices de mercado
   * @param {object} headers - Headers da requisição com token e API key
   * @returns {Promise<object>} Resposta da API com dados dos índices
   */
  async getMarketIndices(headers) {
    try {
      console.log("📊 InfoDailyService - Buscando índices de mercado");
      
      // Usar o sistema de rotas do projeto
      const endpoint = getRoute("infodaily");
      console.log("🎯 Endpoint indices obtido:", endpoint);
      
      if (!endpoint) {
        console.error("❌ Endpoint 'infodaily' não encontrado nas rotas");
        return {
          success: false,
          message: "Endpoint não configurado",
          data: [],
        };
      }
      
      const response = await this.get(endpoint, headers);
      
      console.log("📋 Resposta do indices detalhada:", {
        success: response.success,
        status: response.status,
        hasData: !!response.data,
        dataStructure: response.data ? Object.keys(response.data) : null,
        message: response.message,
      });
      
      if (response.success && response.data) {
        // Verificar diferentes estruturas possíveis de resposta
        const indicesData = response.data.indices_mercado || response.data;
        const dados = indicesData?.dados || indicesData;
        
        console.log("✅ Índices de mercado carregados com sucesso:", {
          temIndices: !!indicesData,
          temDados: !!dados,
          count: Array.isArray(dados) ? dados.length : 0,
          estrutura: Object.keys(indicesData || {}),
          lastUpdate: indicesData?.ultima_atualizacao,
          primeiroDado: Array.isArray(dados) ? dados[0] : null,
          tipoIndicesData: typeof indicesData,
          tipoDados: Array.isArray(dados) ? 'array' : typeof dados,
        });
        
        return {
          success: true,
          data: Array.isArray(dados) ? dados : [],
          metadata: {
            titulo: indicesData?.titulo || "Índices de Mercado",
            ultima_atualizacao: indicesData?.ultima_atualizacao,
          },
        };
      } else {
        console.warn("⚠️ Dados dos índices não encontrados na resposta");
        return {
          success: false,
          message: response.message || "Dados dos índices não encontrados",
          data: [],
        };
      }
    } catch (error) {
      console.error("❌ Erro ao buscar índices de mercado:", error);
      return {
        success: false,
        message: "Erro ao carregar índices de mercado",
        data: [],
        error: error,
      };
    }
  },

  /**
   * Método POST para criar configurações de alertas de mercado
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async post(endpoint, body, headers) {
    try {
      console.log("📈 InfoDailyService POST - Criando configuração");

      const response = await fetch(endpoint, {
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
      console.error("❌ InfoDailyService POST - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },

  /**
   * Método PUT para atualizar configurações de alertas
   * @param {string} endpoint - Endpoint da API
   * @param {object} body - Dados do corpo da requisição
   * @param {object} headers - Headers da requisição
   * @returns {Promise<object>} Resposta da API
   */
  async put(endpoint, body, headers) {
    try {
      console.log("📈 InfoDailyService PUT - Atualizando configuração");

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
      console.error("❌ InfoDailyService PUT - Erro na requisição:", error);

      return {
        success: false,
        status: 0,
        error: error,
        message: "Erro de conexão com servidor",
      };
    }
  },
};

export default InfoDailyService;
