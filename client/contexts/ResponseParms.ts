/**
 * ResponseParms - Processamento centralizado de respostas da API
 * Design Pattern: Logs detalhados (V1) e padrão de segurança (V2)
 */

import { localStorageManager } from "../lib/localStorage";

// Interface para resposta da API
export interface ApiResponse {
  success: boolean;
  data?: any;
  status: number;
  message?: string;
  error?: any;
}

// Interface para processamento de resposta
export interface ResponseParams {
  response: ApiResponse;
  chave: string;
  method: string;
  endpoint: string;
  withAuth: boolean;
}

/**
 * Classe ResponseParms - Processamento centralizado de respostas
 */
export class ResponseParms {
  private static instance: ResponseParms;

  static getInstance(): ResponseParms {
    if (!ResponseParms.instance) {
      ResponseParms.instance = new ResponseParms();
    }
    return ResponseParms.instance;
  }

  /**
   * Processa resposta da API com logs detalhados (V1) e segurança (V2)
   * @param params - Parâmetros da resposta
   * @returns Resposta processada
   */
  processResponse(params: ResponseParams): ApiResponse {
    const { response, chave, method, endpoint, withAuth } = params;

    // V1 - Logs detalhados no terminal
    this.logDetailedResponse(params);

    // V2 - Padrão de segurança
    const securityProcessedResponse = this.applySecurityPattern(
      response,
      chave,
    );

    // Processar localStorage para rotas de autenticação
    if (this.isAuthRoute(chave)) {
      this.handleAuthResponse(response, chave);
    }

    return securityProcessedResponse;
  }

  /**
   * V1 - Logs detalhados no terminal
   * @param params - Parâmetros da resposta
   */
  private logDetailedResponse(params: ResponseParams): void {
    const { response, chave, method, endpoint, withAuth } = params;

    console.group(`📡 API Response [${chave}]`);
    console.log(`🔄 Method: ${method}`);
    console.log(`🎯 Endpoint: ${endpoint}`);
    console.log(`🔐 Auth Required: ${withAuth ? "Yes" : "No"}`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`✅ Success: ${response.success ? "Yes" : "No"}`);

    if (response.success) {
      console.log(`📦 Data Available: ${response.data ? "Yes" : "No"}`);
      if (response.data && this.shouldLogData(chave)) {
        console.log(`📋 Response Data:`, response.data);
      }
    } else {
      console.log(`❌ Error: ${response.message || "Unknown error"}`);
      if (response.error) {
        console.log(`🔍 Error Details:`, response.error);
      }
    }

    console.log(`⏱️ Timestamp: ${new Date().toISOString()}`);
    console.groupEnd();
  }

  /**
   * V2 - Padrão de segurança
   * @param response - Resposta original
   * @param chave - Chave da operação
   * @returns Resposta sanitizada
   */
  private applySecurityPattern(
    response: ApiResponse,
    chave: string,
  ): ApiResponse {
    // Criar cópia para não modificar original
    const sanitizedResponse: ApiResponse = {
      success: response.success,
      status: response.status,
      message: response.message,
    };

    // Aplicar sanitizaç��o de dados sensíveis
    if (response.data) {
      sanitizedResponse.data = this.sanitizeData(response.data, chave);
    }

    // Não incluir detalhes de erro em produção
    if (import.meta.env.PROD && response.error) {
      // Em produção, não expor detalhes de erro
      sanitizedResponse.error =
        response.status >= 500 ? "Internal server error" : "Request failed";
    } else {
      sanitizedResponse.error = response.error;
    }

    return sanitizedResponse;
  }

  /**
   * Sanitizar dados sensíveis da resposta
   * @param data - Dados da resposta
   * @param chave - Chave da operação
   * @returns Dados sanitizados
   */
  private sanitizeData(data: any, chave: string): any {
    if (!data || typeof data !== "object") {
      return data;
    }

    const sanitized = { ...data };

    // Campos sensíveis que nunca devem ser logados
    const sensitiveFields = [
      "password",
      "token",
      "refresh_token",
      "access_token",
      "secret",
      "key",
      "api_key",
      "private_key",
    ];

    // Remover campos sensíveis para logs
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Verificar se deve logar dados da resposta
   * @param chave - Chave da operação
   * @returns True se deve logar
   */
  private shouldLogData(chave: string): boolean {
    // Não logar dados de autenticação por segurança
    const noLogChaves = ["login", "register", "refreshToken"];
    return !noLogChaves.includes(chave) && !import.meta.env.PROD;
  }

  /**
   * Verificar se é rota de autenticação
   * @param chave - Chave da operação
   * @returns True se for rota de auth
   */
  private isAuthRoute(chave: string): boolean {
    return ["login", "register", "refreshToken", "logout"].includes(chave);
  }

  /**
   * Lidar com resposta de autenticação e localStorage
   * @param response - Resposta da API
   * @param chave - Chave da operação
   */
  private handleAuthResponse(response: ApiResponse, chave: string): void {
    if (!response.success || !response.data) {
      return;
    }

    switch (chave) {
      case "login":
        this.handleLoginResponse(response.data);
        break;
      case "register":
        this.handleRegisterResponse(response.data);
        break;
      case "refreshToken":
        this.handleRefreshTokenResponse(response.data);
        break;
      case "logout":
        this.handleLogoutResponse();
        break;
    }
  }

  /**
   * Processar resposta de login
   * @param data - Dados do login
   */
  private handleLoginResponse(data: any): void {
    console.log("🔐 Processando resposta de login...");

    // Armazenar tokens
    if (data.access) {
      localStorageManager.setAuthToken(data.access);
      console.log("✅ Token de acesso armazenado");
    }

    if (data.refresh) {
      localStorageManager.setRefreshToken(data.refresh);
      console.log("✅ Token de refresh armazenado");
    }

    // Armazenar dados do usuário
    if (data.user) {
      localStorageManager.setUserData(data.user);
      console.log("✅ Dados do usuário armazenados");
    }

    // Log de sucesso
    console.log("🎉 Login processado com sucesso!");
  }

  /**
   * Processar resposta de registro
   * @param data - Dados do registro
   */
  private handleRegisterResponse(data: any): void {
    console.log("📝 Processando resposta de registro...");

    // Register é request puro, sem localStorage automático
    // Apenas log de sucesso
    console.log("✅ Registro realizado com sucesso");

    // Se vier com auto-login (tokens), armazenar
    if (data.access && data.refresh) {
      console.log("🔄 Auto-login detectado, armazenando tokens...");
      this.handleLoginResponse(data);
    }
  }

  /**
   * Processar resposta de refresh token
   * @param data - Dados do refresh
   */
  private handleRefreshTokenResponse(data: any): void {
    console.log("🔄 Processando refresh token...");

    if (data.access) {
      localStorageManager.setAuthToken(data.access);
      console.log("✅ Novo token de acesso armazenado");
    }

    if (data.refresh) {
      localStorageManager.setRefreshToken(data.refresh);
      console.log("✅ Novo token de refresh armazenado");
    }
  }

  /**
   * Processar logout
   */
  private handleLogoutResponse(): void {
    console.log("🚪 Processando logout...");
    localStorageManager.clearAuthData();
    console.log("✅ Dados de autenticação removidos");
  }
}

// Instância singleton
export const responseParms = ResponseParms.getInstance();

export default ResponseParms;
