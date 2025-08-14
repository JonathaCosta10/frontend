/**
 * Utilitário para gerenciamento de cookies
 * Fornece funções seguras para get/set/remove cookies
 */

interface CookieOptions {
  expires?: number; // dias até expirar
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class CookieManager {
  /**
   * Define um cookie
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    const {
      expires = 30, // 30 dias por padrão
      path = '/',
      domain,
      secure = window.location.protocol === 'https:',
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }
    
    cookieString += `; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    if (secure) {
      cookieString += `; secure`;
    }
    
    cookieString += `; SameSite=${sameSite}`;
    
    document.cookie = cookieString;
  }

  /**
   * Obtém um cookie
   */
  get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  }

  /**
   * Remove um cookie
   */
  remove(name: string, path: string = '/'): void {
    this.set(name, '', { expires: -1, path });
  }

  /**
   * Verifica se um cookie existe
   */
  exists(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Define um cookie com objeto JSON
   */
  setJSON(name: string, value: any, options: CookieOptions = {}): void {
    try {
      const jsonString = JSON.stringify(value);
      this.set(name, jsonString, options);
    } catch (error) {
      console.error('Erro ao definir cookie JSON:', error);
    }
  }

  /**
   * Obtém um cookie como objeto JSON
   */
  getJSON(name: string): any | null {
    try {
      const value = this.get(name);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erro ao obter cookie JSON:', error);
      return null;
    }
  }

  /**
   * Limpa todos os cookies do domínio atual
   */
  clearAll(): void {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      this.remove(name);
    }
  }
}

// Instância singleton
export const cookieManager = new CookieManager();

// Chaves específicas para a aplicação
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'curry_auth_token',
  REFRESH_TOKEN: 'curry_refresh_token',
  USER_PREFERENCES: 'curry_user_preferences',
  THEME: 'curry_theme',
  LANGUAGE: 'curry_language',
  DASHBOARD_LAYOUT: 'curry_dashboard_layout',
  MARKET_FILTERS: 'curry_market_filters',
  BUDGET_SETTINGS: 'curry_budget_settings',
} as const;

// Funções específicas para tokens de autenticação
export const authCookies = {
  setAuthToken: (token: string) => {
    cookieManager.set(COOKIE_KEYS.AUTH_TOKEN, token, {
      expires: 7, // 7 dias
      secure: true,
      sameSite: 'strict'
    });
  },

  getAuthToken: (): string | null => {
    return cookieManager.get(COOKIE_KEYS.AUTH_TOKEN);
  },

  setRefreshToken: (token: string) => {
    cookieManager.set(COOKIE_KEYS.REFRESH_TOKEN, token, {
      expires: 30, // 30 dias
      secure: true,
      sameSite: 'strict'
    });
  },

  getRefreshToken: (): string | null => {
    return cookieManager.get(COOKIE_KEYS.REFRESH_TOKEN);
  },

  clearAuthTokens: () => {
    cookieManager.remove(COOKIE_KEYS.AUTH_TOKEN);
    cookieManager.remove(COOKIE_KEYS.REFRESH_TOKEN);
  }
};

// Funções para preferências do usuário
export const userPreferences = {
  setTheme: (theme: string) => {
    cookieManager.set(COOKIE_KEYS.THEME, theme, { expires: 365 });
  },

  getTheme: (): string | null => {
    return cookieManager.get(COOKIE_KEYS.THEME);
  },

  setLanguage: (language: string) => {
    cookieManager.set(COOKIE_KEYS.LANGUAGE, language, { expires: 365 });
  },

  getLanguage: (): string | null => {
    return cookieManager.get(COOKIE_KEYS.LANGUAGE);
  },

  setUserPreferences: (preferences: any) => {
    cookieManager.setJSON(COOKIE_KEYS.USER_PREFERENCES, preferences, { expires: 365 });
  },

  getUserPreferences: (): any | null => {
    return cookieManager.getJSON(COOKIE_KEYS.USER_PREFERENCES);
  }
};

export default cookieManager;
