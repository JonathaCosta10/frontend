/**
 * Network Diagnostics - Organizesee
 * Utilitários para diagnóstico de problemas de rede e interferência de terceiros
 */

interface NetworkDiagnostics {
  isOnline: boolean;
  hasThirdPartyInterference: boolean;
  backendAvailable: boolean;
  interferingScripts: string[];
  recommendedAction: string;
}

interface ThirdPartyScript {
  name: string;
  detector: () => boolean;
  interference: boolean;
}

export class NetworkDiagnosticsService {
  private static instance: NetworkDiagnosticsService;

  private thirdPartyScripts: ThirdPartyScript[] = [
    {
      name: "FullStory",
      detector: () => typeof window !== "undefined" && !!(window as any).FS,
      interference: true,
    },
    {
      name: "Hotjar",
      detector: () => typeof window !== "undefined" && !!(window as any).hj,
      interference: true,
    },
    {
      name: "Google Analytics",
      detector: () => typeof window !== "undefined" && !!(window as any).gtag,
      interference: false,
    },
    {
      name: "Facebook Pixel",
      detector: () => typeof window !== "undefined" && !!(window as any).fbq,
      interference: false,
    },
    {
      name: "Intercom",
      detector: () =>
        typeof window !== "undefined" && !!(window as any).Intercom,
      interference: true,
    },
  ];

  static getInstance(): NetworkDiagnosticsService {
    if (!NetworkDiagnosticsService.instance) {
      NetworkDiagnosticsService.instance = new NetworkDiagnosticsService();
    }
    return NetworkDiagnosticsService.instance;
  }

  /**
   * Executa diagnóstico completo da rede
   */
  async runDiagnostics(backendUrl: string): Promise<NetworkDiagnostics> {
    const isOnline = this.checkOnlineStatus();
    const detectedScripts = this.detectThirdPartyScripts();
    const hasInterference = detectedScripts.some(
      (script) =>
        this.thirdPartyScripts.find((s) => s.name === script)?.interference,
    );

    let backendAvailable = false;
    try {
      backendAvailable = await this.checkBackendAvailability(backendUrl);
    } catch {
      backendAvailable = false;
    }

    const recommendedAction = this.getRecommendedAction({
      isOnline,
      hasThirdPartyInterference: hasInterference,
      backendAvailable,
      interferingScripts: detectedScripts,
    });

    return {
      isOnline,
      hasThirdPartyInterference: hasInterference,
      backendAvailable,
      interferingScripts: detectedScripts,
      recommendedAction,
    };
  }

  /**
   * Verifica status online
   */
  private checkOnlineStatus(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  /**
   * Detecta scripts de terceiros
   */
  private detectThirdPartyScripts(): string[] {
    const detected: string[] = [];

    for (const script of this.thirdPartyScripts) {
      if (script.detector()) {
        detected.push(script.name);
      }
    }

    return detected;
  }

  /**
   * Verifica disponibilidade do backend
   */
  private async checkBackendAvailability(backendUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${backendUrl}/health`, {
        method: "GET",
        signal: controller.signal,
        mode: "cors",
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Se o endpoint /health não existir, tentar um endpoint básico
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(backendUrl, {
          method: "HEAD",
          signal: controller.signal,
          mode: "cors",
        });

        clearTimeout(timeoutId);
        return response.status !== 0; // Qualquer resposta do servidor é boa
      } catch {
        return false;
      }
    }
  }

  /**
   * Gera recomendação baseada no diagnóstico
   */
  private getRecommendedAction(
    diagnostics: Omit<NetworkDiagnostics, "recommendedAction">,
  ): string {
    if (!diagnostics.isOnline) {
      return "Verifique sua conexão com a internet";
    }

    if (
      diagnostics.hasThirdPartyInterference &&
      !diagnostics.backendAvailable
    ) {
      return "Scripts de terceiros detectados e backend indisponível. Usando modo desenvolvimento.";
    }

    if (diagnostics.hasThirdPartyInterference) {
      return `Scripts interferindo detectados: ${diagnostics.interferingScripts.join(", ")}. Autenticação pode usar métodos alternativos.`;
    }

    if (!diagnostics.backendAvailable) {
      return "Backend indisponível. Usando modo de desenvolvimento offline.";
    }

    return "Rede funcionando normalmente";
  }

  /**
   * Cria um fetch wrapper que contorna interferência de terceiros
   */
  createSafeFetch(): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
      // Tentar usar o fetch nativo primeiro
      try {
        return await window.fetch(input, init);
      } catch (error) {
        // Se falhar e detectarmos interferência, tentar métodos alternativos
        const hasInterference = this.detectThirdPartyScripts().length > 0;

        if (hasInterference) {
          console.warn(
            "Fetch failed with third-party interference, trying alternative method",
          );

          // Método alternativo usando XMLHttpRequest
          return this.fetchWithXHR(input, init);
        }

        throw error;
      }
    };
  }

  /**
   * Implementação alternativa usando XMLHttpRequest
   */
  private async fetchWithXHR(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method || "GET";

      xhr.open(method, url, true);

      // Configurar headers
      if (init?.headers) {
        const headers = init.headers as Record<string, string>;
        for (const [key, value] of Object.entries(headers)) {
          xhr.setRequestHeader(key, value);
        }
      }

      xhr.onload = () => {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers(),
        });
        resolve(response);
      };

      xhr.onerror = () => {
        reject(new Error("XHR request failed"));
      };

      xhr.ontimeout = () => {
        reject(new Error("XHR request timeout"));
      };

      // Configurar timeout
      xhr.timeout = 10000;

      // Enviar dados
      if (init?.body) {
        xhr.send(init.body as string);
      } else {
        xhr.send();
      }
    });
  }

  /**
   * Log de diagnóstico formatado
   */
  logDiagnostics(diagnostics: NetworkDiagnostics): void {
    console.group("🔍 Network Diagnostics");
    console.log("📡 Online:", diagnostics.isOnline ? "✅" : "❌");
    console.log("🖥️ Backend:", diagnostics.backendAvailable ? "✅" : "❌");
    console.log(
      "🔌 Third-party interference:",
      diagnostics.hasThirdPartyInterference ? "⚠️" : "✅",
    );

    if (diagnostics.interferingScripts.length > 0) {
      console.log(
        "📜 Detected scripts:",
        diagnostics.interferingScripts.join(", "),
      );
    }

    console.log("💡 Recommendation:", diagnostics.recommendedAction);
    console.groupEnd();
  }
}

// Instância singleton
export const networkDiagnostics = NetworkDiagnosticsService.getInstance();

// Utilitário para executar diagnóstico rápido
export const runQuickDiagnostics = async (backendUrl: string) => {
  const diagnostics = await networkDiagnostics.runDiagnostics(backendUrl);
  networkDiagnostics.logDiagnostics(diagnostics);
  return diagnostics;
};

// Detector de FullStory específico
export const detectFullStoryInterference = (): boolean => {
  if (typeof window === "undefined") return false;

  const hasFullStory = !!(window as any).FS;
  if (hasFullStory) {
    console.warn(
      "🔍 FullStory detected - this may interfere with fetch requests",
    );
    console.warn(
      "💡 Authentication will use fallback methods when backend is unavailable",
    );
  }

  return hasFullStory;
};
