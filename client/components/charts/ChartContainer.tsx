import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChartContainerProps {
  title?: string;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyStateConfig?: {
    title: string;
    description: string;
    actions?: Array<{
      label: string;
      href: string;
      variant?: 'default' | 'outline';
    }>;
  };
  onRefresh?: () => void;
  className?: string;
  children: React.ReactNode;
}

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Carregando dados..." }) => (
  <div className="flex justify-center items-center h-[300px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

const EmptyState: React.FC<{ config: NonNullable<ChartContainerProps['emptyStateConfig']> }> = ({ config }) => (
  <Card className="h-[350px] flex items-center justify-center">
    <CardContent className="text-center space-y-4">
      <div className="text-muted-foreground">
        <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm">{config.description}</p>
      </div>
      {config.actions && (
        <div className="space-y-2">
          {config.actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                variant={action.variant || 'default'} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const ErrorState: React.FC<{ error: string; onRefresh?: () => void }> = ({ error, onRefresh }) => (
  <Card className="h-[350px] flex items-center justify-center">
    <CardContent className="text-center space-y-4">
      <div className="text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
        <p className="text-sm">{error}</p>
      </div>
      {onRefresh && (
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </CardContent>
  </Card>
);

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  loading = false,
  error = null,
  isEmpty = false,
  emptyStateConfig,
  onRefresh,
  className = '',
  children
}) => {
  const content = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return <ErrorState error={error} onRefresh={onRefresh} />;
    }
    
    if (isEmpty && emptyStateConfig) {
      return <EmptyState config={emptyStateConfig} />;
    }
    
    return children;
  };

  if (title) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && !loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {content()}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {content()}
    </div>
  );
};

export default ChartContainer;
