/**
 * ResponseParms - Processamento centralizado de respostas da API
 * Design Pattern: Logs detalhados (V1) e padrão de segurança (V2)
 */

import { localStorageManager } from "../lib/localStorage";
import { eventEmitter, EVENTS } from "../lib/eventEmitter";

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

    // Aplicar sanitização de dados sensíveis
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
      
      // Salvar informação premium separadamente para fácil acesso
      const isPaidUserBoolean = Boolean(data.user.isPaidUser);
      localStorageManager.set("isPaidUser", isPaidUserBoolean);
      console.log(`✅ Status premium armazenado: ${isPaidUserBoolean ? "Premium" : "Gratuito"}`);
      console.log("🔍 VERIFICAÇÃO LOGIN - isPaidUser:", {
        valorOriginal: data.user.isPaidUser,
        tipoOriginal: typeof data.user.isPaidUser,
        valorConvertido: isPaidUserBoolean,
        tipoConvertido: typeof isPaidUserBoolean
      });
      
      // Disparar evento para notificar mudança no status premium
      console.log("🔔 Disparando evento de atualização de status premium...");
      eventEmitter.emit(EVENTS.PREMIUM_STATUS_CHANGED, {
        isPaidUser: data.user.isPaidUser,
        source: 'login'
      });
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

    // O refresh token agora sempre retorna dados atualizados do usuário
    if (data.user) {
      const previousPremiumStatus = localStorageManager.get("isPaidUser");
      const previousUserData = localStorageManager.getUserData();
      
      console.log("🔍 REFRESH TOKEN - Dados recebidos:", {
        userId: data.user.id,
        isPaidUser: data.user.isPaidUser,
        username: data.user.username,
        previousStatus: previousPremiumStatus
      });
      
      localStorageManager.setUserData(data.user);
      // Garantir que isPaidUser seja sempre boolean
      const isPaidUserBoolean = Boolean(data.user.isPaidUser);
      localStorageManager.set("isPaidUser", isPaidUserBoolean);
      
      console.log("🔍 VERIFICAÇÃO CRÍTICA - Salvando isPaidUser:", {
        valorOriginal: data.user.isPaidUser,
        tipoOriginal: typeof data.user.isPaidUser,
        valorConvertido: isPaidUserBoolean,
        tipoConvertido: typeof isPaidUserBoolean
      });
      
      // Verificar se foi armazenado corretamente
      const storedIsPaidUser = localStorageManager.get("isPaidUser");
      const storedUserData = localStorageManager.getUserData();
      
      console.log("✅ Dados do usuário atualizados no refresh:", {
        user: data.user.full_name || data.user.username,
        isPaidUser: data.user.isPaidUser,
        previousStatus: previousPremiumStatus,
        storedIsPaidUser: storedIsPaidUser,
        storedUserIsPaid: storedUserData?.isPaidUser,
        statusChanged: previousPremiumStatus !== data.user.isPaidUser
      });

      // Se o status premium mudou, forçar refresh total da página
      if (previousPremiumStatus !== data.user.isPaidUser) {
        console.log("🔄 STATUS PREMIUM MUDOU! Forçando refresh da página...");
        console.log(`Status anterior: ${previousPremiumStatus} → Novo status: ${data.user.isPaidUser}`);
        
        // Disparar evento imediatamente para componentes
        console.log("🔔 Disparando evento de mudança de status premium...");
        eventEmitter.emit(EVENTS.PREMIUM_STATUS_CHANGED, {
          isPaidUser: data.user.isPaidUser,
          previousStatus: previousPremiumStatus,
          source: 'refresh_token'
        });
        
        // Criar notificação simples
        const statusText = data.user.isPaidUser ? "PREMIUM ATIVADO!" : "PREMIUM DESATIVADO";
        const bgColor = data.user.isPaidUser ? "#10B981" : "#F59E0B";
        const emoji = data.user.isPaidUser ? "👑" : "📝";
        
        // Mostrar notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white;
          padding: 16px 24px; border-radius: 8px; font-weight: 600; z-index: 10000;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: system-ui, sans-serif;
          max-width: 350px;
        `;
        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">${emoji}</span>
            <div>
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${statusText}</div>
              <div style="font-size: 13px; opacity: 0.9;">Recarregando página em 2 segundos...</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Forçar refresh da página após 2 segundos
        setTimeout(() => {
          console.log("🔄 Executando refresh da página...");
          window.location.reload();
        }, 2000);
        
        // Remover notificação após 3 segundos (caso algo dê errado)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
        
        return; // Parar execução aqui pois a página será recarregada
      }

      // Emitir eventos apenas se não houve mudança de status premium
      eventEmitter.emit(EVENTS.USER_DATA_UPDATED, {
        oldData: previousUserData,
        newData: data.user,
        premiumStatusChanged: false
      });

      eventEmitter.emit(EVENTS.AUTH_TOKEN_REFRESHED, {
        access: data.access,
        refresh: data.refresh,
        user: data.user
      });
      
    } else {
      console.warn("⚠️ Refresh token não retornou dados do usuário");
    }
  }

  /**
   * Processar logout
   */
  private handleLogoutResponse(): void {
    console.log("🚪 Processando logout...");
    localStorageManager.clearAuthData();
    // Limpar também dados premium
    localStorageManager.remove("isPaidUser");
    console.log("✅ Dados de autenticação removidos");
  }
}

// Instância singleton
export const responseParms = ResponseParms.getInstance();

export default ResponseParms;