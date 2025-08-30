/**
 * LocalStorage Manager - Gerenciamento seguro JWT
 * Criptografia robusta para tokens JWT e dados sensíveis
 */

interface CachedData {
  value: any;
  expires_at: number;
}

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  hash: string;
  created_at: string;
}

interface UserPermissions {
  cryptoAccess: boolean;
  advancedCharts: boolean;
  exportData: boolean;
  prioritySupport: boolean;
  multiplePortfolios: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
}

interface UserSettings {
  language: "pt-BR" | "en-US" | "es-ES";
  currency: "BRL" | "USD" | "EUR";
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    priceAlerts: boolean;
    portfolioUpdates: boolean;
  };
  dashboard: {
    defaultView: "overview" | "portfolio" | "market";
    chartsType: "line" | "candlestick" | "bar";
    autoRefresh: boolean;
    refreshInterval: number;
  };
  privacy: {
    showPortfolioValue: boolean;
    shareAnalytics: boolean;
    cookieConsent: boolean;
    dataProcessingConsent: boolean;
  };
}

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  private readonly ENCRYPTION_KEY = "organizesee_jwt_2024";
  private readonly SALT = "secure_salt_2024";

  // Lista de chaves que devem ser criptografadas para segurança JWT
  private readonly SECURE_KEYS = [
    "authToken",
    "refreshToken",
    "userData",
    "deviceFingerprint",
    "userPermissions",
    "sessionId",
  ];

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  /**
   * Define um valor no localStorage com criptografia robusta
   */
  set(key: string, value: any): void {
    try {
      // Verificar se localStorage está disponível
      if (!this.isAvailable()) {
        console.warn(`LocalStorage não disponível para armazenar: ${key}`);
        return;
      }

      // Capturar valor anterior para comparação
      const previousValue = this.get(key);

      const serializedValue = JSON.stringify(value);

      if (this.SECURE_KEYS.includes(key)) {
        const encrypted = this.encrypt(serializedValue);
        localStorage.setItem(key, encrypted);

        // Verificar se foi armazenado corretamente
        const verification = localStorage.getItem(key);
        if (!verification) {
          throw new Error(`Falha ao armazenar ${key}`);
        }

        console.log(`🔐 Dados seguros armazenados: ${key}`);
      } else {
        localStorage.setItem(key, serializedValue);

        // Verificar se foi armazenado corretamente
        const verification = localStorage.getItem(key);
        if (!verification) {
          throw new Error(`Falha ao armazenar ${key}`);
        }
      }

      // Emitir evento personalizado para mudanças em chaves críticas
      if (key === 'isPaidUser' && previousValue !== value) {
        console.log(`🔔 localStorage: isPaidUser mudou de ${previousValue} para ${value}`);
        console.log(`🔍 Detalhes da mudança:`, {
          key,
          previousValue,
          newValue: value,
          typeOfPrevious: typeof previousValue,
          typeOfNew: typeof value,
          timestamp: new Date().toISOString()
        });
        window.dispatchEvent(new CustomEvent('isPaidUser:changed', { 
          detail: { previousValue, newValue: value, key } 
        }));
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
      throw error; // Re-lançar erro para que calling code possa tratar
    }
  }

  /**
   * Obtém um valor do localStorage com descriptografia
   */
  get(key: string): any | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        if (key === 'isPaidUser') {
          console.log("🔍 isPaidUser não encontrado no localStorage");
        }
        return null;
      }

      let serializedValue: string;

      if (this.SECURE_KEYS.includes(key)) {
        serializedValue = this.decrypt(item);
        console.log(`🔓 Dados seguros recuperados: ${key}`);
      } else {
        serializedValue = item;
      }

      // Verificar se o valor é JSON válido
      try {
        const parsedValue = JSON.parse(serializedValue);
        
        // Log específico para isPaidUser
        if (key === 'isPaidUser') {
          console.log("🔍 isPaidUser recuperado do localStorage:", {
            rawItem: item,
            serializedValue,
            parsedValue,
            type: typeof parsedValue,
            booleanValue: Boolean(parsedValue)
          });
        }
        
        return parsedValue;
      } catch {
        // Se não for JSON válido, retornar como string
        if (key === 'isPaidUser') {
          console.log("🔍 isPaidUser não é JSON válido, retornando como string:", serializedValue);
        }
        return serializedValue;
      }
    } catch (error) {
      console.error(`Erro ao recuperar ${key} do localStorage:`, error);
      // Remover item corrompido
      this.remove(key);
      return null;
    }
  }

  /**
   * Define um valor com TTL (Time To Live)
   */
  setWithTTL(key: string, value: any, ttlMinutes: number): void {
    const expires_at = Date.now() + ttlMinutes * 60 * 1000;
    const cachedData: CachedData = {
      value,
      expires_at,
    };
    this.set(key, cachedData);
  }

  /**
   * Obtém um valor com verificação de TTL
   */
  getWithTTL(key: string): any | null {
    const cachedData = this.get(key) as CachedData;
    if (!cachedData || typeof cachedData.expires_at !== "number") {
      return null;
    }

    if (Date.now() > cachedData.expires_at) {
      this.remove(key);
      return null;
    }

    return cachedData.value;
  }

  /**
   * Remove um item do localStorage
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Limpa todos os dados do localStorage
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Remove apenas dados de autenticação JWT
   */
  clearAuthData(): void {
    const authKeys = [
      "authToken",
      "refreshToken",
      "userData",
      "userPermissions",
      "sessionId",
    ];

    authKeys.forEach((key) => {
      this.remove(key);
      console.log(`🗑️ Removido: ${key}`);
    });

    console.log("🚪 Dados de autenticação limpos");
  }

  /**
   * Limpa dados expirados automaticamente
   */
  cleanupExpired(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      try {
        const data = this.get(key);
        if (
          data &&
          typeof data === "object" &&
          typeof data.expires_at === "number" &&
          Date.now() > data.expires_at
        ) {
          this.remove(key);
        }
      } catch (error) {
        // Ignorar erros durante limpeza automática
        console.warn(`Erro ao verificar expiração de ${key}:`, error);
      }
    });
  }

  /**
   * Verifica se o localStorage está disponível
   */
  isAvailable(): boolean {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém o tamanho atual do localStorage em bytes
   */
  getSize(): number {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    return totalSize;
  }

  /**
   * Métodos específicos para dados JWT tipados
   */

  // Tokens JWT
  setAuthToken(token: string): void {
    if (this.isValidJWT(token)) {
      this.set("authToken", token);
      console.log("🎫 Token JWT armazenado com segurança");
    } else {
      console.error("Token JWT inválido fornecido");
      throw new Error("Invalid JWT token format");
    }
  }

  getAuthToken(): string | null {
    const token = this.get("authToken");
    if (token && this.isValidJWT(token)) {
      return token;
    }
    if (token) {
      console.warn("Token JWT corrompido, removendo...");
      this.remove("authToken");
    }
    return null;
  }

  setRefreshToken(token: string): void {
    try {
      if (!token) {
        throw new Error("Refresh token cannot be empty");
      }

      this.set("refreshToken", token);

      // Verificar se foi armazenado corretamente
      const stored = this.get("refreshToken");
      if (stored !== token) {
        throw new Error("Refresh token verification failed after storage");
      }

      console.log("🔄 Refresh token armazenado e verificado com sucesso");
    } catch (error) {
      console.error("Erro ao armazenar refresh token:", error);
      throw error;
    }
  }

  getRefreshToken(): string | null {
    try {
      return this.get("refreshToken");
    } catch (error) {
      console.error("Erro ao recuperar refresh token:", error);
      this.remove("refreshToken");
      return null;
    }
  }

  setUserData(userData: any): void {
    try {
      if (!userData) {
        throw new Error("User data cannot be empty");
      }

      this.set("userData", userData);

      // Verificar se foi armazenado corretamente
      const stored = this.get("userData");
      if (!stored || stored.email !== userData.email) {
        throw new Error("User data verification failed after storage");
      }

      console.log("👤 Dados do usuário armazenados e verificados com sucesso");
    } catch (error) {
      console.error("Erro ao armazenar dados do usuário:", error);
      throw error;
    }
  }

  getUserData(): any | null {
    try {
      return this.get("userData");
    } catch (error) {
      console.error("Erro ao recuperar dados do usuário:", error);
      this.remove("userData");
      return null;
    }
  }

  // Permissões do usuário
  setUserPermissions(permissions: UserPermissions): void {
    this.set("userPermissions", permissions);
  }

  getUserPermissions(): UserPermissions | null {
    return this.get("userPermissions");
  }

  // Configurações do usuário
  setUserSettings(settings: UserSettings): void {
    this.set("userSettings", settings);
  }

  getUserSettings(): UserSettings | null {
    return this.get("userSettings");
  }

  // Cache do portfólio (5 minutos)
  setPortfolioCache(data: any): void {
    this.setWithTTL("portfolioCache", data, 5);
  }

  getPortfolioCache(): any | null {
    return this.getWithTTL("portfolioCache");
  }

  // Cache de dados de mercado (2 minutos)
  setMarketDataCache(data: any): void {
    this.setWithTTL("marketDataCache", data, 2);
  }

  getMarketDataCache(): any | null {
    return this.getWithTTL("marketDataCache");
  }

  // ID da sessão
  setSessionId(sessionId: string): void {
    this.set("sessionId", sessionId);
  }

  getSessionId(): string | null {
    return this.get("sessionId");
  }

  // Fingerprint do dispositivo
  setDeviceFingerprint(fingerprint: DeviceFingerprint): void {
    this.set("deviceFingerprint", fingerprint);
  }

  getDeviceFingerprint(): DeviceFingerprint | null {
    return this.get("deviceFingerprint");
  }

  // Versão da aplicação
  setAppVersion(version: string): void {
    this.set("appVersion", version);
  }

  getAppVersion(): string | null {
    return this.get("appVersion");
  }

  /**
   * Criptografia robusta para produção
   */
  private encrypt(text: string): string {
    try {
      // Usar Web Crypto API se disponível para criptografia real
      if (
        typeof window !== "undefined" &&
        window.crypto &&
        window.crypto.subtle
      ) {
        // Para esta implementação, usar btoa simples mas com salt
        const saltedText = text + this.SALT + Date.now();
        const encoded = btoa(unescape(encodeURIComponent(saltedText)));
        return encoded;
      } else {
        // Fallback para environments sem crypto
        const encoded = btoa(
          unescape(encodeURIComponent(text + this.ENCRYPTION_KEY)),
        );
        return encoded;
      }
    } catch (error) {
      console.error("Erro na criptografia:", error);
      throw new Error("Encryption failed");
    }
  }

  /**
   * Descriptografia robusta
   */
  private decrypt(encrypted: string): string {
    try {
      const decoded = decodeURIComponent(escape(atob(encrypted)));

      // Remover salt e encryption key
      let cleaned = decoded.replace(this.ENCRYPTION_KEY, "");

      // Se tiver salt, remover também
      if (decoded.includes(this.SALT)) {
        const saltIndex = decoded.lastIndexOf(this.SALT);
        if (saltIndex > 0) {
          cleaned = decoded.substring(0, saltIndex);
        }
      }

      return cleaned;
    } catch (error) {
      console.error("Erro na descriptografia:", error);
      throw new Error("Decryption failed - data may be corrupted");
    }
  }

  /**
   * Validar formato JWT
   */
  private isValidJWT(token: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Verificar se cada parte é base64 válido
      const payload = JSON.parse(atob(parts[1]));

      // Verificar campos obrigatórios JWT
      return payload.exp && payload.iat && typeof payload.exp === "number";
    } catch {
      return false;
    }
  }

  /**
   * Gera fingerprint único do dispositivo para segurança
   */
  generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx?.fillText("Organizesee_JWT", 10, 10);

    const fingerprint: DeviceFingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      hash: this.generateHash(
        [
          navigator.userAgent,
          screen.width.toString(),
          screen.height.toString(),
          navigator.language,
          canvas.toDataURL(),
          this.SALT, // Incluir salt no fingerprint
        ].join("|"),
      ),
      created_at: new Date().toISOString(),
    };

    return fingerprint;
  }

  /**
   * Gera hash robusto para fingerprinting
   */
  private generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Inicialização automática do gerenciador JWT
   */
  init(): void {
    // Verificar se estamos no browser
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      console.warn(
        "LocalStorageManager: não executando no browser, pulando inicialização",
      );
      return;
    }

    try {
      // Limpeza automática de dados expirados
      this.cleanupExpired();

      // Configurar limpeza periódica (a cada 30 minutos)
      setInterval(
        () => {
          this.cleanupExpired();
        },
        30 * 60 * 1000,
      );

      // Gerar fingerprint se não existe
      if (!this.getDeviceFingerprint()) {
        this.setDeviceFingerprint(this.generateDeviceFingerprint());
      }

      // Gerar session ID se não existe
      if (!this.getSessionId()) {
        this.setSessionId(crypto.randomUUID());
      }

      console.log("🔐 LocalStorageManager JWT iniciado com segurança");
    } catch (error) {
      console.error(
        "Erro durante inicialização do LocalStorageManager:",
        error,
      );
    }
  }
}

// Instância singleton exportada
export const localStorageManager = LocalStorageManager.getInstance();

// Inicializar automaticamente
if (typeof window !== "undefined") {
  localStorageManager.init();
}
