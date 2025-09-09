import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { localStorageManager } from '@/lib/localStorage';
import { clearAllAuthState } from '@/lib/authUtils';

const GoogleOAuthCallbackUltimate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Limpar completamente o estado anterior para prevenir problemas
        clearAllAuthState();
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const message = searchParams.get('message');
        const newAuthUrl = searchParams.get('new_auth_url');

        console.log("🎯 Google OAuth Callback (Ultimate):", { 
          code: code ? `${code.substring(0, 10)}...` : null, 
          state, 
          error,
          message: message ? decodeURIComponent(message) : null,
          newAuthUrl: newAuthUrl ? decodeURIComponent(newAuthUrl) : null,
          fullUrl: window.location.href
        });

        // Tratar erro de código expirado
        if (error === 'expired_code') {
          console.log("⚠️ Código OAuth expirado detectado");
          
          const decodedMessage = message ? decodeURIComponent(message) : 'Código OAuth expirado';
          const decodedNewAuthUrl = newAuthUrl ? decodeURIComponent(newAuthUrl) : null;
          
          console.log("🔄 Nova URL de autenticação fornecida pelo backend:", decodedNewAuthUrl);
          
          if (window.opener) {
            console.log("📨 Notificando janela pai sobre código expirado...");
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_EXPIRED',
              error: 'expired_code',
              message: decodedMessage,
              newAuthUrl: decodedNewAuthUrl,
              autoRetry: !!decodedNewAuthUrl // Indica se deve fazer retry automático
            }, window.location.origin);
            
            setTimeout(() => {
              window.close();
            }, 500);
            return;
          }
          
          // Se não estamos em popup e temos nova URL, redirecionar automaticamente
          if (decodedNewAuthUrl) {
            console.log("🔄 Redirecionando automaticamente para nova URL de autenticação...");
            window.location.href = decodedNewAuthUrl;
            return;
          }
          
          // Fallback: redirecionar para login com erro
          navigate('/login?error=expired_code&message=' + encodeURIComponent(decodedMessage));
          return;
        }

        // Tratar outros erros OAuth
        if (error && error !== 'expired_code') {
          console.error("❌ Erro OAuth do Google:", error);
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: error,
              message: message ? decodeURIComponent(message) : null
            }, window.location.origin);
            window.close();
            return;
          }
          
          navigate('/login?error=' + encodeURIComponent(error));
          return;
        }

        // Processar código válido
        if (code && state) {
          console.log("✅ Código OAuth válido recebido");
          
          // Aguardar processamento do backend e verificar autenticação múltiplas vezes
          console.log("⏳ Aguardando backend processar OAuth...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verificar autenticação com retry
          let isAuthenticated = false;
          let userData = null;
          let authTokens = null;
          const maxRetries = 3;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              // IMPORTANTE: Usar sempre a URL fixa 127.0.0.1:8000
              const backendUrl = 'http://127.0.0.1:8000';
              const apiKey = import.meta.env.VITE_API_KEY;
              
              console.log(`🔍 Verificando autenticação no backend (tentativa ${attempt}/${maxRetries})...`);
              
              // Primeiro, tentar obter tokens explicitamente com o código OAuth
              if (attempt === 1) { // Apenas na primeira tentativa para evitar "código já utilizado"
                try {
                  console.log("🔑 Obtendo tokens com código OAuth...");
                  const tokenResponse = await fetch(`${backendUrl}/api/auth/token/`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-API-Key': apiKey,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                      code,
                      state,
                      provider: 'google',
                      from_callback: true,
                      redirect_uri: 'http://127.0.0.1:8000/auth/google/callback' // URI fixa para garantir
                    })
                  });
                  
                  if (tokenResponse.ok) {
                    authTokens = await tokenResponse.json();
                    console.log("✅ Tokens obtidos explicitamente:", { 
                      access_token: authTokens.access_token ? `${authTokens.access_token.substring(0, 15)}...` : null,
                      refresh_token: authTokens.refresh_token ? "presente" : "ausente"
                    });
                  } else {
                    console.log("⚠️ Não foi possível obter tokens explicitamente:", tokenResponse.status);
                    // Continuar com a verificação de perfil mesmo sem tokens
                  }
                } catch (tokenError) {
                  console.error("⚠️ Erro ao obter tokens:", tokenError);
                  // Continuar com a verificação de perfil
                }
              }
              
              // Verificar perfil do usuário para confirmar autenticação
              const profileResponse = await fetch(`${backendUrl}/api/user/profile/`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'X-API-Key': apiKey,
                  ...(authTokens?.access_token && { 'Authorization': `Bearer ${authTokens.access_token}` })
                },
                credentials: 'include',
              });

              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log("✅ Perfil obtido com sucesso:", profileData);
                
                isAuthenticated = true;
                userData = {
                  email: profileData.email,
                  name: profileData.name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
                  first_name: profileData.first_name,
                  last_name: profileData.last_name,
                  id: profileData.id,
                  is_verified: profileData.is_verified,
                  google_id: profileData.google_id,
                  profile_picture: profileData.profile_picture
                };
                
                // Tentar obter tokens JWT se disponíveis
                const accessToken = profileData.access_token;
                const refreshToken = profileData.refresh_token;
                
                if (accessToken) {
                  authTokens = {
                    access_token: accessToken,
                    refresh_token: refreshToken
                  };
                  console.log("✅ Tokens JWT obtidos do backend");
                } else {
                  console.log("ℹ️ Tokens JWT não fornecidos, usando autenticação por sessão");
                }
                
                break; // Sucesso, sair do loop
                
              } else if (profileResponse.status === 401) {
                console.log(`⚠️ Usuário não autenticado (tentativa ${attempt}/${maxRetries})`);
                
                if (attempt === maxRetries) {
                  // Última tentativa: redirecionar para signup
                  console.log("🔄 Redirecionando para signup após múltiplas tentativas...");
                  
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'GOOGLE_AUTH_SUCCESS',
                      action: 'SIGNUP_REQUIRED',
                      code: code,
                      state: state
                    }, window.location.origin);
                    window.close();
                    return;
                  }
                  
                  navigate(`/signup?google_auth=true`);
                  return;
                }
                
                // Aguardar antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 1000));
                
              } else {
                console.log(`⚠️ Erro ${profileResponse.status} ao verificar perfil (tentativa ${attempt}/${maxRetries})`);
                
                if (attempt < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  throw new Error(`Erro ${profileResponse.status} após ${maxRetries} tentativas`);
                }
              }
              
            } catch (fetchError) {
              console.error(`❌ Erro na tentativa ${attempt}:`, fetchError);
              
              if (attempt === maxRetries) {
                throw fetchError; // Re-throw na última tentativa
              }
              
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (isAuthenticated && userData) {
            // Limpar qualquer token anterior antes de configurar o novo
            clearAllAuthState();
            console.log("🧹 Estado anterior completamente limpo antes de salvar novos tokens");
            
            // Gerenciar tokens JWT corretamente
            let finalAuthToken;
            
            if (authTokens && authTokens.access_token) {
              // Usar tokens JWT fornecidos pelo backend
              finalAuthToken = authTokens.access_token;
              localStorageManager.setAuthToken(authTokens.access_token);
              
              if (authTokens.refresh_token) {
                localStorageManager.setRefreshToken(authTokens.refresh_token);
                console.log("✅ Tokens JWT salvos (access + refresh)");
              } else {
                console.log("✅ Token JWT de acesso salvo (sem refresh token)");
              }
              
            } else {
              // Fallback: gerar token de sessão temporário
              finalAuthToken = `django_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              localStorageManager.setAuthToken(finalAuthToken);
              console.log("✅ Token de sessão temporário criado (fallback)");
            }
            
            // Salvar dados do usuário
            localStorageManager.setUserData(userData);
            console.log("✅ Dados do usuário salvos no localStorage");

            if (window.opener) {
              console.log("📨 Notificando sucesso com tokens...");
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                action: 'LOGIN_COMPLETE',
                token: finalAuthToken,
                user: userData,
                hasJWT: !!(authTokens && authTokens.access_token)
              }, window.location.origin);
              
              setTimeout(() => {
                window.close();
              }, 500);
              return;
            }

            navigate('/dashboard');
            return;
            
          } else {
            console.error("❌ Falha na autenticação");
            
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'authentication_failed',
                message: 'Falha na verificação de autenticação'
              }, window.location.origin);
              window.close();
              return;
            }
            
            navigate('/login?error=auth_failed');
            return;
          }

        } else {
          console.error("❌ Parâmetros OAuth ausentes");
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'missing_params',
              message: 'Parâmetros de autenticação ausentes'
            }, window.location.origin);
            window.close();
            return;
          }
          
          navigate('/login?error=missing_params');
        }

      } catch (error) {
        console.error("❌ Erro crítico no callback:", error);
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'callback_error',
            message: 'Erro interno no processamento'
          }, window.location.origin);
          window.close();
          return;
        }
        
        navigate('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Processando autenticação Google...
        </h2>
        <p className="text-gray-500 mb-4">
          Verificando sua autenticação no servidor.
        </p>
        <div className="text-sm text-gray-400">
          ⚠️ Não feche esta janela
        </div>
        
        {/* Debug info para desenvolvimento */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded text-xs text-left">
            <strong>Debug Info:</strong><br/>
            URL: {window.location.href}<br/>
            Code: {searchParams.get('code') ? '✓' : '✗'}<br/>
            State: {searchParams.get('state') || 'N/A'}<br/>
            Error: {searchParams.get('error') || 'None'}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallbackUltimate;
