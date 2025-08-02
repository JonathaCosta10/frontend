/**
 * API for Public Ranking Search by Type
 *
 * This module handles public ranking data for both FIIs and Stocks
 * without requiring authentication.
 * MIGRADO para usar Design Pattern Rules
 */

import { getRanking } from "../../../../contexts/Rules";
import { isDevelopment, secureLog } from "../../../../config/development";

// Interface para dados financeiros
interface FinancialData {
  ticker: string;
  preco: number;
  variacao: number;
  marketCap: string;
  setor: string;
  volume?: string;
}

/**
 * Simulate API delay for development
 */
const simulateApiDelay = (delay: number = 300): Promise<void> => {
  if (!isDevelopment) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Fetches ranking data for a specific type (FIIs or Stocks)
 * MIGRADO para usar Rules
 *
 * @param tipo - Type of asset ('fiis' or 'acoes')
 * @param filters - Additional filters
 * @returns Array of ranking data
 */
export async function fetchRankingByType(
  tipo: string = "fiis",
  filters: Record<string, any> = {},
): Promise<FinancialData[]> {
  try {
    secureLog(`[RANKING-PUBLIC] Fetching data for ${tipo} via Rules`);

    // Simular delay para desenvolvimento
    await simulateApiDelay();

    // Usar Rules para buscar dados via API
    const data = await getRanking(tipo, "rankingPublic");

    if (data && Array.isArray(data)) {
      secureLog(`[RANKING-PUBLIC] Got ${data.length} results for ${tipo}`);
      return data;
    } else {
      secureLog(`[RANKING-PUBLIC] No data returned for ${tipo}, using mock`);
      // Fallback para dados mock se API falhar
      return generateMockData(tipo, 20);
    }
  } catch (error) {
    secureLog(`[RANKING-PUBLIC] Error fetching ${tipo}:`, error);
    console.warn(
      `API request failed for ${tipo}, falling back to mock data:`,
      error,
    );

    // Fallback para dados mock em caso de erro
    return generateMockData(tipo, 20);
  }
}

/**
 * Fetches top performers for a specific type
 * MIGRADO para usar Rules
 *
 * @param tipo - Type of asset ('fiis' or 'acoes')
 * @param limit - Number of results to return
 * @returns Array of top performer data
 */
export async function fetchTop10Ranking(
  tipo: string = "fiis",
  limit: number = 10,
): Promise<FinancialData[]> {
  try {
    secureLog(`[TOP-RANKING] Fetching top ${limit} ${tipo} via Rules`);

    const allData = await fetchRankingByType(tipo);

    // Ordenar por market cap e pegar os top N
    const sortedData = allData
      .sort((a, b) => {
        const aValue = parseFloat(a.marketCap.replace(/[^0-9.]/g, ""));
        const bValue = parseFloat(b.marketCap.replace(/[^0-9.]/g, ""));
        return bValue - aValue;
      })
      .slice(0, limit);

    secureLog(`[TOP-RANKING] Returning top ${sortedData.length} ${tipo}`);
    return sortedData;
  } catch (error) {
    secureLog(`[TOP-RANKING] Error fetching top ${tipo}:`, error);
    console.warn(
      `Error fetching top ${tipo}, falling back to mock data:`,
      error,
    );

    // Fallback para dados mock
    return generateMockData(tipo, limit);
  }
}

/**
 * Generate mock data for development/fallback
 * @param tipo - Type of asset
 * @param count - Number of records to generate
 * @returns Array of mock data
 */
function generateMockData(tipo: string, count: number): FinancialData[] {
  const mockData: FinancialData[] = [];
  const setores =
    tipo === "fiis"
      ? ["Logístico", "Corporativo", "Híbrido", "Papel", "Shopping"]
      : ["Tecnologia", "Bancos", "Petróleo", "Mineração", "Varejo"];

  for (let i = 0; i < count; i++) {
    const variation = (Math.random() - 0.5) * 10; // -5% a +5%
    mockData.push({
      ticker: `${tipo === "fiis" ? "HGLG" : "PETR"}${(i + 1)
        .toString()
        .padStart(2, "0")}${tipo === "fiis" ? "11" : "4"}`,
      preco: 50 + Math.random() * 100,
      variacao: variation,
      marketCap: `${(Math.random() * 50 + 5).toFixed(1)}B`,
      setor: setores[i % setores.length],
      volume: `${(Math.random() * 100 + 10).toFixed(1)}M`,
    });
  }

  return mockData;
}

/**
 * Fetchs market overview data
 * @returns Market overview data
 */
export async function fetchMarketOverview(): Promise<{
  totalMarketCap: string;
  totalVolume: string;
  activeAssets: number;
  marketStatus: string;
}> {
  try {
    secureLog("[MARKET-OVERVIEW] Fetching market overview via Rules");

    // Usar Rules para buscar dados de mercado
    const data = await getRanking("overview", "market");

    if (data) {
      return data;
    } else {
      // Fallback para dados mock
      return {
        totalMarketCap: "2.5T",
        totalVolume: "125.8B",
        activeAssets: 847,
        marketStatus: "open",
      };
    }
  } catch (error) {
    secureLog("[MARKET-OVERVIEW] Error fetching market overview:", error);

    // Fallback para dados mock
    return {
      totalMarketCap: "2.5T",
      totalVolume: "125.8B",
      activeAssets: 847,
      marketStatus: "open",
    };
  }
}

export default {
  fetchRankingByType,
  fetchTop10Ranking,
  fetchMarketOverview,
};
