// Utility para limpar completamente o estado de autenticação
export const clearAllAuthState = () => {
  console.log("🧹 Limpando todo estado de autenticação...");
  
  // Limpar localStorage - lista expandida
  const keysToRemove = [
    'authToken', 'auth_token', 'access_token', 'token',
    'refreshToken', 'refresh_token',
    'userData', 'user_data', 'user',
    'userPermissions', 'userSettings', 'user_permissions', 'user_settings',
    'google_auth_state', 'oauth_state',
    'google_auth_code', 'oauth_code',
    'auth_timestamp', 'login_timestamp', 
    'session_id', 'csrf_token', 'django_sessionid',
    // Adicionar todos os possíveis nomes de chave usados pelo sistema
    'jwt_token', 'jwt_refresh_token', 'expires_at',
    'last_login', 'auth_provider', 'auth_type',
    'id_token', 'authorization_code'
  ];
  
  // Limpar localStorage
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("⚠️ Erro ao remover item do localStorage:", key);
    }
  });
  
  // Limpar sessionStorage
  keysToRemove.forEach(key => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("⚠️ Erro ao remover item do sessionStorage:", key);
    }
  });
  
  // Limpar todos os cookies relacionados ao auth
  const authCookies = [
    'authToken', 'access_token', 'sessionid', 'csrftoken',
    'django_session', 'google_oauth_state', 'oauth_code'
  ];
  
  authCookies.forEach(cookie => {
    // Limpar para diferentes paths e domínios
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth/`;
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api/`;
  });
  
  console.log("✅ Estado de autenticação completamente limpo");
};

// Utility para debug do estado atual
export const debugAuthState = () => {
  console.log("🔍 DEBUG - Estado atual de autenticação:");
  console.log("localStorage:", {
    authToken: localStorage.getItem('authToken'),
    userData: localStorage.getItem('userData'),
    refreshToken: localStorage.getItem('refreshToken'),
    accessToken: localStorage.getItem('access_token')
  });
  console.log("sessionStorage:", {
    authToken: sessionStorage.getItem('authToken'),
    userData: sessionStorage.getItem('userData')
  });
  console.log("cookies:", document.cookie);
  
  // Verificar se há conflitos
  const conflicts = [];
  if (localStorage.getItem('authToken') && localStorage.getItem('access_token')) {
    conflicts.push('authToken e access_token ambos presentes');
  }
  if (localStorage.getItem('userData') && sessionStorage.getItem('userData')) {
    conflicts.push('userData duplicado em localStorage e sessionStorage');
  }
  
  if (conflicts.length > 0) {
    console.warn("⚠️ Conflitos detectados:", conflicts);
  }
};

// Utility para validar estado de autenticação
export const validateAuthState = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
  const userData = localStorage.getItem('userData');
  
  const isValid = !!(token && userData);
  
  console.log("🔐 Validação de estado de autenticação:", {
    hasToken: !!token,
    hasUserData: !!userData,
    isValid
  });
  
  return isValid;
};
