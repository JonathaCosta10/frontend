import { 
  WishlistItem, 
  WishlistStats, 
  AddWishlistItemRequest,
  UpdateWishlistItemRequest,
  WishlistFilter 
} from '../../../entities/Wishlist';

// Mock Wishlist Data
export const mockWishlistItems: WishlistItem[] = [
  {
    id: '1',
    symbol: 'PETR4',
    name: 'Petrobras PN',
    type: 'stock',
    currentPrice: 32.50,
    targetPrice: 28.00,
    priceAlert: true,
    notes: 'Aguardando correção para entrada',
    addedAt: '2024-01-15T10:00:00Z',
    sector: 'Petróleo e Gás',
    lastUpdate: '2024-01-20T15:30:00Z',
    priceHistory: [
      { date: '2024-01-15', price: 31.20, change: 0.80, changePercent: 2.63 },
      { date: '2024-01-16', price: 31.80, change: 0.60, changePercent: 1.92 },
      { date: '2024-01-17', price: 32.10, change: 0.30, changePercent: 0.94 },
      { date: '2024-01-18', price: 32.50, change: 0.40, changePercent: 1.25 },
    ]
  },
  {
    id: '2',
    symbol: 'HGLG11',
    name: 'CSHG Logística',
    type: 'fii',
    currentPrice: 125.80,
    targetPrice: 120.00,
    priceAlert: false,
    notes: 'FII de logística com bom dividend yield',
    addedAt: '2024-01-10T09:00:00Z',
    sector: 'Logística',
    lastUpdate: '2024-01-20T15:30:00Z',
    priceHistory: [
      { date: '2024-01-10', price: 123.50, change: -1.20, changePercent: -0.96 },
      { date: '2024-01-11', price: 124.20, change: 0.70, changePercent: 0.57 },
      { date: '2024-01-12', price: 125.00, change: 0.80, changePercent: 0.64 },
      { date: '2024-01-15', price: 125.80, change: 0.80, changePercent: 0.64 },
    ]
  },
  {
    id: '3',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    currentPrice: 195000,
    targetPrice: 180000,
    priceAlert: true,
    notes: 'Aguardando correção para DCA',
    addedAt: '2024-01-05T14:00:00Z',
    sector: 'Cryptocurrency',
    lastUpdate: '2024-01-20T15:30:00Z',
    priceHistory: [
      { date: '2024-01-05', price: 190000, change: 5000, changePercent: 2.70 },
      { date: '2024-01-08', price: 192000, change: 2000, changePercent: 1.05 },
      { date: '2024-01-12', price: 194000, change: 2000, changePercent: 1.04 },
      { date: '2024-01-18', price: 195000, change: 1000, changePercent: 0.52 },
    ]
  },
  {
    id: '4',
    symbol: 'TESOURO_SELIC',
    name: 'Tesouro Selic 2029',
    type: 'bond',
    currentPrice: 98.50,
    targetPrice: 95.00,
    priceAlert: false,
    notes: 'Reserva de emergência',
    addedAt: '2024-01-08T11:00:00Z',
    sector: 'Títulos Públicos',
    lastUpdate: '2024-01-20T15:30:00Z',
    priceHistory: [
      { date: '2024-01-08', price: 98.20, change: 0.10, changePercent: 0.10 },
      { date: '2024-01-12', price: 98.35, change: 0.15, changePercent: 0.15 },
      { date: '2024-01-16', price: 98.45, change: 0.10, changePercent: 0.10 },
      { date: '2024-01-20', price: 98.50, change: 0.05, changePercent: 0.05 },
    ]
  }
];

export const mockWishlistStats: WishlistStats = {
  totalItems: 4,
  itemsByType: {
    'stock': 1,
    'fii': 1,
    'crypto': 1,
    'bond': 1
  },
  itemsWithAlerts: 2,
  averageTargetDiscount: 8.5,
  totalTargetValue: 423.00
};

// Mock API functions
export const getWishlistItemsMock = async (filter?: WishlistFilter): Promise<WishlistItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredItems = [...mockWishlistItems];
  
  if (filter?.type && filter.type !== 'all') {
    filteredItems = filteredItems.filter(item => item.type === filter.type);
  }
  
  if (filter?.sector) {
    filteredItems = filteredItems.filter(item => 
      item.sector?.toLowerCase().includes(filter.sector!.toLowerCase())
    );
  }
  
  if (filter?.priceAlert !== undefined) {
    filteredItems = filteredItems.filter(item => item.priceAlert === filter.priceAlert);
  }
  
  // Apply sorting
  if (filter?.sortBy) {
    filteredItems.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filter.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.currentPrice;
          bValue = b.currentPrice;
          break;
        case 'change':
          aValue = a.priceHistory[a.priceHistory.length - 1]?.changePercent || 0;
          bValue = b.priceHistory[b.priceHistory.length - 1]?.changePercent || 0;
          break;
        case 'targetPrice':
          aValue = a.targetPrice;
          bValue = b.targetPrice;
          break;
        case 'addedAt':
          aValue = new Date(a.addedAt).getTime();
          bValue = new Date(b.addedAt).getTime();
          break;
        default:
          aValue = a.addedAt;
          bValue = b.addedAt;
      }

      if (filter.sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });
  }
  
  return filteredItems;
};

export const getWishlistStatsMock = async (): Promise<WishlistStats> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockWishlistStats;
};

export const addWishlistItemMock = async (request: AddWishlistItemRequest): Promise<WishlistItem> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newItem: WishlistItem = {
    id: Date.now().toString(),
    symbol: request.symbol,
    name: request.name,
    type: request.type,
    currentPrice: Math.random() * 100 + 10, // Mock current price
    targetPrice: request.targetPrice,
    priceAlert: request.priceAlert,
    notes: request.notes,
    addedAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    priceHistory: [
      {
        date: new Date().toISOString().split('T')[0],
        price: request.targetPrice,
        change: 0,
        changePercent: 0
      }
    ]
  };
  
  return newItem;
};

export const updateWishlistItemMock = async (request: UpdateWishlistItemRequest): Promise<WishlistItem> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const existingItem = mockWishlistItems.find(item => item.id === request.id);
  if (!existingItem) {
    throw new Error('Item not found');
  }
  
  return {
    ...existingItem,
    targetPrice: request.targetPrice ?? existingItem.targetPrice,
    priceAlert: request.priceAlert ?? existingItem.priceAlert,
    notes: request.notes ?? existingItem.notes,
    lastUpdate: new Date().toISOString()
  };
};

export const deleteWishlistItemMock = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return true;
};
