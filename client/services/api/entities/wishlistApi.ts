import {
  WishlistItem,
  WishlistStats,
  AddWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistFilter,
} from "../../entities/Wishlist";
import {
  getWishlistItemsMock,
  getWishlistStatsMock,
  addWishlistItemMock,
  updateWishlistItemMock,
  deleteWishlistItemMock,
} from "../mocks/examples/wishlistExamples";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

// API Endpoints
const ENDPOINTS = {
  WISHLIST: "/wishlist",
  WISHLIST_STATS: "/wishlist/stats",
  WISHLIST_ITEM: (id: string) => `/wishlist/${id}`,
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

// Wishlist API Service
export class WishlistApiService {
  /**
   * Get all wishlist items with optional filtering
   */
  static async getWishlistItems(
    filter?: WishlistFilter,
  ): Promise<WishlistItem[]> {
    if (USE_MOCK_DATA) {
      return getWishlistItemsMock(filter);
    }

    try {
      const queryParams = new URLSearchParams();
      if (filter?.type && filter.type !== "all")
        queryParams.append("type", filter.type);
      if (filter?.sector) queryParams.append("sector", filter.sector);
      if (filter?.priceAlert !== undefined)
        queryParams.append("priceAlert", filter.priceAlert.toString());
      if (filter?.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter?.sortOrder) queryParams.append("sortOrder", filter.sortOrder);

      const endpoint = `${ENDPOINTS.WISHLIST}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      return await apiCall<WishlistItem[]>(endpoint);
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return getWishlistItemsMock(filter);
    }
  }

  /**
   * Get wishlist statistics
   */
  static async getWishlistStats(): Promise<WishlistStats> {
    if (USE_MOCK_DATA) {
      return getWishlistStatsMock();
    }

    try {
      return await apiCall<WishlistStats>(ENDPOINTS.WISHLIST_STATS);
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return getWishlistStatsMock();
    }
  }

  /**
   * Add new item to wishlist
   */
  static async addWishlistItem(
    request: AddWishlistItemRequest,
  ): Promise<WishlistItem> {
    if (USE_MOCK_DATA) {
      return addWishlistItemMock(request);
    }

    try {
      return await apiCall<WishlistItem>(ENDPOINTS.WISHLIST, {
        method: "POST",
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return addWishlistItemMock(request);
    }
  }

  /**
   * Update existing wishlist item
   */
  static async updateWishlistItem(
    request: UpdateWishlistItemRequest,
  ): Promise<WishlistItem> {
    if (USE_MOCK_DATA) {
      return updateWishlistItemMock(request);
    }

    try {
      return await apiCall<WishlistItem>(ENDPOINTS.WISHLIST_ITEM(request.id), {
        method: "PATCH",
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return updateWishlistItemMock(request);
    }
  }

  /**
   * Delete wishlist item
   */
  static async deleteWishlistItem(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      return deleteWishlistItemMock(id);
    }

    try {
      await apiCall(ENDPOINTS.WISHLIST_ITEM(id), {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return deleteWishlistItemMock(id);
    }
  }

  /**
   * Get current price for a symbol
   */
  static async getCurrentPrice(symbol: string, type: string): Promise<number> {
    if (USE_MOCK_DATA) {
      return Math.random() * 100 + 10; // Mock price
    }

    try {
      const response = await apiCall<{ price: number }>(
        `/market/price/${symbol}?type=${type}`,
      );
      return response.price;
    } catch (error) {
      console.warn("Price API call failed, using mock price:", error);
      return Math.random() * 100 + 10;
    }
  }
}

// Export default methods for easier importing
export const {
  getWishlistItems,
  getWishlistStats,
  addWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  getCurrentPrice,
} = WishlistApiService;
