/**
 * Virtual Scrolling Component
 * Otimização para listas grandes com renderização apenas dos itens visíveis
 */

import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback,
  ReactNode 
} from 'react';

interface VirtualScrollProps<T> {
  // Dados da lista
  items: T[];
  
  // Altura de cada item (pode ser fixa ou função)
  itemHeight: number | ((index: number, item: T) => number);
  
  // Altura do container (obrigatório)
  containerHeight: number;
  
  // Função de render para cada item
  renderItem: (item: T, index: number) => ReactNode;
  
  // Número de itens extras para render fora da viewport (buffer)
  overscan?: number;
  
  // Classe CSS do container
  className?: string;
  
  // Callback quando scroll chega ao final
  onEndReached?: () => void;
  
  // Threshold para trigger do onEndReached
  endReachedThreshold?: number;
  
  // Loading state
  loading?: boolean;
  
  // Componente de loading
  loadingComponent?: ReactNode;
  
  // Placeholder quando não há itens
  emptyComponent?: ReactNode;
  
  // Callback para scroll
  onScroll?: (scrollTop: number) => void;
}

interface VirtualScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleItems: Array<{ index: number; item: any; top: number; height: number }>;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  loadingComponent,
  emptyComponent,
  onScroll
}: VirtualScrollProps<T>) {
  const [state, setState] = useState<VirtualScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleItems: []
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const endReachedRef = useRef(false);
  
  // Calcular altura de cada item
  const getItemHeight = useCallback((index: number, item: T): number => {
    return typeof itemHeight === 'function' ? itemHeight(index, item) : itemHeight;
  }, [itemHeight]);
  
  // Calcular posições dos itens (memoizado para performance)
  const itemPositions = useMemo(() => {
    const positions: Array<{ top: number; height: number }> = [];
    let top = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i, items[i]);
      positions.push({ top, height });
      top += height;
    }
    
    return positions;
  }, [items, getItemHeight]);
  
  // Altura total da lista
  const totalHeight = useMemo(() => {
    return itemPositions.length > 0 
      ? itemPositions[itemPositions.length - 1].top + itemPositions[itemPositions.length - 1].height
      : 0;
  }, [itemPositions]);
  
  // Calcular itens visíveis baseado no scroll
  const calculateVisibleItems = useCallback((scrollTop: number) => {
    if (items.length === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        visibleItems: []
      };
    }
    
    // Encontrar índice inicial
    let startIndex = 0;
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i].top + itemPositions[i].height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }
    
    // Encontrar índice final
    let endIndex = startIndex;
    const viewportBottom = scrollTop + containerHeight;
    
    for (let i = startIndex; i < itemPositions.length; i++) {
      endIndex = i;
      if (itemPositions[i].top > viewportBottom) {
        break;
      }
    }
    endIndex = Math.min(items.length - 1, endIndex + overscan);
    
    // Criar lista de itens visíveis
    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (i < items.length) {
        visibleItems.push({
          index: i,
          item: items[i],
          top: itemPositions[i].top,
          height: itemPositions[i].height
        });
      }
    }
    
    return { startIndex, endIndex, visibleItems };
  }, [items, itemPositions, containerHeight, overscan]);
  
  // Handler de scroll otimizado
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    // Debounce para performance
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const newState = calculateVisibleItems(scrollTop);
      setState(prev => ({
        ...prev,
        scrollTop,
        ...newState
      }));
      
      // Callback de scroll externo
      onScroll?.(scrollTop);
      
      // Verificar se chegou ao final
      if (onEndReached && !endReachedRef.current) {
        const scrollPercentage = (scrollTop + containerHeight) / totalHeight;
        if (scrollPercentage >= endReachedThreshold) {
          endReachedRef.current = true;
          onEndReached();
          
          // Reset flag após 1 segundo
          setTimeout(() => {
            endReachedRef.current = false;
          }, 1000);
        }
      }
    }, 16); // ~60fps
  }, [calculateVisibleItems, onScroll, onEndReached, totalHeight, containerHeight, endReachedThreshold]);
  
  // Inicializar estado
  useEffect(() => {
    const initialState = calculateVisibleItems(0);
    setState(prev => ({
      ...prev,
      ...initialState
    }));
  }, [calculateVisibleItems]);
  
  // Scroll para item específico
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current || index < 0 || index >= items.length) return;
    
    const position = itemPositions[index];
    if (!position) return;
    
    let scrollTop = position.top;
    
    if (align === 'center') {
      scrollTop = position.top - (containerHeight - position.height) / 2;
    } else if (align === 'end') {
      scrollTop = position.top - containerHeight + position.height;
    }
    
    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    containerRef.current.scrollTop = scrollTop;
  }, [items.length, itemPositions, containerHeight, totalHeight]);
  
  // Render lista vazia
  if (items.length === 0 && !loading) {
    return (
      <div 
        className={`virtual-scroll-empty ${className}`}
        style={{ height: containerHeight }}
      >
        {emptyComponent || (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666',
            fontSize: '1rem'
          }}>
            Nenhum item encontrado
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Container virtual com altura total */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Renderizar apenas itens visíveis */}
        {state.visibleItems.map(({ index, item, top, height }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              height,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px',
              textAlign: 'center'
            }}
          >
            {loadingComponent || (
              <div style={{ color: '#666' }}>
                Carregando mais itens...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook personalizado para uso mais fácil
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number | ((index: number, item: T) => number),
  containerHeight: number
) {
  const VirtualList = useCallback(
    (props: Omit<VirtualScrollProps<T>, 'items' | 'itemHeight' | 'containerHeight'>) => (
      <VirtualScroll
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        {...props}
      />
    ),
    [items, itemHeight, containerHeight]
  );
  
  return {
    VirtualList,
    totalItems: items.length
  };
}

// Componente especializado para listas de transações
export function VirtualTransactionList({ 
  transactions, 
  onTransactionClick 
}: { 
  transactions: any[], 
  onTransactionClick: (transaction: any) => void 
}) {
  return (
    <VirtualScroll
      items={transactions}
      itemHeight={80}
      containerHeight={400}
      renderItem={(transaction, index) => (
        <div
          key={transaction.id}
          className="transaction-item"
          onClick={() => onTransactionClick(transaction)}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
            {transaction.description}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
            <span>{transaction.date}</span>
            <span style={{ 
              color: transaction.amount > 0 ? '#22c55e' : '#ef4444',
              fontWeight: 500
            }}>
              {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}
      emptyComponent={
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📊</div>
          <div>Nenhuma transação encontrada</div>
        </div>
      }
    />
  );
}

export default VirtualScroll;