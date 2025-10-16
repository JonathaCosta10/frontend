import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  enabled?: boolean;
}

interface VirtualItem<T> {
  item: T;
  index: number;
  offsetTop: number;
}

/**
 * Hook para implementar virtual scrolling em listas grandes
 * Melhora significativamente a performance ao renderizar apenas itens visíveis
 */
export const useVirtualScroll = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    enabled = true
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calcula quais itens devem ser renderizados
  const virtualItems = useMemo(() => {
    if (!enabled) {
      return items.map((item, index) => ({
        item,
        index,
        offsetTop: index * itemHeight
      }));
    }

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    const virtualItems: VirtualItem<T>[] = [];
    
    for (let i = start; i <= end; i++) {
      virtualItems.push({
        item: items[i],
        index: i,
        offsetTop: i * itemHeight
      });
    }

    return virtualItems;
  }, [items, scrollTop, itemHeight, containerHeight, overscan, enabled]);

  // Handler de scroll otimizado com throttle
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Setup do event listener
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element || !enabled) return;

    let ticking = false;
    
    const throttledScroll = (e: Event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    element.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll, enabled]);

  const totalHeight = items.length * itemHeight;

  return {
    virtualItems,
    totalHeight,
    scrollElementRef,
    containerProps: {
      ref: scrollElementRef,
      style: {
        height: containerHeight,
        overflow: 'auto'
      }
    }
  };
};

/**
 * Hook para lista infinita com virtual scrolling
 */
export const useInfiniteVirtualScroll = <T>(
  items: T[],
  loadMore: () => Promise<void>,
  options: VirtualScrollOptions & {
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    threshold?: number;
  }
) => {
  const {
    threshold = 5,
    hasNextPage = false,
    isFetchingNextPage = false,
    ...virtualOptions
  } = options;

  const virtualScroll = useVirtualScroll(items, virtualOptions);
  const { virtualItems, scrollElementRef } = virtualScroll;

  // Detecta quando está próximo do final da lista
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const lastVisibleIndex = Math.max(...virtualItems.map(item => item.index));
    const shouldLoadMore = items.length - lastVisibleIndex <= threshold;

    if (shouldLoadMore) {
      loadMore();
    }
  }, [virtualItems, items.length, hasNextPage, isFetchingNextPage, threshold, loadMore]);

  return virtualScroll;
};

/**
 * Hook para grid virtual (2D scrolling)
 */
export const useVirtualGrid = <T>(
  items: T[],
  options: {
    itemWidth: number;
    itemHeight: number;
    containerWidth: number;
    containerHeight: number;
    columns: number;
    gap?: number;
    overscan?: number;
  }
) => {
  const {
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight,
    columns,
    gap = 0,
    overscan = 5
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const virtualItems = useMemo(() => {
    const rows = Math.ceil(items.length / columns);
    const rowHeight = itemHeight + gap;
    const colWidth = itemWidth + gap;

    const visibleRowStart = Math.floor(scrollTop / rowHeight);
    const visibleRowEnd = Math.min(
      rows - 1,
      Math.floor((scrollTop + containerHeight) / rowHeight)
    );

    const visibleColStart = Math.floor(scrollLeft / colWidth);
    const visibleColEnd = Math.min(
      columns - 1,
      Math.floor((scrollLeft + containerWidth) / colWidth)
    );

    const start = Math.max(0, visibleRowStart - overscan);
    const end = Math.min(rows - 1, visibleRowEnd + overscan);

    const virtualItems: Array<VirtualItem<T> & { column: number; row: number }> = [];

    for (let row = start; row <= end; row++) {
      for (let col = visibleColStart; col <= visibleColEnd; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          virtualItems.push({
            item: items[index],
            index,
            offsetTop: row * rowHeight,
            column: col,
            row
          });
        }
      }
    }

    return virtualItems;
  }, [
    items,
    scrollTop,
    scrollLeft,
    columns,
    itemHeight,
    itemWidth,
    gap,
    containerHeight,
    containerWidth,
    overscan
  ]);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  }, []);

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    let ticking = false;
    
    const throttledScroll = (e: Event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    element.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap);
  const totalWidth = columns * (itemWidth + gap);

  return {
    virtualItems,
    totalHeight,
    totalWidth,
    scrollElementRef,
    containerProps: {
      ref: scrollElementRef,
      style: {
        height: containerHeight,
        width: containerWidth,
        overflow: 'auto'
      }
    }
  };
};

export default useVirtualScroll;
