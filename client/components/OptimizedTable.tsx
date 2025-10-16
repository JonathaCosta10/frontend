import React, { useMemo } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { withOptimizedMemo } from './OptimizedMemo';

interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  width?: number;
  sortable?: boolean;
  className?: string;
}

interface OptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  height?: number;
  itemHeight?: number;
  enableVirtualScrolling?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
}

/**
 * Componente de tabela otimizada com virtual scrolling
 * Ideal para grandes volumes de dados
 */
const OptimizedTableInner = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  height = 400,
  itemHeight = 48,
  enableVirtualScrolling = true,
  emptyMessage = 'Nenhum dado encontrado',
  onRowClick,
  className = ''
}: OptimizedTableProps<T>) => {
  
  // Virtual scrolling para performance
  const {
    virtualItems,
    totalHeight,
    scrollElementRef,
    containerProps
  } = useVirtualScroll(data, {
    itemHeight,
    containerHeight: height,
    overscan: 5,
    enabled: enableVirtualScrolling && data.length > 20 // Só ativa para listas grandes
  });

  // Memoiza as colunas para evitar re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Renderiza loading state
  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center border rounded-lg">
        <LoadingSpinner size="lg" text="Carregando dados..." />
      </div>
    );
  }

  // Renderiza estado vazio
  if (!data.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center border rounded-lg">
        <div className="text-center text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Header fixo */}
      <div className="border-b bg-muted/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {memoizedColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.className}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Body com virtual scrolling */}
      <div {...containerProps} className="relative">
        <div style={{ height: totalHeight }}>
          <Table>
            <TableBody>
              {virtualItems.map(({ item, index, offsetTop }) => (
                <TableRow
                  key={index}
                  style={{
                    position: 'absolute',
                    top: offsetTop,
                    left: 0,
                    right: 0,
                    height: itemHeight
                  }}
                  className={`
                    ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    border-b
                  `}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {memoizedColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.className}
                      style={{ width: column.width }}
                    >
                      {column.accessor(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

// Memoização da tabela para evitar re-renders desnecessários
export const OptimizedTable = withOptimizedMemo(OptimizedTableInner, {
  deepCompare: false,
  ignoreProps: ['onRowClick'], // Ignora função que pode mudar de referência
  debugName: 'OptimizedTable'
});

/**
 * Hook para configuração rápida de colunas
 */
export const useTableColumns = <T extends Record<string, any>>(
  config: Array<{
    key: keyof T;
    header: string;
    width?: number;
    format?: (value: any) => React.ReactNode;
    className?: string;
  }>
): Column<T>[] => {
  return useMemo(
    () => config.map(col => ({
      key: String(col.key),
      header: col.header,
      width: col.width,
      className: col.className,
      accessor: (item: T) => {
        const value = item[col.key];
        return col.format ? col.format(value) : value;
      }
    })),
    [config]
  );
};

/**
 * Hook para paginação de tabela
 */
export const useTablePagination = <T,>(
  data: T[],
  pageSize: number = 50
) => {
  const [currentPage, setCurrentPage] = React.useState(0);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const goToPage = React.useCallback((page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  const nextPage = React.useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = React.useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  };
};

export default OptimizedTable;
