/**
 * Serviço de API unificado que elimina inconsistências entre budgetApi e investmentsApi
 * Padroniza tratamento de erro, configuração e interceptors
 */

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  useMocks: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface IApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

class ApiService {
  private config: ApiConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
      timeout: 10000,
      retries: 3,
      useMocks: process.env.NODE_ENV === 'development',
      ...config,
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createAbortController(requestId: string): AbortController {
    // Cancel previous request if exists
    const existingController = this.abortControllers.get(requestId);
    if (existingController) {
      existingController.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    return controller;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requestId?: string
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseURL}${endpoint}`;
    
    // Create abort controller for request cancellation
    const controller = requestId ? this.createAbortController(requestId) : new AbortController();
    
    const defaultOptions: RequestInit = {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add timeout
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🌐 API Request [${attempt + 1}/${this.config.retries + 1}]:`, {
            url,
            method: options.method || 'GET',
            options: defaultOptions,
          });
        }

        const response = await fetch(url, defaultOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError({
            message: errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            code: errorData.code,
            details: errorData,
          });
        }

        const data = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ API Response:', data);
        }

        // Clean up abort controller
        if (requestId) {
          this.abortControllers.delete(requestId);
        }

        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if request was aborted
        if (error.name === 'AbortError') {
          throw new ApiError({
            message: 'Request was cancelled',
            code: 'REQUEST_CANCELLED',
          });
        }

        // Don't retry for client errors (4xx)
        if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
          await this.delay(backoffMs);
          
          if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ API Retry in ${backoffMs}ms...`);
          }
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError || new Error('Request failed after all retries');
  }

  // GET method
  async get<T>(endpoint: string, requestId?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requestId);
  }

  // POST method
  async post<T>(endpoint: string, data?: any, requestId?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requestId
    );
  }

  // PUT method
  async put<T>(endpoint: string, data?: any, requestId?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      requestId
    );
  }

  // PATCH method
  async patch<T>(endpoint: string, data?: any, requestId?: string): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      requestId
    );
  }

  // DELETE method
  async delete<T>(endpoint: string, requestId?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requestId);
  }

  // Cancel a specific request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  // Cancel all pending requests
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Update configuration
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor({ message, status, code, details }: {
    message: string;
    status?: number;
    code?: string;
    details?: any;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Default API service instance
export const apiService = new ApiService();

// Development/Mock API service
export const mockApiService = new ApiService({
  useMocks: true,
  timeout: 1000, // Faster for mocks
  retries: 0, // No retries for mocks
});

// Helper function to get appropriate service
export const getApiService = (): ApiService => {
  return process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCKS === 'true'
    ? mockApiService
    : apiService;
};

export { ApiService };
export default apiService;
