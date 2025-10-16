import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { localStorageManager } from "../lib/localStorage";
import { authCookies, userPreferences } from "../lib/cookies";
import { cacheManager, CACHE_KEYS } from "../lib/cache";
import { clearAllAuthState } from "../lib/authUtils";
import { getApiKey } from "../lib/apiKeyUtils";
import { authenticatedFetch } from "../lib/authenticatedFetch";
import {
  login as loginRules,
  register as registerRules,
  refreshTokenApi,
  getUserData,
} from "./Rules";
import { eventEmitter, EVENTS } from "../lib/eventEmitter";

// Configuração do ambiente
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Interfaces
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  isPaidUser?: boolean;
  subscription_type: "free" | "premium";
  subscription_expires?: string;
  profile_image?: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  about_me?: string;
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isLoggingOut: boolean;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: any }>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  isPremiumUser: () => boolean;
  refreshPremiumStatus: () => void;
  premiumStatusVersion: number;
  revalidateAuth: () => Promise<void>; // Novo método para revalidar autenticação
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

// Valor padrão para AuthContext
const defaultAuthValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  isLoggingOut: false,
  login: async () => false,
  logout: () => {},
  register: async () => ({ success: false, error: "Context not initialized" }),
  refreshToken: async () => false,
  hasPermission: () => false,
  isPremiumUser: () => false,
  refreshPremiumStatus: () => {},
  premiumStatusVersion: 0,
  revalidateAuth: async () => {}, // Método padrão vazio
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Validador de token JWT
 */
const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Estado para forçar rerender quando dados premium mudam
  const [premiumStatusVersion, setPremiumStatusVersion] = useState(0);
  // Estado para forçar revalidação manual de autenticação
  const [revalidationCounter, setRevalidationCounter] = useState(0);

  // Sistema de logout automático por inatividade (5 minutos)
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos em millisegundos

    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Só iniciar timer se usuário estiver autenticado
      if (isAuthenticated) {
        inactivityTimer = setTimeout(() => {
          console.log("⏰ Logout automático por inatividade (5 minutos)");
          logout();
        }, INACTIVITY_TIME);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Adicionar listeners para detectar atividade
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Iniciar timer quando usuário está autenticado
    if (isAuthenticated) {
      resetInactivityTimer();
    }

    // Cleanup
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [isAuthenticated]);

  // Verificar se estamos voltando de um redirecionamento OAuth
  useEffect(() => {
    const oauthRedirect = sessionStorage.getItem('auth_redirect_attempted');
    const authRedirectCompleted = sessionStorage.getItem('auth_redirect_completed');
    
    if (oauthRedirect || authRedirectCompleted) {
      console.log("🔄 AuthContext: Detectado redirecionamento OAuth:", { 
        redirect_attempted: oauthRedirect,
        redirect_completed: authRedirectCompleted 
      });
      
      // Forçar revalidação do estado de autenticação
      setRevalidationCounter(prev => prev + 1);
      
      // Limpar flags de redirecionamento para não reprocessar
      sessionStorage.removeItem('auth_redirect_attempted');
      sessionStorage.removeItem('auth_redirect_completed');
      
      // Verificar e corrigir possíveis inconsistências nos dados de autenticação
      const token = localStorageManager.getAuthToken();
      const userData = localStorageManager.getUserData();
      const isPaidUserValue = localStorageManager.get("isPaidUser");
      
      console.log("🔍 Verificando dados de autenticação pós-OAuth:", {
        token: !!token,
        userData: !!userData,
        isPaidUser: isPaidUserValue,
        isPaidUserType: typeof isPaidUserValue
      });
      
      // Corrigir inconsistência no isPaidUser se necessário
      if (userData && (isPaidUserValue === null || isPaidUserValue === undefined)) {
        console.log("⚠️ Corrigindo isPaidUser ausente...");
        const correctedValue = Boolean(userData.isPaidUser);
        localStorageManager.set("isPaidUser", correctedValue);
        console.log("✅ isPaidUser corrigido:", correctedValue);
      }
    }
  }, []);

  // Listener para eventos de login do OAuth e revalidação
  useEffect(() => {
    const handleLoginSuccess = (event: CustomEvent) => {
      try {
        console.log("🔔 AuthContext: Evento de login bem-sucedido detectado (window event)");
        
        // Buscar dados do localStorage
        const token = localStorageManager.getAuthToken();
        const userData = localStorageManager.getUserData();
        
        if (token && userData) {
          console.log("🔔 AuthContext: Atualizando estado com dados de login OAuth");
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          console.warn("🔔 AuthContext: Evento de login recebido, mas dados ausentes no localStorage");
          // Tentar revalidar autenticação após um pequeno atraso
          setTimeout(() => {
            checkManualAuth();
          }, 300);
        }
      } catch (error) {
        console.error("🔔 AuthContext: Erro ao processar evento de login:", error);
      }
    };
    
    // Handler para eventos emitidos pelo eventEmitter
    const handleEventEmitterLogin = (data: any) => {
      try {
        console.log("🔔 AuthContext: Evento de login detectado via eventEmitter");
        
        // Buscar dados do localStorage 
        const token = localStorageManager.getAuthToken();
        const userData = localStorageManager.getUserData();
        
        // Se não houver dados no localStorage mas recebemos no evento, use-os
        const userFromEvent = data?.user;
        
        if (token && (userData || userFromEvent)) {
          // Garantir que userData está armazenado
          if (userFromEvent && !userData) {
            console.log("🔄 AuthContext: Armazenando dados do usuário do evento");
            localStorageManager.setUserData(userFromEvent);
          }
          
          const finalUserData = userData || userFromEvent;
          console.log("✅ AuthContext: Atualizando estado com dados do evento eventEmitter");
          setUser(finalUserData);
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          console.warn("🔔 AuthContext: Evento eventEmitter recebido, mas dados insuficientes");
          setTimeout(() => {
            checkManualAuth();
          }, 300);
        }
      } catch (error) {
        console.error("❌ AuthContext: Erro ao processar evento eventEmitter:", error);
      }
    };
    
    // Handler para solicitações de revalidação
    const handleRevalidationRequest = (event: CustomEvent) => {
      try {
        const source = event.detail?.source || 'desconhecido';
        console.log(`🔄 AuthContext: Solicitação de revalidação recebida de ${source}`);
        
        // Executar revalidação
        revalidateAuth();
      } catch (error) {
        console.error("❌ AuthContext: Erro ao processar solicitação de revalidação:", error);
      }
    };
    
    // Função para verificar autenticação manualmente
    const checkManualAuth = () => {
      try {
        const token = localStorageManager.getAuthToken();
        const userData = localStorageManager.getUserData();
        console.log("🔎 AuthContext: Verificação manual de autenticação", { 
          token: !!token, 
          userData: !!userData 
        });
        
        if (token && userData) {
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          console.log("✅ AuthContext: Autenticação manual bem-sucedida");
        }
      } catch (e) {
        console.error("❌ AuthContext: Erro na verificação manual", e);
      }
    };
    
    // Adicionar listeners para eventos
    window.addEventListener('auth:login:success', handleLoginSuccess as EventListener);
    window.addEventListener('auth:request:revalidation', handleRevalidationRequest as EventListener);
    eventEmitter.on('auth:login:success', handleEventEmitterLogin);
    
    // Verificar manualmente se já estamos autenticados
    checkManualAuth();
    
    // Limpar listeners quando componente for desmontado
    return () => {
      window.removeEventListener('auth:login:success', handleLoginSuccess as EventListener);
      window.removeEventListener('auth:request:revalidation', handleRevalidationRequest as EventListener);
      eventEmitter.off('auth:login:success', handleEventEmitterLogin);
    };
  }, [revalidationCounter]);

  // Verificar status de autenticação no carregamento
  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check if localStorage is not available (SSR)
      if (typeof localStorage === "undefined") {
        setLoading(false);
        return;
      }

      // Skip auth check for public pages
      const currentPath = window.location.pathname;
      const publicPages = [
        "/",
        "/home",
        "/market",
        "/login",
        "/signup",
        "/demo",
        "/public",
        "/auth/callback", // Adicionar página de callback como pública
      ];
      const isPublicPage =
        publicPages.some((page) => currentPath.startsWith(page)) ||
        currentPath.includes("/public");

      if (isPublicPage) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorageManager.getAuthToken();
        const refreshTokenValue = localStorageManager.getRefreshToken();
        const userData = localStorageManager.getUserData();

        if (token && userData && isTokenValid(token)) {
          // Token válido, configurar usuário
          console.log("✅ Token válido encontrado, configurando usuário...");
          console.log("📊 Status premium do usuário:", {
            isPaidUser: userData.isPaidUser,
            fromStorage: localStorageManager.get("isPaidUser")
          });
          
          setUser(userData);
          setIsAuthenticated(true);
          console.log(
            "✅ Usuário autenticado:",
            userData.username || userData.email,
          );
        } else if (refreshTokenValue && !isTokenValid(token)) {
          // Token expirado, tentar refresh usando Rules
          console.log("🔄 Token expirado, tentando refresh via Rules...");
          const refreshSuccess = await performTokenRefresh(refreshTokenValue);
          if (refreshSuccess) {
            // O refresh agora sempre retorna dados atualizados do usuário
            // Usar dados do localStorage que foram atualizados pelo refresh
            const updatedUserData = localStorageManager.getUserData();
            if (updatedUserData) {
              setUser(updatedUserData);
              setIsAuthenticated(true);
              // Notificar sobre mudança no status premium
              setPremiumStatusVersion(prev => prev + 1);
              console.log(
                "✅ Token renovado e dados do usuário atualizados:",
                updatedUserData.full_name || updatedUserData.username
              );
            } else {
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        clearAuthData();
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    // Limpar localStorage
    localStorageManager.clearAuthData();
    localStorageManager.remove("isPaidUser"); // Limpar status premium
    
    // Limpar cookies de autenticação
    authCookies.clearAuthTokens();
    
    // Limpar cache do usuário se houver
    if (user?.id) {
      cacheManager.clearUser(user.id);
    }
    
    // Limpar todos os dados relacionados do localStorage
    const keysToRemove = [
      'auth_token',
      'refresh_token', 
      'user_data',
      'user_permissions',
      'isPaidUser',
      'premium_status',
      'subscription_data',
      'last_activity',
      'session_data'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Limpar sessionStorage relacionado à autenticação
    const sessionKeysToRemove = [
      'oauth_state',
      'oauth_base_state', 
      'auth_redirect_attempted',
      'login_attempt'
    ];
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    setUser(null);
    setIsAuthenticated(false);
    
    console.log("🧹 Auth data, cookies, cache e dados temporários completamente limpos");
  };

  const performTokenRefresh = async (
    refreshTokenValue: string,
  ): Promise<boolean> => {
    try {
      console.log("🔄 Usando Rules para refresh token...");

      // Capturar status premium antes do refresh
      const premiumStatusBefore = localStorageManager.get("isPaidUser");
      console.log("📊 Status premium ANTES do refresh:", premiumStatusBefore);

      // Usar Rules para refresh token
      const refreshData = await refreshTokenApi(
        refreshTokenValue,
        "refreshToken",
      );

      console.log("🔍 Dados recebidos do refreshTokenApi:", refreshData);

      if (refreshData && refreshData.access) {
        // Verificar se o novo token é válido
        if (isTokenValid(refreshData.access)) {
          localStorageManager.setAuthToken(refreshData.access);

          // Atualizar refresh token se fornecido
          if (refreshData.refresh) {
            localStorageManager.setRefreshToken(refreshData.refresh);
          }

          // Verificar se status premium mudou após o refresh
          const premiumStatusAfter = localStorageManager.get("isPaidUser");
          
          console.log("📊 Status premium DEPOIS do refresh:", premiumStatusAfter);
          console.log("✅ Token refresh via Rules bem-sucedido");
          
          // Se o status premium mudou, a página já será recarregada pelo ResponseParms
          // Então não precisamos fazer nada aqui
          if (premiumStatusBefore !== premiumStatusAfter) {
            console.log("🔄 Status premium mudou durante refresh, página será recarregada...");
          }
          
          return true;
        }
      }

      console.warn("❌ Token refresh via Rules falhou");
      return false;
    } catch (error) {
      console.error("❌ Erro no refresh do token via Rules:", error);
      return false;
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Log com mais detalhes sobre a URL utilizada
      console.log("🔐 Iniciando login:", {
        username,
        backendUrl: BACKEND_URL,
        fullUrl: `${BACKEND_URL}/auth/login/`,
        environment: import.meta.env.MODE || 'development'
      });

      // Usar Rules para login
      const success = await loginRules(username, password, "login");
      console.log("📊 Resultado do login:", success);

      if (success) {
        // Verificar se dados foram armazenados
        const token = localStorageManager.getAuthToken();
        const userData = localStorageManager.getUserData();

        if (token && userData) {
          // Salvar tokens em cookies também para persistência
          authCookies.setAuthToken(token);
          
          // Salvar dados do usuário no cache
          cacheManager.setUserData(CACHE_KEYS.USER_PROFILE, userData, userData.id);
          
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          console.log("✅ Login bem-sucedido:", userData.username || userData.email);
          
          // Log de sucesso com mais detalhes
          console.log("🔑 Detalhes da sessão:", {
            userId: userData.id,
            premiumStatus: userData.subscription_type || "free",
            tokenValido: isTokenValid(token),
            tokenExpira: token ? JSON.parse(atob(token.split(".")[1])).exp : null,
            cookiesSalvos: true,
            cacheSalvo: true
          });
          
          return true;
        } else {
          console.error("❌ Dados não foram armazenados após login");
          setLoading(false);
          return false;
        }
      } else {
        console.error("❌ Login falhou - verifique URL e credenciais");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro de login:", error);
      console.error("📌 Verifique se a URL está correta:", `${BACKEND_URL}/auth/login/`);
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: any }> => {
    try {
      setLoading(true);
      console.log("📝 Iniciando registro via Rules:", {
        username: userData.username,
        email: userData.email,
      });

      // Usar Rules para registro
      const result = await registerRules(userData, "register");

      if (result.success) {
        // Verificar se dados foram armazenados (pode ter auto-login)
        const token = localStorageManager.getAuthToken();
        const user = localStorageManager.getUserData();

        if (token && user) {
          setUser(user);
          setIsAuthenticated(true);
          console.log(
            "✅ Registro via Rules com auto-login:",
            user.username || user.email,
          );
        } else {
          console.log("✅ Registro via Rules bem-sucedido, faça login");
        }

        setLoading(false);
        return { success: true };
      } else {
        console.error("❌ Registro via Rules falhou:", result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Erro de registro via Rules:", error);
      setLoading(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      };
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshTokenValue = localStorageManager.getRefreshToken();

    if (!refreshTokenValue) {
      console.warn("❌ Nenhum refresh token encontrado");
      return false;
    }

    return await performTokenRefresh(refreshTokenValue);
  };

  const revalidateAuth = async (): Promise<void> => {
    try {
      console.log("🔄 Revalidando autenticação...");
      const token = localStorageManager.getAuthToken();
      const userData = localStorageManager.getUserData();
      
      // Verificar dados locais primeiro
      if (token && userData) {
        console.log("✅ Dados locais encontrados, verificando validade do token");
        
        // Validar o token
        if (isTokenValid(token)) {
          console.log("✅ Token é válido por verificação local");
          setUser(userData);
          setIsAuthenticated(true);
          
          // Notificar outros componentes sobre revalidação bem-sucedida
          window.dispatchEvent(new CustomEvent('auth:revalidation:success', { 
            detail: { user: userData }
          }));
          
          // Ainda assim fazer verificação remota para garantir
          validateWithBackend(token).catch(err => {
            console.warn("⚠️ Verificação remota falhou, mas token é válido localmente:", err);
          });
          
          return;
        } else {
          console.log("⚠️ Token local expirado, tentando refresh...");
        }
      } else if (!token) {
        console.log("❌ Nenhum token encontrado - usuário não autenticado");
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Função interna para validação com backend
      async function validateWithBackend(tokenToValidate: string): Promise<boolean> {
        // Importante: usar 127.0.0.1 em vez de localhost para evitar problemas com cookies
        const backendUrl = (BACKEND_URL || 'http://127.0.0.1:5000').replace('localhost', '127.0.0.1');
        
        try {
          const profileResponse = await authenticatedFetch(`${backendUrl}/api/user/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenToValidate}`
            },
            credentials: 'include',
          });
  
          if (profileResponse.ok) {
            console.log("✅ Token verificado com sucesso via API de perfil");
            const updatedUserData = await profileResponse.json();
            setUser(updatedUserData);
            setIsAuthenticated(true);
            
            // Atualizar dados locais com informações frescas do servidor
            localStorageManager.setUserData(updatedUserData);
            
            // Notificar outros componentes
            window.dispatchEvent(new CustomEvent('auth:revalidation:success', { 
              detail: { user: updatedUserData }
            }));
            
            return true;
          } 
          return false;
        } catch (profileError) {
          console.error("⚠️ Erro ao validar token com API de perfil:", profileError);
          return false;
        }
      }
      
      // Se temos token mas não validamos localmente, tentar validar com backend
      if (token) {
        console.log("🔄 Validando token com backend...");
        const isValid = await validateWithBackend(token);
        if (isValid) return;
      }
      
      // Tentar refresh token como fallback
      const refreshTokenValue = localStorageManager.getRefreshToken();
      
      if (refreshTokenValue && (await performTokenRefresh(refreshTokenValue))) {
        console.log("✅ Token atualizado via refresh token");
        
        // Verificar novamente com backend após refresh
        const newToken = localStorageManager.getAuthToken();
        if (newToken) {
          await validateWithBackend(newToken);
        }
        
        return;
      }

      // Se chegou aqui e não conseguiu verificar ou atualizar o token, considerar inválido
      console.log("⚠️ Não foi possível validar nem atualizar o token");
      setIsAuthenticated(false);
      setUser(null);
      clearAllAuthState();
      
      // Notificar outros componentes
      window.dispatchEvent(new CustomEvent('auth:revalidation:failure'));
    } catch (error) {
      console.error("❌ Erro na revalidação:", error);
      setIsAuthenticated(false);
      setUser(null);
      clearAuthData();
      
      // Notificar outros componentes
      window.dispatchEvent(new CustomEvent('auth:revalidation:failure', { 
        detail: { error }
      }));
    }
  };

  const logout = async () => {
    console.log("🚪 Fazendo logout...");
    
    // Definir estado de logout em progresso
    setIsLoggingOut(true);
    setLoading(false); // Não mostrar loading genérico
    
    // Obter token atual antes de limpar
    const currentToken = localStorageManager.getAuthToken();
    
    // Fazer chamada para o backend para invalidar o token
    if (currentToken) {
      try {
        // Debug: verificar se a API_KEY está sendo lida corretamente
        const apiKey = getApiKey();
        console.log("🔑 API_KEY length:", apiKey?.length);
        console.log("🔑 API_KEY preview:", apiKey?.substring(0, 10) + "...");
        
        const response = await authenticatedFetch(`${BACKEND_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log("✅ Logout realizado com sucesso no backend:", responseData);
        } else {
          const errorData = await response.text();
          console.warn("⚠️ Falha ao invalidar token no backend:", response.status, errorData);
        }
      } catch (error) {
        console.warn("⚠️ Erro ao comunicar com backend para logout:", error);
      }
    }
    
    // Limpar todos os dados locais
    clearAuthData();
    
    // Limpar sessionStorage completamente
    sessionStorage.clear();
    
    // Limpar todos os caches do navegador relacionados à aplicação
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log("✅ Caches do navegador limpos");
      }
    } catch (error) {
      console.warn("⚠️ Erro ao limpar caches:", error);
    }

    // Definir explicitamente que não está mais autenticado
    setIsAuthenticated(false);
    setUser(null);
    setIsLoggingOut(false);
    setLoading(false);

    console.log("✅ Logout concluído, redirecionando para home...");
    
    // Redirecionar para home sempre após logout
    window.location.href = "/";
  };

  const hasPermission = (permission: string): boolean => {
    const permissions = localStorageManager.getUserPermissions();
    return permissions?.[permission as keyof typeof permissions] || false;
  };

  const isPremiumUser = (): boolean => {
    // Sempre verificar localStorage primeiro (dados mais atualizados do backend)
    let isPaidUserFromStorage = localStorageManager.get("isPaidUser");
    
    console.log("🔍 isPremiumUser chamado - Verificação completa:", {
      timestamp: new Date().toISOString(),
      isPaidUserFromStorage,
      typeOfStorageValue: typeof isPaidUserFromStorage,
      storageValueToString: String(isPaidUserFromStorage)
    });
    
    // Se o valor não é um booleano, mas existe, convertê-lo explicitamente
    if (isPaidUserFromStorage !== null && typeof isPaidUserFromStorage !== 'boolean') {
      console.log("⚠️ Valor de isPaidUser não é boolean, convertendo...");
      isPaidUserFromStorage = Boolean(isPaidUserFromStorage);
      // Persistir o valor corrigido no localStorage
      localStorageManager.set("isPaidUser", isPaidUserFromStorage);
      console.log("✅ Valor corrigido e persistido:", isPaidUserFromStorage);
    }
    
    // Se existe no storage, usar esse valor
    if (isPaidUserFromStorage !== null) {
      console.log("🔍 Premium status do localStorage:", isPaidUserFromStorage);
      return isPaidUserFromStorage;
    }
    
    // Fallback para dados do usuário em memória
    const userData = localStorageManager.getUserData();
    const premiumStatus = userData?.isPaidUser || user?.subscription_type === "premium" || false;
    
    // Persistir o valor para próximas verificações
    if (userData?.isPaidUser !== undefined) {
      console.log("⚠️ isPaidUser ausente no localStorage mas presente nos dados do usuário, corrigindo...");
      const isPaidUserBoolean = Boolean(userData.isPaidUser);
      localStorageManager.set("isPaidUser", isPaidUserBoolean);
    }
    
    console.log("🔍 Premium status fallback:", {
      userDataIsPaid: userData?.isPaidUser,
      userSubscriptionType: user?.subscription_type,
      result: premiumStatus
    });
    
    return premiumStatus;
  };

  const refreshPremiumStatus = (): void => {
    console.log("🔄 Forçando atualização do status premium...");
    setPremiumStatusVersion(prev => prev + 1);
  };

  // Escutar eventos de mudança de status premium
  useEffect(() => {
    const handlePremiumStatusChange = (data: any) => {
      console.log("🔔 AuthContext recebeu mudança de status premium:", data);
      
      // Atualizar dados do usuário se necessário
      const updatedUserData = localStorageManager.getUserData();
      if (updatedUserData && updatedUserData.id === user?.id) {
        console.log("🔄 Atualizando dados do usuário após mudança premium");
        setUser(updatedUserData);
      }
      
      // Forçar re-render de todos os componentes dependentes
      refreshPremiumStatus();
    };

    const handleUserDataUpdate = (data: any) => {
      console.log("🔔 AuthContext recebeu atualização de dados do usuário:", data);
      
      // Atualizar dados do usuário se mudaram
      if (data.newData) {
        setUser(data.newData);
      }
      
      // Se status premium mudou, forçar atualização
      if (data.premiumStatusChanged) {
        refreshPremiumStatus();
      }
    };

    // Registrar listeners
    eventEmitter.on(EVENTS.PREMIUM_STATUS_CHANGED, handlePremiumStatusChange);
    eventEmitter.on(EVENTS.USER_DATA_UPDATED, handleUserDataUpdate);
    
    return () => {
      // Limpar listeners quando componente for desmontado
      eventEmitter.off(EVENTS.PREMIUM_STATUS_CHANGED, handlePremiumStatusChange);
      eventEmitter.off(EVENTS.USER_DATA_UPDATED, handleUserDataUpdate);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        isLoggingOut,
        register,
        refreshToken,
        hasPermission,
        isPremiumUser,
        refreshPremiumStatus,
        premiumStatusVersion,
        revalidateAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  // Verificar se estamos usando o valor padrão (significa que não está dentro do Provider)
  if (context === defaultAuthValue) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
