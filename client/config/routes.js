/**
 * Configuração central de rotas para a aplicação
 * Este arquivo ajuda a garantir consistência nas rotas usadas em diferentes componentes
 */

export const ROUTES = {
  // Rotas públicas
  HOME: '/',
  ABOUT: '/about',
  WHITEPAPER: '/whitepaper',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS: '/terms',
  DEMO: '/demo',
  MARKET: '/market',
  CRIPTO_MARKET: '/cripto-market',
  
  // Autenticação
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Dashboard e rotas protegidas
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export default ROUTES;
