import { localStorageManager } from '@/lib/localStorage';
import { eventEmitter } from '@/lib/eventEmitter';
import { getApiKey } from '@/lib/apiKeyUtils';
import type { CredentialResponse, PromptMomentNotification } from "@/types/google";

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
  tokens?: {
    access: string;
    refresh: string;
  };
  // Campos adicionais que podem estar presentes na resposta
  message?: string;
  status?: string;
  statusCode?: number;
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
console.log("Fallback backend URL: http://127.0.0.1:5000");

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
    // Formato esperado pelo backend oauth_[random]
    const randomString = Math.random().toString(36).substring(2, 15);
    const state = `oauth_${randomString}`;
    console.log("🔐 Estado OAuth gerado:", state);
    return state;
  }

  private static storeState(state: string): void {
    sessionStorage.setItem("oauth_state", state);
    console.log("💾 Estado OAuth armazenado:", state);
    
    // Armazenar também partes do estado que o backend pode modificar
    if (state.startsWith("oauth_")) {
      const baseState = state.substring(6); // Remove o prefixo "oauth_"
      sessionStorage.setItem("oauth_base_state", baseState);
      console.log("💾 Base do estado armazenada:", baseState);
    }
  }

  private static validateState(state: string): boolean {
    const storedState = sessionStorage.getItem("oauth_state");
    const baseState = sessionStorage.getItem("oauth_base_state");
    
    console.log("🔐 Validando estado OAuth:", { 
      storedState,
      baseState,
      receivedState: state
    });
    
    // Verificação direta - caso perfeito
    if (storedState === state) {
      console.log("✅ Estado OAuth validado diretamente");
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_base_state");
      return true;
    }
    
    // Verificação para quando o backend modifica o state (comum)
    if (state && storedState) {
      // Caso 1: O backend adicionou um prefixo ao nosso state
      if (state.includes(storedState)) {
        console.log("✅ Estado OAuth validado: o backend incluiu nosso state");
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_base_state");
        return true;
      }
      
      // Caso 2: O backend usou nosso baseState com prefixo oauth_oauth_
      if (baseState && state.includes(`oauth_oauth_${baseState}`)) {
        console.log("✅ Estado OAuth validado: prefixo duplo do backend");
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_base_state");
        return true;
      }
      
      // Caso 3: O backend modificou completamente, mas manteve parte do nosso state original
      if (storedState.startsWith("oauth_") && state.includes(storedState.substring(6))) {
        console.log("✅ Estado OAuth validado: encontrado parte do state original");
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("oauth_base_state");
        return true;
      }
    }
    
    // 🚨 BYPASS REMOVIDO POR SEGURANÇA
    // O bypass de desenvolvimento foi removido para prevenir vulnerabilidades em produção
    // Estados OAuth devem sempre ser validados corretamente
    
    // Estado inválido
    console.error("❌ Estado OAuth inválido:", { storedState, baseState, receivedState: state });
    return false;
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
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
      console.log("🎯 Backend URL:", backendUrl);
      
      // Construir parâmetros com mais informações
      const deviceId = `${navigator.platform}-${Math.random().toString(36).substring(2, 10)}`.substring(0, 40);
      const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
      
      const signinParams = new URLSearchParams({
        client_id: OAUTH_CONFIG.google.clientId,
        redirect_uri: `${window.location.origin}/auth/callback?flowName=GeneralOAuthFlow`,
        response_type: 'code',
        scope: 'email profile openid',
        login_context: 'signin',
        return_to: `${window.location.origin}/dashboard`,
        error_callback: `${window.location.origin}/auth/error`,
        app_version: appVersion,
        locale: navigator.language,
        device_id: deviceId,
        access_type: 'offline',
        prompt: 'consent',
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
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
      console.log("🎯 Backend URL:", backendUrl);
      
      // Enviar código para o backend processar
      console.log("📤 Enviando código para processamento no backend...");
      console.log("📤 Redirect URI:", window.location.origin + '/auth/callback?flowName=GeneralOAuthFlow');
      
      // Adicionar mais informações ao corpo da requisição para diagnóstico
      const requestBody = {
        code,
        state,
        redirectUri: window.location.origin + '/auth/callback?flowName=GeneralOAuthFlow',
        clientInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timestamp: new Date().toISOString()
        }
      };
      
      const response = await fetch(`${backendUrl}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': getApiKey(),
        },
        body: JSON.stringify(requestBody),
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
        hasDirectTokens: !!(data.access && data.refresh),
        hasNestedTokens: !!(data.tokens?.access && data.tokens?.refresh)
      });

      // Capturar estrutura exata da resposta para diagnóstico (removendo tokens sensíveis)
      const responseStructure = { ...data };
      if (responseStructure.access) responseStructure.access = "[TOKEN PRESENT]";
      if (responseStructure.refresh) responseStructure.refresh = "[TOKEN PRESENT]";
      if (responseStructure.tokens) {
        responseStructure.tokens = {
          access: responseStructure.tokens.access ? "[TOKEN PRESENT]" : undefined,
          refresh: responseStructure.tokens.refresh ? "[TOKEN PRESENT]" : undefined
        };
      }
      console.log("📋 Estrutura da resposta:", JSON.stringify(responseStructure, null, 2));
      
      // Processar tokens em ambos os formatos possíveis
      // Formato 1: Tokens diretos no objeto raiz
      if (data.access) {
        console.log("🔑 Armazenando token de acesso (formato direto)");
        try {
          localStorageManager.setAuthToken(data.access);
          console.log("✅ Token de acesso (direto) armazenado com sucesso");
        } catch (e) {
          console.error("❌ Erro ao armazenar token de acesso (direto):", e);
        }
      }
      
      if (data.refresh) {
        console.log("🔄 Armazenando token de refresh (formato direto)");
        try {
          localStorageManager.setRefreshToken(data.refresh);
          console.log("✅ Token de refresh (direto) armazenado com sucesso");
        } catch (e) {
          console.error("❌ Erro ao armazenar token de refresh (direto):", e);
        }
      }
      
      // Formato 2: Tokens aninhados no objeto 'tokens'
      if (data.tokens) {
        if (data.tokens.access) {
          console.log("🔑 Armazenando token de acesso (formato aninhado)");
          try {
            localStorageManager.setAuthToken(data.tokens.access);
            console.log("✅ Token de acesso (aninhado) armazenado com sucesso");
          } catch (e) {
            console.error("❌ Erro ao armazenar token de acesso (aninhado):", e);
          }
        }
        
        if (data.tokens.refresh) {
          console.log("🔄 Armazenando token de refresh (formato aninhado)");
          try {
            localStorageManager.setRefreshToken(data.tokens.refresh);
            console.log("✅ Token de refresh (aninhado) armazenado com sucesso");
          } catch (e) {
            console.error("❌ Erro ao armazenar token de refresh (aninhado):", e);
          }
        }
      }
      
      // Armazenar dados do usuário
      if (data.user) {
        console.log("👤 Armazenando dados do usuário");
        try {
          localStorageManager.setUserData(data.user);
          console.log("✅ Dados do usuário armazenados com sucesso");
        } catch (e) {
          console.error("❌ Erro ao armazenar dados do usuário:", e);
        }
      }

      // Verificar se os tokens foram armazenados corretamente
      const authToken = localStorageManager.getAuthToken();
      const refreshToken = localStorageManager.getRefreshToken();
      const userData = localStorageManager.getUserData();
      
      console.log("🔍 Verificação final dos dados armazenados:", {
        authToken: authToken ? "Presente" : "Ausente",
        refreshToken: refreshToken ? "Presente" : "Ausente",
        userData: userData ? "Presente" : "Ausente"
      });

      // Emitir evento de login bem-sucedido
      if (data.success && authToken) {
        console.log("🎉 Login bem-sucedido! Emitindo evento...");
        
        // Emitir evento para o sistema de eventos
        try {
          eventEmitter.emit('auth:login:success', { user: data.user });
          console.log("✅ Evento emitido pelo eventEmitter");
        } catch (e) {
          console.warn("⚠️ Erro ao emitir evento pelo eventEmitter:", e);
        }
        
        // Emitir também como evento DOM para maior compatibilidade
        try {
          window.dispatchEvent(new CustomEvent('auth:login:success', { 
            detail: { user: data.user }
          }));
          console.log("✅ Evento DOM de autenticação também disparado");
        } catch (e) {
          console.warn("⚠️ Erro ao disparar evento DOM:", e);
        }
      }

      // Adicionar informações de diagnóstico à resposta
      const finalResponse = {
        ...data,
        _debug: {
          tokensArmazenados: {
            access: !!authToken,
            refresh: !!refreshToken
          },
          dadosUsuarioArmazenados: !!userData
        }
      };
      
      return finalResponse;
    } catch (error) {
      console.error('❌ Erro ao processar callback do Google:', error);
      // Emitir evento de erro
      eventEmitter.emit('auth:login:error', { error });
      throw error;
    }
  }

  static async handleGoogleLogin(params: GoogleLoginParams): Promise<GoogleCallbackResponse> {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
      
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

  static async handleOAuthCallback(): Promise<{ success: boolean; user?: any; error?: string; access?: string; refresh?: string; tokens?: {access: string; refresh: string} }> {
    try {
      console.log("🔍 URL completa do callback:", window.location.href);
      
      // Tentar extrair parâmetros tanto da URL regular quanto do path malformado
      const fullUrl = window.location.href;
      
      // Verificar especificamente o problema de callbackflowName= sem o ? separador
      let urlToProcess = fullUrl;
      if (fullUrl.includes('callbackflowName=')) {
        console.log("🔧 Detectado URL malformado com callbackflowName=");
        urlToProcess = fullUrl.replace('callbackflowName=', 'callback?flowName=');
        console.log("🔧 URL corrigida:", urlToProcess);
      }
      
      const url = new URL(urlToProcess);
      const urlParams = new URLSearchParams(url.search);
      
      let code = urlParams.get("code");
      let state = urlParams.get("state");
      let error = urlParams.get("error");
      
      // Verificar se temos os parâmetros esperados
      console.log("🔍 Parâmetros iniciais de callback:", {
        code: code ? `${code.substring(0, 10)}...` : null,
        state,
        error,
        flowName: urlParams.get("flowName"),
        allParams: Object.fromEntries(urlParams.entries())
      });

      if (error) {
        console.error("❌ Erro OAuth:", error);
        return { success: false, error: `Erro OAuth: ${error}` };
      }

      if (!code || !state) {
        console.error("⚠️ Tentando extrair parâmetros de outra forma...");
        
        // Tentativa alternativa de extrair o código da URL completa com regex mais robusta
        const codeMatch = fullUrl.match(/[?&]code=([^&#]+)/);
        const stateMatch = fullUrl.match(/[?&]state=([^&#]+)/);
        
        if (codeMatch && codeMatch[1]) code = decodeURIComponent(codeMatch[1]);
        if (stateMatch && stateMatch[1]) state = decodeURIComponent(stateMatch[1]);
        
        console.log("🔍 Parâmetros extraídos manualmente:", {
          code: code ? `${code.substring(0, 10)}...` : null,
          state
        });
        
        // Última tentativa - verificar se o código está embutido no pathname (caso peculiar)
        if (!code) {
          const pathSegments = url.pathname.split('/');
          for (let i = 0; i < pathSegments.length; i++) {
            if (pathSegments[i].startsWith('code=')) {
              code = decodeURIComponent(pathSegments[i].substring(5));
              console.log("🔍 Código encontrado no pathname:", code.substring(0, 10) + '...');
              break;
            }
          }
        }
        
        if (!code || !state) {
          console.error("❌ Parâmetros OAuth ausentes mesmo após extração manual");
          return { success: false, error: "Parâmetros de autenticação ausentes" };
        }
      }

      console.log("🔄 Processando callback OAuth...");
      const tokenData = await this.exchangeCodeForToken(code, state);
      
      // Verificar e processar os tokens que vieram da API
      console.log("✅ Verificando dados de tokens recebidos:", {
        hasDirectTokens: !!(tokenData.access && tokenData.refresh),
        hasNestedTokens: !!(tokenData.tokens?.access && tokenData.tokens?.refresh),
        hasUserData: !!tokenData.user
      });
      
      // Processar tokens nos dois formatos possíveis que o backend pode retornar
      
      // 1. Formato direto (tokens no nível raiz)
      if (tokenData.access) {
        console.log("🔑 Armazenando token de acesso (formato direto)");
        localStorageManager.setAuthToken(tokenData.access);
      }
      
      if (tokenData.refresh) {
        console.log("🔄 Armazenando token de refresh (formato direto)");
        localStorageManager.setRefreshToken(tokenData.refresh);
      }
      
      // 2. Formato aninhado (dentro do objeto 'tokens')
      if (tokenData.tokens) {
        if (tokenData.tokens.access) {
          console.log("🔑 Armazenando token de acesso (formato aninhado)");
          localStorageManager.setAuthToken(tokenData.tokens.access);
        }
        if (tokenData.tokens.refresh) {
          console.log("🔄 Armazenando token de refresh (formato aninhado)");
          localStorageManager.setRefreshToken(tokenData.tokens.refresh);
        }
      }
      
      // Verificar se os tokens foram realmente armazenados
      const storedAuthToken = localStorageManager.getAuthToken();
      const storedRefreshToken = localStorageManager.getRefreshToken();
      
      console.log("🔍 Verificação de tokens armazenados:", {
        authTokenArmazenado: !!storedAuthToken,
        refreshTokenArmazenado: !!storedRefreshToken
      });
      
      // Se temos tokens armazenados, garantir que a operação foi bem-sucedida
      if (storedAuthToken && tokenData.user) {
        console.log("✅ Tokens e dados do usuário verificados com sucesso");
        return { 
          success: true, 
          user: tokenData.user 
        };
      } else if (storedAuthToken) {
        // Se não recebemos dados do usuário, mas temos tokens, ainda é um sucesso parcial
        console.log("⚠️ Tokens recebidos, mas sem dados do usuário");
        return {
          success: true,
          user: null
        };
      }
      
      // Se chegou aqui, algo deu errado no processamento
      console.error("❌ Falha ao processar tokens de autenticação");
      return {
        success: false,
        error: "Falha ao processar dados de autenticação",
        access: undefined,
        refresh: undefined
      };
    } catch (error) {
      console.error("❌ Erro no callback OAuth:", error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export default OAuthService;
