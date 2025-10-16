/**
 * Progressive Web App (PWA) Setup
 * Configuração e inicialização das funcionalidades PWA
 */

import React from 'react';

interface PWAConfig {
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
  enableOfflineMode: boolean;
  updateCheckInterval: number;
}

interface PWAUpdateInfo {
  available: boolean;
  version?: string;
  changelog?: string[];
}

class PWAManager {
  private config: PWAConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private updateCallbacks: Array<(info: PWAUpdateInfo) => void> = [];
  private installPromptEvent: any = null;
  
  constructor(config: Partial<PWAConfig> = {}) {
    this.config = {
      enableNotifications: true,
      enableBackgroundSync: true,
      enableOfflineMode: true,
      updateCheckInterval: 30 * 60 * 1000, // 30 minutos
      ...config
    };
  }
  
  /**
   * Inicializar PWA
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing PWA Manager...');
    
    try {
      // Registrar Service Worker
      await this.registerServiceWorker();
      
      // Setup de listeners
      this.setupEventListeners();
      
      // Verificar se pode ser instalado
      this.setupInstallPrompt();
      
      // Configurar notificações
      if (this.config.enableNotifications) {
        await this.setupNotifications();
      }
      
      // Configurar verificação de updates
      this.setupUpdateChecker();
      
      console.log('✅ PWA Manager initialized successfully');
    } catch (error) {
      console.error('❌ PWA initialization failed:', error);
    }
  }
  
  /**
   * Registrar Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers not supported');
    }
    
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module'
      });
      
      console.log('✅ Service Worker registered:', this.registration.scope);
      
      // Aguardar SW estar pronto
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }
  
  /**
   * Setup de event listeners
   */
  private setupEventListeners(): void {
    // Listener para updates do SW
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 New Service Worker version found');
        this.handleServiceWorkerUpdate();
      });
    }
    
    // Listener para mudanças de conectividade
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      this.handleOnlineStatus(true);
    });
    
    window.addEventListener('offline', () => {
      console.log('📱 Gone offline');
      this.handleOnlineStatus(false);
    });
    
    // Listener para mensagens do SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event);
    });
    
    // Listener para beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPromptEvent = e;
      console.log('📱 Install prompt available');
    });
    
    // Listener para appinstalled
    window.addEventListener('appinstalled', () => {
      console.log('✅ App installed successfully');
      this.installPromptEvent = null;
    });
  }
  
  /**
   * Setup do prompt de instalação
   */
  private setupInstallPrompt(): void {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App is running in standalone mode');
      return;
    }
    
    // Detectar plataforma
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      this.showIOSInstallInstructions();
    } else if (isAndroid && !this.installPromptEvent) {
      // Android sem prompt automático
      this.showAndroidInstallInstructions();
    }
  }
  
  /**
   * Mostrar prompt de instalação
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPromptEvent) {
      console.log('❌ Install prompt not available');
      return false;
    }
    
    try {
      const result = await this.installPromptEvent.prompt();
      console.log('📱 Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        console.log('✅ User accepted install prompt');
        return true;
      } else {
        console.log('❌ User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('❌ Install prompt error:', error);
      return false;
    } finally {
      this.installPromptEvent = null;
    }
  }
  
  /**
   * Verificar se pode ser instalado
   */
  canInstall(): boolean {
    return this.installPromptEvent !== null;
  }
  
  /**
   * Verificar se está instalado
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
  
  /**
   * Setup de notificações
   */
  private async setupNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return;
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
    }
    
    if (Notification.permission === 'granted' && this.registration) {
      // Configurar push subscription se necessário
      await this.setupPushSubscription();
    }
  }
  
  /**
   * Setup de push subscription
   */
  private async setupPushSubscription(): Promise<void> {
    try {
      const vapidKey = process.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.log('❌ VAPID key not configured');
        return;
      }
      
      const subscription = await this.registration?.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey) as BufferSource
      });
      
      if (subscription) {
        console.log('✅ Push subscription created');
        // Enviar subscription para o servidor
        await this.sendSubscriptionToServer(subscription);
      }
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
    }
  }
  
  /**
   * Enviar notificação local
   */
  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      console.log('❌ Cannot show notification');
      return;
    }
    
    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    };
    
    await this.registration.showNotification(title, defaultOptions);
  }
  
  /**
   * Setup verificador de updates
   */
  private setupUpdateChecker(): void {
    // Verificação inicial
    this.checkForUpdates();
    
    // Verificação periódica
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }
  
  /**
   * Verificar updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;
    
    try {
      await this.registration.update();
      console.log('🔄 Checked for updates');
    } catch (error) {
      console.error('❌ Update check failed:', error);
    }
  }
  
  /**
   * Registrar callback para updates
   */
  onUpdateAvailable(callback: (info: PWAUpdateInfo) => void): void {
    this.updateCallbacks.push(callback);
  }
  
  /**
   * Handle update do Service Worker
   */
  private handleServiceWorkerUpdate(): void {
    const updateInfo: PWAUpdateInfo = {
      available: true,
      version: process.env.VITE_APP_VERSION || 'unknown'
    };
    
    // Notificar callbacks
    this.updateCallbacks.forEach(callback => {
      try {
        callback(updateInfo);
      } catch (error) {
        console.error('❌ Update callback error:', error);
      }
    });
  }
  
  /**
   * Handle mudanças de status online/offline
   */
  private handleOnlineStatus(isOnline: boolean): void {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa:connectivity', {
      detail: { isOnline }
    }));
    
    if (isOnline && this.config.enableBackgroundSync) {
      // Trigger background sync quando voltar online
      this.triggerBackgroundSync();
    }
  }
  
  /**
   * Handle mensagens do Service Worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, payload } = event.data || {};
    
    switch (type) {
      case 'BACKGROUND_SYNC':
        console.log('📱 Background sync completed:', payload);
        break;
      case 'CACHE_UPDATED':
        console.log('💾 Cache updated:', payload);
        break;
      default:
        console.log('📱 SW message:', event.data);
    }
  }
  
  /**
   * Trigger background sync
   */
  private async triggerBackgroundSync(): Promise<void> {
    if (!this.registration || !this.config.enableBackgroundSync) return;
    
    try {
      await (this.registration as any).sync?.register('background-sync');
      console.log('🔄 Background sync triggered');
    } catch (error) {
      console.error('❌ Background sync failed:', error);
    }
  }
  
  /**
   * Mostrar instruções de instalação iOS
   */
  private showIOSInstallInstructions(): void {
    console.log('📱 iOS install instructions available');
    // Implementar UI para instruções iOS
  }
  
  /**
   * Mostrar instruções de instalação Android
   */
  private showAndroidInstallInstructions(): void {
    console.log('📱 Android install instructions available');
    // Implementar UI para instruções Android
  }
  
  /**
   * Enviar subscription para servidor
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // Implementar envio para backend
    console.log('📤 Sending push subscription to server:', subscription.endpoint);
  }
  
  /**
   * Converter VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  /**
   * Forçar reload do app
   */
  async reload(): Promise<void> {
    if (!this.registration) return;
    
    const newWorker = this.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
  
  /**
   * Status do PWA
   */
  getStatus() {
    return {
      serviceWorkerRegistered: !!this.registration,
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled(),
      isOnline: navigator.onLine,
      notificationsEnabled: Notification.permission === 'granted'
    };
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();

// Export class para casos especiais
export { PWAManager };

// Hook React para PWA
export function usePWA() {
  const [status, setStatus] = React.useState(pwaManager.getStatus());
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  
  React.useEffect(() => {
    // Inicializar PWA
    pwaManager.initialize();
    
    // Listener para updates
    pwaManager.onUpdateAvailable((info) => {
      setUpdateAvailable(info.available);
    });
    
    // Listener para mudanças de conectividade
    const handleConnectivity = () => {
      setStatus(pwaManager.getStatus());
    };
    
    window.addEventListener('pwa:connectivity', handleConnectivity);
    
    // Update status inicial
    const interval = setInterval(() => {
      setStatus(pwaManager.getStatus());
    }, 5000);
    
    return () => {
      window.removeEventListener('pwa:connectivity', handleConnectivity);
      clearInterval(interval);
    };
  }, []);
  
  return {
    ...status,
    updateAvailable,
    install: () => pwaManager.showInstallPrompt(),
    reload: () => pwaManager.reload(),
    showNotification: (title: string, options?: NotificationOptions) => 
      pwaManager.showNotification(title, options)
  };
}

export default pwaManager;