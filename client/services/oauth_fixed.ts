import { localStorageManager } from "../lib/localStorage";
import { eventEmitter } from "../lib/eventEmitter";
import { getApiKey } from "../lib/apiKeyUtils";
import type { CredentialResponse, PromptMomentNotification } from "../types/google";

interface GoogleLoginParams {
  email: string;
  googleId: string;
  accessToken: string;
}

interface GoogleCallbackResponse {
  success: boolean;
  access?: string;
  refresh?: string;
  user?: any;
  isNewUser?: boolean;
  redirectTo?: string;
  error?: string;
}

interface DeviceInfo {
  platform: string;
  userAgent: string;
  language: string;
  deviceId: string;
}

// Configurações OAuth2
const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "460141148400-djs1tkkr0e4eneqmetf7gfsvotphutcu.apps.googleusercontent.com",
    scope: "openid email profile",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  }
};

// Debug: verificar se as variáveis de ambiente estão carregando
console.log("🔍 Debug Environment Variables:");
console.log("VITE_GOOGLE_CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log("OAUTH_CONFIG.google.clientId:", OAUTH_CONFIG.google.clientId);
console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);
console.log("Fallback backend URL: http://127.0.0.1:8000");

export class OAuthService {
  private static googleSigninPaths: string[] = [
    "/api/auth/google/signin",
    "/api/auth/google/signin/",
    "/auth/google/signin",
    "/auth/google/signin/",
    "/services/api/auth/google/signin/",
    "/api/api/auth/google/signin",
    "/api/api/auth/google/signin/",
  ];

  private static generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private static storeState(state: string): void {
    sessionStorage.setItem("oauth_state", state);
  }

  private static validateState(state: string): boolean {
    const storedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");
    return storedState === state;
  }

  static async initiateGoogleAuth(): Promise<void> {
    console.log("🚀 Iniciando autenticação com Google Identity Services (popup)...");
    
    try {
      // Obter o client_id do ambiente e garantir que não está vazio
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || OAUTH_CONFIG.google.clientId;
      
      if (!clientId || clientId.trim() === '') {
        console.error("❌ Client ID não encontrado para autenticação do Google");
        console.log("🔄 Tentando fluxo alternativo...");
        return this.initiateAlternativeGoogleAuth();
      }
      
      console.log("🔑 Usando Client ID:", clientId);
      
      // Verificar se o Google Identity Services está disponível
      if (!window.google?.accounts?.id) {
        console.log("❌ Google Identity Services não disponível, usando fluxo alternativo...");
        return this.initiateAlternativeGoogleAuth();
      }
      
      // Cancelar qualquer sessão anterior
      try {
        window.google.accounts.id.cancel();
        console.log("🗑️ Sessão anterior do Google cancelada");
      } catch (e) {
        console.warn("⚠️ Falha ao cancelar sessão anterior do Google", e);
      }
      
      // Inicializar o Google Identity Services com o client_id correto
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: CredentialResponse) => {
          if (response && response.credential) {
            console.log("✅ Token recebido do Google Identity Services");
            try {
              await this.handleGoogleLogin({
                email: '',  // Será preenchido pelo backend
                googleId: '', // Será preenchido pelo backend
                accessToken: response.credential
              });
            } catch (error) {
              console.error("❌ Erro ao processar token:", error);
            }
          } else {
            console.error("❌ Resposta inválida do Google Identity Services");
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        state_cookie_domain: window.location.hostname,
      });
      
      // Forçar exibição do popup
      window.google.accounts.id.prompt((notification: PromptMomentNotification) => {
        if (notification.isDisplayed()) {
          console.log("✅ Popup do Google exibido com sucesso");
        } else if (notification.isNotDisplayed()) {
          console.log("❌ Popup não exibido:", notification.getNotDisplayedReason());
          console.log("🔄 Usando fluxo alternativo...");
          this.initiateAlternativeGoogleAuth();
        } else if (notification.isSkippedMoment()) {
          console.log("⏭️ Popup foi pulado:", notification.getSkippedReason());
          console.log("🔄 Usando fluxo alternativo...");
          this.initiateAlternativeGoogleAuth();
        } else if (notification.isDismissedMoment()) {
          console.log("❌ Popup foi dispensado:", notification.getDismissedReason());
        }
      });
      
    } catch (error) {
      console.error("❌ Erro ao inicializar Google Identity Services:", error);
      console.log("🔄 Usando fluxo alternativo devido ao erro...");
      return this.initiateAlternativeGoogleAuth();
    }
  }

  static async initiateAlternativeGoogleAuth(): Promise<void> {
    console.log("🔄 Iniciando fluxo alternativo OAuth2...");
    
    try {
      // Gerar e armazenar state
      const state = this.generateState();
      this.storeState(state);
      console.log("🔐 Estado OAuth gerado e armazenado");
      
      // Obter a URL do backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
      console.log("🎯 Backend URL:", backendUrl);
      
      // Construir parâmetros com mais informações
      const deviceId = `${navigator.platform}-${Math.random().toString(36).substring(2, 10)}`.substring(0, 40);
      const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
      
      const signinParams = new URLSearchParams({
        login_context: 'signin',
        return_to: `${window.location.origin}/dashboard`,
        error_callback: `${window.location.origin}/auth/error`,
        app_version: appVersion,
        locale: navigator.language,
        device_id: deviceId,
        access_type: 'offline',
        prompt: 'consent select_account',
        state,
        platform: navigator.platform,
        screen_size: `${window.screen.width}x${window.screen.height}`,
        color_depth: window.screen.colorDepth.toString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'direct'
      });

      console.log("📝 Parâmetros de autenticação configurados");

      // Obter URL de autenticação do backend
      const response = await fetch(`${backendUrl}/auth/unified/google/signin/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getApiKey(),
        },
        body: JSON.stringify({
          params: Object.fromEntries(signinParams.entries()),
          deviceInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language
          }
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro ao preparar autenticação:", errorText);
        throw new Error(`Falha ao preparar autenticação: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.authUrl) {
        throw new Error('URL de autenticação não fornecida pelo backend');
      }

      console.log("🚀 URL de autenticação obtida do backend");

      // Configurar e abrir popup
      const popupWidth = 500;
      const popupHeight = 600;
      const left = window.screen.width / 2 - popupWidth / 2;
      const top = window.screen.height / 2 - popupHeight / 2;

      const popupWindow = window.open(
        data.authUrl,
        'google-oauth-popup',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
      );
      
      if (!popupWindow) {
        console.error("❌ Popup foi bloqueado pelo navegador");
        throw new Error("Popup bloqueado pelo navegador. Permita popups para este site.");
      }

      console.log("✅ Popup de autenticação aberto com sucesso");

      // Monitorar o popup
      return new Promise((resolve, reject) => {
        // Variáveis para controle de limpeza
        let timeoutId: number;
        let checkClosedInterval: number;

        const cleanup = () => {
          if (checkClosedInterval) window.clearInterval(checkClosedInterval);
          if (timeoutId) window.clearTimeout(timeoutId);
        };

        // Verificar se o popup foi fechado
        checkClosedInterval = window.setInterval(() => {
          if (popupWindow?.closed) {
            cleanup();
            console.log("🔄 Popup foi fechado");
            resolve();
          }
        }, 1000);

        // Timeout após 5 minutos
        timeoutId = window.setTimeout(() => {
          if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
            cleanup();
            console.log("⏰ Timeout do popup");
            reject(new Error("Timeout na autenticação"));
          }
        }, 300000);

        // Adicionar listener de mensagem do popup
        const messageHandler = (event: MessageEvent) => {
          // Verificar origem
          const backendOrigin = new URL(backendUrl).origin;
          if (event.origin !== backendOrigin && event.origin !== window.location.origin) {
            console.warn("⚠️ Mensagem recebida de origem não confiável:", event.origin);
            return;
          }

          // Processar mensagem
          if (event.data?.type === 'oauth_success') {
            cleanup();
            window.removeEventListener('message', messageHandler);
            popupWindow.close();
            console.log("🎉 Autenticação bem-sucedida via postMessage");
            resolve(event.data);
          } else if (event.data?.type === 'oauth_error') {
            cleanup();
            window.removeEventListener('message', messageHandler);
            popupWindow.close();
            console.error("❌ Erro na autenticação:", event.data.error);
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageHandler);
      });

    } catch (error) {
      console.error("❌ Erro no fluxo alternativo de autenticação:", error);
      eventEmitter.emit('auth:login:error', { error });
      throw error;
    }
  }

  static async initiateGoogleSignIn(): Promise<void> {
    return this.initiateGoogleAuth();
  }

  static async processGoogleCallback(code: string, state: string): Promise<GoogleCallbackResponse> {
    try {
      console.log("🔄 Processando callback do Google com:", {
        code: code.substring(0, 10) + '...',
        state: state
      });

      // Validar state para prevenir CSRF
      if (!this.validateState(state)) {
        console.error("❌ Estado OAuth inválido");
        throw new Error('Estado OAuth inválido - possível ataque CSRF');
      }

      // Obter a URL do backend
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
      console.log("🎯 Backend URL:", backendUrl);
      
      // Enviar código para o backend processar
      console.log("📤 Enviando código para processamento no backend...");
      const response = await fetch(`${backendUrl}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getApiKey(),
        },
        body: JSON.stringify({
          code,
          state,
          redirectUri: window.location.origin + '/auth/callback'
        }),
        credentials: 'include'
      });

      console.log("📥 Status da resposta do backend:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro do backend:", errorText);
        throw new Error(`Backend retornou ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Dados recebidos do backend:", {
        success: data.success,
        hasUser: !!data.user,
        hasTokens: !!(data.access && data.refresh)
      });

      // Se recebemos tokens, armazenar
      if (data.access) {
        console.log("🔑 Armazenando token de acesso");
        localStorageManager.setAuthToken(data.access);
      }
      if (data.refresh) {
        console.log("🔄 Armazenando token de refresh");
        localStorageManager.setRefreshToken(data.refresh);
      }
      if (data.user) {
        console.log("👤 Armazenando dados do usuário");
        localStorageManager.setUserData(data.user);
      }

      // Emitir evento de login bem-sucedido
      if (data.success) {
        console.log("🎉 Login bem-sucedido! Emitindo evento...");
        eventEmitter.emit('auth:login:success', { user: data.user });
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao processar callback do Google:', error);
      // Emitir evento de erro
      eventEmitter.emit('auth:login:error', { error });
      throw error;
    }
  }

  static async handleGoogleLogin(params: GoogleLoginParams): Promise<GoogleCallbackResponse> {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
      
      console.log("🔄 Iniciando login com credenciais Google:", {
        email: params.email,
        googleId: params.googleId.substring(0, 10) + '...'
      });

      const response = await fetch(`${backendUrl}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getApiKey(),
        },
        body: JSON.stringify({
          ...params,
          deviceInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            deviceId: `${navigator.platform}-${Math.random().toString(36).substr(2, 8)}`
          }
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro no login:", errorText);
        throw new Error(`Login falhou: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Resposta do login:", {
        success: data.success,
        hasTokens: !!(data.access && data.refresh)
      });
      
      if (data.success) {
        console.log("🎉 Login bem-sucedido!");
        // Armazenar tokens e dados do usuário
        if (data.access) {
          console.log("🔑 Armazenando token de acesso");
          localStorageManager.setAuthToken(data.access);
        }
        if (data.refresh) {
          console.log("🔄 Armazenando token de refresh");
          localStorageManager.setRefreshToken(data.refresh);
        }
        if (data.user) {
          console.log("👤 Armazenando dados do usuário");
          localStorageManager.setUserData(data.user);
        }
        
        // Emitir evento de login bem-sucedido
        console.log("📢 Emitindo evento de login bem-sucedido");
        eventEmitter.emit('auth:login:success', { 
          user: data.user,
          isNewUser: data.isNewUser,
          redirectTo: data.redirectTo || '/dashboard'
        });
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no processo de login Google:', error);
      eventEmitter.emit('auth:login:error', { error });
      throw error;
    }
  }

  static async exchangeCodeForToken(code: string, state: string): Promise<GoogleCallbackResponse> {
    return this.processGoogleCallback(code, state);
  }

  static async handleOAuthCallback(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      if (error) {
        console.error("❌ Erro OAuth:", error);
        return { success: false, error: `Erro OAuth: ${error}` };
      }

      if (!code || !state) {
        console.error("❌ Parâmetros OAuth ausentes");
        return { success: false, error: "Parâmetros de autenticação ausentes" };
      }

      console.log("🔄 Processando callback OAuth...");
      const tokenData = await this.exchangeCodeForToken(code, state);

      return { success: true, user: tokenData.user };
    } catch (error) {
      console.error("❌ Erro no callback OAuth:", error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export default OAuthService;
