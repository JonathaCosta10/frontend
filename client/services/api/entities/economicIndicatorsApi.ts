import {
  EconomicIndicator,
  IndicatorGroup,
  MarketSentiment,
  IndicatorFilter,
  IndicatorAlert,
} from "../../entities/EconomicIndicators";
import {
  getEconomicIndicatorsMock,
  getIndicatorGroupsMock,
  getMarketSentimentMock,
  getIndicatorByIdMock,
} from "../mocks/examples/economicIndicatorsExamples";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

// API Endpoints
const ENDPOINTS = {
  INDICATORS: "/economic-indicators",
  INDICATOR_GROUPS: "/economic-indicators/groups",
  MARKET_SENTIMENT: "/economic-indicators/sentiment",
  INDICATOR_BY_ID: (id: string) => `/economic-indicators/${id}`,
  INDICATOR_ALERTS: "/economic-indicators/alerts",
};

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Economic Indicators API Service
export class EconomicIndicatorsApiService {
  /**
   * Get all economic indicators with optional filtering
   */
  static async getEconomicIndicators(
    filter?: IndicatorFilter,
  ): Promise<EconomicIndicator[]> {
    if (USE_MOCK_DATA) {
      return getEconomicIndicatorsMock(filter);
    }

    try {
      const queryParams = new URLSearchParams();
      if (filter?.category) queryParams.append("category", filter.category);
      if (filter?.frequency) queryParams.append("frequency", filter.frequency);
      if (filter?.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter?.sortOrder) queryParams.append("sortOrder", filter.sortOrder);

      const endpoint = `${ENDPOINTS.INDICATORS}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await apiCall<EconomicIndicator[]>(endpoint);
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return getEconomicIndicatorsMock(filter);
    }
  }

  /**
   * Get indicators grouped by category
   */
  static async getIndicatorGroups(): Promise<IndicatorGroup[]> {
    if (USE_MOCK_DATA) {
      return getIndicatorGroupsMock();
    }

    try {
      return await apiCall<IndicatorGroup[]>(ENDPOINTS.INDICATOR_GROUPS);
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return getIndicatorGroupsMock();
    }
  }

  /**
   * Get market sentiment analysis
   */
  static async getMarketSentiment(): Promise<MarketSentiment> {
    if (USE_MOCK_DATA) {
      return getMarketSentimentMock();
    }

    try {
      return await apiCall<MarketSentiment>(ENDPOINTS.MARKET_SENTIMENT);
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return getMarketSentimentMock();
    }
  }

  /**
   * Get specific indicator by ID
   */
  static async getIndicatorById(id: string): Promise<EconomicIndicator | null> {
    if (USE_MOCK_DATA) {
      return getIndicatorByIdMock(id);
    }

    try {
      return await apiCall<EconomicIndicator>(ENDPOINTS.INDICATOR_BY_ID(id));
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return getIndicatorByIdMock(id);
    }
  }

  /**
   * Create indicator alert
   */
  static async createIndicatorAlert(
    alert: Omit<IndicatorAlert, "id" | "createdAt">,
  ): Promise<IndicatorAlert> {
    if (USE_MOCK_DATA) {
      // Mock implementation
      const mockAlert: IndicatorAlert = {
        id: Date.now().toString(),
        ...alert,
        createdAt: new Date().toISOString(),
      };
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockAlert;
    }

    try {
      return await apiCall<IndicatorAlert>(ENDPOINTS.INDICATOR_ALERTS, {
        method: "POST",
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.warn("API call failed, using mock implementation:", error);
      const mockAlert: IndicatorAlert = {
        id: Date.now().toString(),
        ...alert,
        createdAt: new Date().toISOString(),
      };
      return mockAlert;
    }
  }

  /**
   * Get user's indicator alerts
   */
  static async getIndicatorAlerts(): Promise<IndicatorAlert[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return []; // Return empty array for mock
    }

    try {
      return await apiCall<IndicatorAlert[]>(ENDPOINTS.INDICATOR_ALERTS);
    } catch (error) {
      console.warn("API call failed, returning empty alerts:", error);
      return [];
    }
  }

  /**
   * Update indicator alert
   */
  static async updateIndicatorAlert(
    id: string,
    updates: Partial<IndicatorAlert>,
  ): Promise<IndicatorAlert> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Mock implementation - return updated alert
      return {
        id,
        indicatorId: updates.indicatorId || "",
        condition: updates.condition || "above",
        threshold: updates.threshold || 0,
        enabled: updates.enabled !== undefined ? updates.enabled : true,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      return await apiCall<IndicatorAlert>(
        `${ENDPOINTS.INDICATOR_ALERTS}/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        },
      );
    } catch (error) {
      console.warn("API call failed, using mock implementation:", error);
      return {
        id,
        indicatorId: updates.indicatorId || "",
        condition: updates.condition || "above",
        threshold: updates.threshold || 0,
        enabled: updates.enabled !== undefined ? updates.enabled : true,
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Delete indicator alert
   */
  static async deleteIndicatorAlert(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return true;
    }

    try {
      await apiCall(`${ENDPOINTS.INDICATOR_ALERTS}/${id}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.warn("API call failed, returning true for mock:", error);
      return true;
    }
  }
}

// Export default methods for easier importing
export const {
  getEconomicIndicators,
  getIndicatorGroups,
  getMarketSentiment,
  getIndicatorById,
  createIndicatorAlert,
  getIndicatorAlerts,
  updateIndicatorAlert,
  deleteIndicatorAlert,
} = EconomicIndicatorsApiService;
