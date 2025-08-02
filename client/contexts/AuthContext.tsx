import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { localStorageManager } from "../lib/localStorage";
import {
  login as loginRules,
  register as registerRules,
  refreshTokenApi,
  getUserData,
} from "./Rules";

// Configuração do ambiente
const API_KEY = import.meta.env.VITE_API_KEY || "minha-chave-secreta";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// Interfaces
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
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
  register: (userData: RegisterData) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  isPremiumUser: () => boolean;
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
  login: async () => false,
  logout: () => {},
  register: async () => false,
  refreshToken: async () => false,
  hasPermission: () => false,
  isPremiumUser: () => false,
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
            // Buscar dados atualizados do usuário após refresh
            const updatedUserData = await getUserData("user");
            if (updatedUserData) {
              localStorageManager.setUserData(updatedUserData);
              setUser(updatedUserData);
              setIsAuthenticated(true);
              console.log(
                "✅ Token renovado e dados do usuário atualizados via Rules",
              );
            } else {
              // Se não conseguir buscar dados do usuário, usar dados do localStorage
              const cachedUserData = localStorageManager.getUserData();
              setUser(cachedUserData);
              setIsAuthenticated(true);
              console.log("✅ Token renovado via Rules, usando dados em cache");
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
    localStorageManager.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const performTokenRefresh = async (
    refreshTokenValue: string,
  ): Promise<boolean> => {
    try {
      console.log("🔄 Usando Rules para refresh token...");

      // Usar Rules para refresh token
      const refreshData = await refreshTokenApi(
        refreshTokenValue,
        "refreshToken",
      );

      if (refreshData && refreshData.access) {
        // Verificar se o novo token é válido
        if (isTokenValid(refreshData.access)) {
          localStorageManager.setAuthToken(refreshData.access);

          // Atualizar refresh token se fornecido
          if (refreshData.refresh) {
            localStorageManager.setRefreshToken(refreshData.refresh);
          }

          console.log("✅ Token refresh via Rules bem-sucedido");
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
      console.log("🔐 Iniciando login via Rules:", {
        username,
        password: "***",
      });

      // Usar Rules para login
      const success = await loginRules(username, password, "login");

      if (success) {
        // Verificar se dados foram armazenados
        const token = localStorageManager.getAuthToken();
        const userData = localStorageManager.getUserData();

        if (token && userData) {
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          console.log(
            "✅ Login via Rules bem-sucedido:",
            userData.username || userData.email,
          );
          return true;
        } else {
          console.error("❌ Dados não foram armazenados após login via Rules");
          setLoading(false);
          return false;
        }
      } else {
        console.error("❌ Login via Rules falhou");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro de login via Rules:", error);
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("📝 Iniciando registro via Rules:", {
        username: userData.username,
        email: userData.email,
      });

      // Usar Rules para registro
      const success = await registerRules(userData, "register");

      if (success) {
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
        return true;
      } else {
        console.error("❌ Registro via Rules falhou");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro de registro via Rules:", error);
      setLoading(false);
      return false;
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

  const logout = () => {
    console.log("🚪 Logout do usuário");
    clearAuthData();

    // Redirecionar para página de login se não estiver em página pública
    const currentPath = window.location.pathname;
    const publicPages = [
      "/",
      "/home",
      "/market",
      "/login",
      "/signup",
      "/demo",
      "/public",
    ];
    const isPublicPage = publicPages.some((page) =>
      currentPath.startsWith(page),
    );

    if (!isPublicPage) {
      window.location.href = "/login";
    }
  };

  const hasPermission = (permission: string): boolean => {
    const permissions = localStorageManager.getUserPermissions();
    return permissions?.[permission as keyof typeof permissions] || false;
  };

  const isPremiumUser = (): boolean => {
    return user?.subscription_type === "premium" || false;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        register,
        refreshToken,
        hasPermission,
        isPremiumUser,
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
