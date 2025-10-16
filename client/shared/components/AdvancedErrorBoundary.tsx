import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Error Boundary avançado com:
 * - Logging de erros
 * - Retry functionality  
 * - Fallback personalizado por feature
 * - Isolamento de erros por feature
 */
class AdvancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log do erro com contexto
    console.error(`🚨 Error in feature: ${this.props.featureName || 'Unknown'}`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar erro para serviço de monitoramento (implementar depois)
    this.reportError(error, errorInfo);
  }

  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrar com serviço de monitoramento (Sentry, LogRocket, etc.)
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      feature: this.props.featureName,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Por enquanto, apenas log local
    localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorReport));
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: this.generateErrorId()
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão avançado
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  Encontramos um problema {this.props.featureName && `na seção ${this.props.featureName}`}.
                </p>
                <p className="text-sm">
                  Nossa equipe foi notificada automaticamente.
                </p>
              </div>

              {/* Detalhes técnicos (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    Detalhes técnicos (dev only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Ações do usuário */}
              <div className="flex flex-col space-y-3">
                {this.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tentar novamente ({this.maxRetries - this.retryCount} tentativas restantes)
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Página inicial
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReloadPage}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recarregar
                  </Button>
                </div>
              </div>

              {/* ID do erro para suporte */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  ID do erro: <code className="bg-gray-100 px-1 rounded">{this.state.errorId}</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use este código ao entrar em contato com o suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdvancedErrorBoundary;