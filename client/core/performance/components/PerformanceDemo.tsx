/**
 * Componente de demonstração das melhorias de performance e cookies
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cookieManager, authCookies, userPreferences } from '../lib/cookies';
import { cacheManager, CACHE_KEYS } from '../lib/cache';
import { useUserSettings, useTheme } from '@/shared/hooks/useUserSettings';
import { useAuth } from '@/core/auth/AuthContext';

export const PerformanceDemo: React.FC = () => {
  const { user } = useAuth();
  const { settings, setTheme: setSettingsTheme } = useUserSettings(user?.id);
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState(cacheManager.getStats());

  // Atualizar stats a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testCookies = () => {
    // Teste de cookies
    cookieManager.set('test_cookie', 'valor_teste', { expires: 1 });
    const value = cookieManager.get('test_cookie');
    alert(`Cookie testado: ${value}`);
  };

  const testCache = () => {
    // Teste de cache
    const testData = { message: 'Cache funcionando!', timestamp: Date.now() };
    cacheManager.setUserData('test_cache', testData, user?.id || 'guest');
    
    const cachedData = cacheManager.get('test_cache', user?.id || 'guest');
    alert(`Cache testado: ${JSON.stringify(cachedData)}`);
  };

  const clearAllCache = () => {
    cacheManager.clear();
    setStats(cacheManager.getStats());
    alert('Cache limpo!');
  };

  const testTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setSettingsTheme(newTheme);
  };

  const formatBytes = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Performance & Cookies Demo
            <Badge variant="outline">Sistema Ativo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do usuário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded">
              <h4 className="font-semibold text-sm mb-2">Status do Usuário</h4>
              <div className="space-y-1 text-xs">
                <p>Autenticado: {user ? '✅' : '❌'}</p>
                <p>Premium: {user?.isPaidUser || user?.subscription_type === 'premium' ? '✅' : '❌'}</p>
                <p>Tema Atual: <Badge variant="outline">{theme}</Badge></p>
                <p>ID: {user?.id || 'Guest'}</p>
              </div>
            </div>

            <div className="p-3 border rounded">
              <h4 className="font-semibold text-sm mb-2">Stats do Cache</h4>
              <div className="space-y-1 text-xs">
                <p>Entradas: {stats.entries}</p>
                <p>Hits: {stats.hits}</p>
                <p>Misses: {stats.misses}</p>
                <p>Taxa de Hit: {cacheManager.getHitRate().toFixed(1)}%</p>
                <p>Memória: {formatBytes(stats.memoryUsage)}</p>
              </div>
            </div>
          </div>

          {/* Testes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={testCookies} 
              variant="outline" 
              size="sm"
            >
              🍪 Testar Cookies
            </Button>
            
            <Button 
              onClick={testCache} 
              variant="outline" 
              size="sm"
            >
              💾 Testar Cache
            </Button>
            
            <Button 
              onClick={testTheme} 
              variant="outline" 
              size="sm"
            >
              🎨 Alternar Tema
            </Button>
            
            <Button 
              onClick={clearAllCache} 
              variant="destructive" 
              size="sm"
            >
              🗑️ Limpar Cache
            </Button>
          </div>

          {/* Demonstração de API Protection */}
          <div className="p-3 border rounded bg-muted/50">
            <h4 className="font-semibold text-sm mb-2">🛡️ Proteção API insights-mercado</h4>
            <p className="text-xs text-muted-foreground mb-2">
              A API só será chamada se o usuário for premium (ispaid: true)
            </p>
            {user?.isPaidUser || user?.subscription_type === 'premium' ? (
              <Badge variant="default">✅ Usuário Premium - API Liberada</Badge>
            ) : (
              <Badge variant="secondary">🚫 Usuário Free - API Bloqueada</Badge>
            )}
          </div>

          {/* Status de Cookies */}
          <div className="p-3 border rounded bg-muted/50">
            <h4 className="font-semibold text-sm mb-2">🍪 Status dos Cookies</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p>Auth Token: {authCookies.getAuthToken() ? '✅' : '❌'}</p>
                <p>Tema: {userPreferences.getTheme() || 'Não definido'}</p>
              </div>
              <div>
                <p>Idioma: {userPreferences.getLanguage() || 'Não definido'}</p>
                <p>Preferências: {userPreferences.getUserPreferences() ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDemo;
