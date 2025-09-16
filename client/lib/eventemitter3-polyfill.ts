/**
 * Polyfill para eventemitter3 para resolver problemas de compatibilidade ES modules
 * Este arquivo garante que o EventEmitter3 funcione corretamente com Vite
 */

// Implementação básica compatível com EventEmitter3
class EventEmitter3 {
  private _events: Map<string | symbol, Array<(...args: any[]) => void>> = new Map();
  private _eventsCount: number = 0;

  constructor() {
    this._events = new Map();
    this._eventsCount = 0;
  }

  addListener(event: string | symbol, fn: (...args: any[]) => void): this {
    return this.on(event, fn);
  }

  on(event: string | symbol, fn: (...args: any[]) => void): this {
    if (!this._events.has(event)) {
      this._events.set(event, []);
      this._eventsCount++;
    }
    this._events.get(event)!.push(fn);
    return this;
  }

  once(event: string | symbol, fn: (...args: any[]) => void): this {
    const onceWrapper = (...args: any[]) => {
      this.removeListener(event, onceWrapper);
      fn.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }

  removeListener(event: string | symbol, fn: (...args: any[]) => void): this {
    return this.off(event, fn);
  }

  off(event: string | symbol, fn?: (...args: any[]) => void): this {
    if (!this._events.has(event)) return this;

    if (!fn) {
      this._events.delete(event);
      this._eventsCount--;
      return this;
    }

    const listeners = this._events.get(event)!;
    const index = listeners.indexOf(fn);
    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        this._events.delete(event);
        this._eventsCount--;
      }
    }

    return this;
  }

  removeAllListeners(event?: string | symbol): this {
    if (event) {
      if (this._events.has(event)) {
        this._events.delete(event);
        this._eventsCount--;
      }
    } else {
      this._events.clear();
      this._eventsCount = 0;
    }
    return this;
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    if (!this._events.has(event)) return false;

    const listeners = this._events.get(event)!.slice();
    for (const listener of listeners) {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('EventEmitter3 error:', error);
      }
    }

    return true;
  }

  listeners(event: string | symbol): Array<(...args: any[]) => void> {
    return this._events.get(event)?.slice() || [];
  }

  listenerCount(event: string | symbol): number {
    return this._events.get(event)?.length || 0;
  }

  eventNames(): Array<string | symbol> {
    return Array.from(this._events.keys());
  }

  setMaxListeners(_: number): this {
    // No-op para compatibilidade, EventEmitter3 não tem limite por padrão
    return this;
  }

  getMaxListeners(): number {
    return 0; // EventEmitter3 não tem limite por padrão
  }
}

// Export default para compatibilidade
export default EventEmitter3;

// Named export para uso alternativo
export { EventEmitter3 };

// Compatibilidade com require
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventEmitter3;
  module.exports.default = EventEmitter3;
  module.exports.EventEmitter3 = EventEmitter3;
}
