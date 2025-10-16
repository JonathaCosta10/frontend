import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { clearAllAuthState } from '@/lib/authUtils';

// Add gtag definition for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: {
        error_type: string;
        error_message: string;
        login_context: string;
        app_version: string;
        [key: string]: any;
      }
    ) => void;
  }
}

interface ErrorInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  variant: 'error' | 'warning' | 'info';
  autoRetry: boolean;
}

const OAuthErrorHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [autoRetrying, setAutoRetrying] = useState(false);
  
  useEffect(() => {
    // Parse error parameters from URL
    const params = new URLSearchParams(location.search);
    const errorCode = params.get('error');
    const errorMessage = params.get('message') || 'Erro desconhecido';
    const newAuthUrl = params.get('new_auth_url');
    const errorDetails = params.get('details');
    const deviceId = params.get('device_id');
    const loginContext = params.get('login_context');
    const appVersion = params.get('app_version');
    const locale = params.get('locale');
    
    // Log detalhado com todos os parâmetros disponíveis
    console.log("🚨 OAuth Error Handler:", { 
      errorCode, 
      errorMessage: errorMessage ? decodeURIComponent(errorMessage) : null,
      newAuthUrl: newAuthUrl ? decodeURIComponent(newAuthUrl) : null,
      errorDetails: errorDetails ? decodeURIComponent(errorDetails) : null,
      deviceId,
      loginContext,
      appVersion,
      locale,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      currentUrl: window.location.href
    });
    
    // Registrar evento de erro para análise
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'oauth_error', {
          error_type: errorCode || 'unknown',
          error_message: errorMessage ? decodeURIComponent(errorMessage) : 'Unknown error',
          login_context: loginContext || 'unknown',
          app_version: appVersion || 'unknown'
        });
      }
    } catch (e) {
      console.error('Failed to log error analytics:', e);
    }

    // Clear any previous auth state to avoid conflicts
    clearAllAuthState();
    
    // Configure error information based on error code
    const errorConfig: Record<string, ErrorInfo> = {
      expired_code: {
        title: 'Código de autenticação expirado',
        description: 'O código de autorização Google expirou antes de ser processado completamente.',
        icon: <RefreshCw className="h-8 w-8 text-amber-500" />,
        actionText: 'Tentar novamente',
        variant: 'warning',
        autoRetry: true
      },
      invalid_grant: {
        title: 'Autorização inválida',
        description: 'A sessão de autenticação é inválida ou já foi utilizada.',
        icon: <RefreshCw className="h-8 w-8 text-amber-500" />,
        actionText: 'Iniciar nova autenticação',
        variant: 'warning',
        autoRetry: true
      },
      access_denied: {
        title: 'Acesso negado',
        description: 'A autorização foi negada pelo usuário ou pelo Google.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      server_error: {
        title: 'Erro no servidor',
        description: 'Ocorreu um erro no servidor durante o processamento da autenticação.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      invalid_request: {
        title: 'Requisição inválida',
        description: 'Os parâmetros da requisição de autenticação são inválidos.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      redirect_uri_mismatch: {
        title: 'URI de redirecionamento inválido',
        description: 'A URI de redirecionamento não corresponde às URIs configuradas no console do Google.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      unauthorized_client: {
        title: 'Cliente não autorizado',
        description: 'O cliente OAuth não está autorizado para esta ação. Verifique as configurações no Console Google.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      unsupported_response_type: {
        title: 'Tipo de resposta não suportado',
        description: 'O tipo de resposta solicitado não é suportado pelo servidor de autorização.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      invalid_scope: {
        title: 'Escopo inválido',
        description: 'Os escopos solicitados são inválidos ou não estão disponíveis para este cliente.',
        icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
        actionText: 'Tentar com escopos padrão',
        variant: 'warning',
        autoRetry: true
      },
      invalid_client: {
        title: 'Cliente inválido',
        description: 'O ID do cliente OAuth não é válido ou não está configurado corretamente.',
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        actionText: 'Voltar ao login',
        variant: 'error',
        autoRetry: false
      },
      network_error: {
        title: 'Erro de rede',
        description: 'Ocorreu um problema de conexão durante a autenticação. Verifique sua conexão com a internet.',
        icon: <RefreshCw className="h-8 w-8 text-amber-500" />,
        actionText: 'Tentar novamente',
        variant: 'warning',
        autoRetry: true
      },
      timeout_error: {
        title: 'Tempo limite excedido',
        description: 'A requisição de autenticação levou muito tempo e foi cancelada.',
        icon: <RefreshCw className="h-8 w-8 text-amber-500" />,
        actionText: 'Tentar novamente',
        variant: 'warning',
        autoRetry: true
      },
      popup_closed: {
        title: 'Janela fechada',
        description: 'A janela de autenticação foi fechada antes de concluir o processo.',
        icon: <Info className="h-8 w-8 text-blue-500" />,
        actionText: 'Tentar novamente',
        variant: 'info',
        autoRetry: false
      },
      popup_blocked: {
        title: 'Pop-up bloqueado',
        description: 'O navegador bloqueou a janela de autenticação. Permita pop-ups para este site.',
        icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
        actionText: 'Tentar método direto',
        variant: 'warning',
        autoRetry: false
      },
      default: {
        title: 'Erro na autenticação',
        description: errorMessage ? decodeURIComponent(errorMessage) : 'Ocorreu um erro durante o processo de autenticação.',
        icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
        actionText: 'Voltar ao login',
        variant: 'warning',
        autoRetry: false
      }
    };
    
    const info = errorCode ? errorConfig[errorCode] || errorConfig.default : errorConfig.default;
    
    // If we have a custom error message, use it
    if (errorMessage) {
      info.description = decodeURIComponent(errorMessage);
    }
    
    // If we have a new auth URL, we can auto-retry regardless of default setting
    if (newAuthUrl) {
      info.autoRetry = true;
    }
    
    setErrorInfo(info);
    
    // If auto retry is enabled, start countdown
    if (info.autoRetry) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRetry(newAuthUrl ? decodeURIComponent(newAuthUrl) : null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [location.search]);
  
  const handleRetry = (newAuthUrl: string | null) => {
    if (autoRetrying) return;
    setAutoRetrying(true);
    
    // Parse URL params for enhanced retry handling
    const params = new URLSearchParams(location.search);
    const errorCode = params.get('error');
    const loginContext = params.get('login_context') || 'signin';
    
    // Show toast
    toast({
      title: "Reiniciando autenticação",
      description: "Você será redirecionado para a página de autenticação do Google."
    });
    
    // Log retry attempt
    console.log("🔄 Retry attempt for error:", { errorCode, loginContext });
    
    setTimeout(() => {
      // Tentar limpar quaisquer estados ou cookies que possam estar causando problemas
      clearAllAuthState();
      
      if (newAuthUrl) {
        // Se temos uma nova URL de autenticação fornecida pelo backend, usá-la
        console.log("🔗 Redirecionando para URL fornecida pelo backend:", newAuthUrl);
        window.location.href = newAuthUrl;
      } else {
        // Retry via endpoint unificado do backend (server-driven)
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace('localhost','127.0.0.1');
        const state = 'google_auth_retry_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem('google_auth_state', state);
        localStorage.setItem('google_auth_timestamp', Date.now().toString());
        localStorage.setItem('google_auth_retry_count', '1');

        const deviceId = `${navigator.platform}-${Math.random().toString(36).substring(2, 10)}`.substring(0, 40);
        const baseParams = new URLSearchParams({
          login_context: loginContext,
          return_to: `${window.location.origin}/dashboard`,
          error_callback: `${window.location.origin}/auth/error`,
          app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          locale: navigator.language,
          device_id: deviceId,
          access_type: 'offline',
          prompt: 'consent',
          state
        });

        // Para invalid_scope, tentar com escopos reduzidos
        if (errorCode === 'invalid_scope') {
          baseParams.set('scope', 'email profile');
          console.log('🔄 invalid_scope: tentando com escopos reduzidos via backend signin');
        }

        const signinUrl = `${backendUrl}/auth/unified/google/signin/?${baseParams.toString()}`;
        console.log('🔗 Redirecionando via backend signin:', signinUrl);
        window.location.href = signinUrl;
      }
    }, 1000);
  };
  
  const handleBackToLogin = () => {
    navigate('/login');
  };
  
  if (!errorInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-center text-gray-500">Carregando informações do erro...</p>
      </div>
    );
  }
  
  const { title, description, icon, actionText, variant, autoRetry } = errorInfo;
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {icon}
          </div>
          <CardTitle className={`text-center ${variant === 'error' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>
            {title}
          </CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {autoRetry && (
            <div className="text-center my-2">
              <p className="text-sm text-gray-500">
                Redirecionando automaticamente em {countdown} segundos...
              </p>
              <div className="w-full bg-gray-200 h-1 mt-2 rounded-full">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Detalhes técnicos disponíveis via disclosure - apenas para desenvolvedores */}
          <details className="mt-4 text-xs text-gray-500">
            <summary className="cursor-pointer">Detalhes técnicos</summary>
            <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-[200px]">
              <p><strong>Código de erro:</strong> {new URLSearchParams(location.search).get('error') || 'N/A'}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>Referrer:</strong> {document.referrer || 'N/A'}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 60)}</p>
              <p><strong>Contexto:</strong> {new URLSearchParams(location.search).get('login_context') || 'N/A'}</p>
              <p><strong>App Version:</strong> {new URLSearchParams(location.search).get('app_version') || 'N/A'}</p>
              <p className="text-gray-400 mt-2">
                Estas informações são para uso exclusivo do suporte técnico.
              </p>
              <p className="text-gray-400">
                ID do erro: {Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36)}
              </p>
            </div>
          </details>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBackToLogin}
          >
            Voltar ao login
          </Button>
          {(!autoRetry || countdown === 0) && (
            <Button 
              onClick={() => handleRetry(null)}
              variant="default"
              className={variant === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionText}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OAuthErrorHandler;
