/**
 * EventEmitter - Sistema de eventos para notificações globais
 * Usado para notificar mudanças de status premium em toda a aplicação
 */

type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Registra um listener para um evento
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  /**
   * Remove um listener específico de um evento
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emite um evento para todos os listeners
   */
  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove todos os listeners de um evento
   */
  removeAllListeners(event: string): void {
    this.events.delete(event);
  }

  /**
   * Registra um listener que será executado apenas uma vez
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }
}

// Instância singleton
export const eventEmitter = new EventEmitter();

// Eventos específicos da aplicação
export const EVENTS = {
  PREMIUM_STATUS_CHANGED: 'premium_status_changed',
  USER_DATA_UPDATED: 'user_data_updated',
  AUTH_TOKEN_REFRESHED: 'auth_token_refreshed',
} as const;

export default EventEmitter;
