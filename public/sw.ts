// Service Worker para PWA
/// <reference no-default-lib="true"/>
/// <reference lib="es2017" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

// Configurações do cache
const CACHE_NAME = 'organizesee-v1.0.0';
const STATIC_CACHE = 'organizesee-static-v1';
const DYNAMIC_CACHE = 'organizesee-dynamic-v1';
const API_CACHE = 'organizesee-api-v1';

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Estratégias de cache por tipo
const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first',
  dynamic: 'stale-while-revalidate'
} as const;

// Cache limits
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 30
};

/**
 * Install Event - Pré-cache de recursos essenciais
 */
sw.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return sw.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

/**
 * Activate Event - Limpeza de caches antigos
 */
sw.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle de todas as abas
      sw.clients.claim()
    ])
  );
});

/**
 * Fetch Event - Interceptação de requests
 */
sw.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não HTTP
  if (!request.url.startsWith('http')) return;
  
  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

/**
 * Background Sync - Para quando voltar online
 */
sw.addEventListener('sync', (event: any) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * Push Event - Notificações
 */
sw.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received');
  
  const options = {
    body: event.data?.text() || 'Organizesee: Nova atualização disponível',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'organizesee-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    sw.registration.showNotification('Organizesee', options)
  );
});

/**
 * Notification Click - Ação das notificações
 */
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      sw.clients.openWindow('/')
    );
  }
});

/**
 * Cache-First Strategy para assets estáticos
 */
async function handleStaticAsset(request: Request): Promise<Response> {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Service Worker: Error handling static asset:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Network-First Strategy para API calls
 */
async function handleAPIRequest(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
      
      // Limitar tamanho do cache
      await limitCacheSize(API_CACHE, CACHE_LIMITS[API_CACHE]);
    }
    
    return response;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Resposta offline personalizada para API
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Dados não disponíveis offline',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-First Strategy para imagens
 */
async function handleImageRequest(request: Request): Promise<Response> {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Imagem placeholder para offline
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Offline</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

/**
 * Stale-While-Revalidate Strategy para conteúdo dinâmico
 */
async function handleDynamicRequest(request: Request): Promise<Response> {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Fetch em background para atualizar cache
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
        limitCacheSize(DYNAMIC_CACHE, CACHE_LIMITS[DYNAMIC_CACHE]);
      }
      return response;
    });
    
    // Retornar cache imediatamente se disponível
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Aguardar fetch se não há cache
    return await fetchPromise;
  } catch (error) {
    console.error('Service Worker: Error handling dynamic request:', error);
    
    // Página offline como fallback
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Page not available offline', { status: 503 });
  }
}

/**
 * Background Sync Handler
 */
async function handleBackgroundSync(): Promise<void> {
  try {
    // Implementar sincronização de dados pendentes
    console.log('Service Worker: Performing background sync');
    
    // Exemplo: sincronizar dados do localStorage
    const clients = await sw.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        payload: { status: 'completed' }
      });
    });
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

/**
 * Limitar tamanho do cache
 */
async function limitCacheSize(cacheName: string, maxItems: number): Promise<void> {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    const deletePromises = keys
      .slice(0, keys.length - maxItems)
      .map(key => cache.delete(key));
    
    await Promise.all(deletePromises);
    console.log(`Service Worker: Cleaned cache ${cacheName}, removed ${deletePromises.length} items`);
  }
}

/**
 * Helpers para identificar tipos de request
 */
function isStaticAsset(url: URL): boolean {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) !== null ||
         STATIC_ASSETS.some(asset => url.pathname === asset);
}

function isAPIRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/') ||
         url.hostname !== location.hostname ||
         url.pathname.includes('backend');
}

function isImageRequest(url: URL): boolean {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/) !== null;
}

export {};