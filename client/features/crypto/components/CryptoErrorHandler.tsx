import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';

interface CryptoErrorHandlerProps {
  error: string | null;
  onRetry: () => void;
  isPending?: boolean;
}

/**
 * Componente para exibir erros e permitir recarregar os dados de criptomoedas
 */
export function CryptoErrorHandler({ error, onRetry, isPending = false }: CryptoErrorHandlerProps) {
  if (!error) return null;
  
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erro ao carregar dados</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center border-red-300 hover:bg-red-100 dark:border-red-600 dark:hover:bg-red-900/30"
                onClick={onRetry}
                disabled={isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? 'Tentando novamente...' : 'Tentar novamente'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
                onClick={() => window.open('https://status.organizesee.com.br', '_blank')}
              >
                <Info className="h-4 w-4 mr-2" />
                Status do sistema
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoErrorHandler;
