/**
 * Hook para gerenciar configurações do usuário com persistência em cookies
 */

import { useState, useEffect, useCallback } from 'react';
import { userPreferences, COOKIE_KEYS } from '../lib/cookies';
import { cacheManager, CACHE_KEYS } from '../lib/cache';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  currency: 'BRL' | 'USD' | 'EUR';
  dashboardLayout: 'compact' | 'comfortable' | 'spacious';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    shareAnalytics: boolean;
  };
  display: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'pt',
  currency: 'BRL',
  dashboardLayout: 'comfortable',
  notifications: {
    email: true,
    push: true,
    marketing: false,
  },
  privacy: {
    showOnlineStatus: true,
    shareAnalytics: true,
  },
  display: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

export const useUserSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar configurações ao inicializar
  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);

      // Tentar carregar do cache primeiro (mais rápido)
      const cachedSettings = cacheManager.get<UserSettings>(
        CACHE_KEYS.USER_SETTINGS,
        userId
      );

      if (cachedSettings) {
        setSettings(cachedSettings);
        setIsLoading(false);
        return;
      }

      // Carregar dos cookies
      const cookieSettings = userPreferences.getUserPreferences();
      
      if (cookieSettings) {
        const mergedSettings = { ...defaultSettings, ...cookieSettings };
        setSettings(mergedSettings);
        
        // Salvar no cache para próximas cargas
        cacheManager.setPreferences(
          CACHE_KEYS.USER_SETTINGS,
          mergedSettings,
          userId
        );
      } else {
        // Usar configurações padrão
        setSettings(defaultSettings);
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Salvar em cookies
      userPreferences.setUserPreferences(updatedSettings);
      
      // Salvar no cache
      cacheManager.setPreferences(
        CACHE_KEYS.USER_SETTINGS,
        updatedSettings,
        userId
      );
      
      // Atualizar estado local
      setSettings(updatedSettings);
      setHasChanges(false);
      
      console.log('✅ Configurações salvas com sucesso');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      return { success: false, error };
    }
  }, [settings, userId]);

  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  }, []);

  const updateNestedSetting = useCallback(<
    K extends keyof UserSettings,
    NK extends keyof UserSettings[K]
  >(
    category: K,
    key: NK,
    value: UserSettings[K][NK]
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [key]: value
      }
    }));
    setHasChanges(true);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  const resetToDefaults = useCallback(async () => {
    try {
      // Limpar cookies
      userPreferences.setUserPreferences(defaultSettings);
      
      // Limpar cache
      cacheManager.delete(CACHE_KEYS.USER_SETTINGS, userId);
      
      // Resetar estado
      setSettings(defaultSettings);
      setHasChanges(false);
      
      console.log('🔄 Configurações resetadas para padrão');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erro ao resetar configurações:', error);
      return { success: false, error };
    }
  }, [userId]);

  // Métodos específicos para configurações comuns
  const setTheme = useCallback((theme: UserSettings['theme']) => {
    updateSetting('theme', theme);
    
    // Aplicar tema imediatamente ao DOM
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Salvar tema específico em cookie separado para carregamento rápido
    userPreferences.setTheme(theme);
    
  }, [updateSetting]);

  const setLanguage = useCallback((language: UserSettings['language']) => {
    updateSetting('language', language);
    
    // Salvar idioma específico em cookie separado
    userPreferences.setLanguage(language);
    
  }, [updateSetting]);

  const setCurrency = useCallback((currency: UserSettings['currency']) => {
    updateSetting('currency', currency);
  }, [updateSetting]);

  const setDashboardLayout = useCallback((layout: UserSettings['dashboardLayout']) => {
    updateSetting('dashboardLayout', layout);
  }, [updateSetting]);

  // Auto-save quando há mudanças (debounced)
  useEffect(() => {
    if (hasChanges && !isLoading) {
      const timeoutId = setTimeout(() => {
        saveSettings({});
      }, 1000); // Salva 1 segundo após a última mudança

      return () => clearTimeout(timeoutId);
    }
  }, [hasChanges, isLoading, saveSettings]);

  return {
    settings,
    isLoading,
    hasChanges,
    
    // Métodos gerais
    updateSetting,
    updateNestedSetting,
    saveSettings,
    resetSettings,
    resetToDefaults,
    loadSettings,
    
    // Métodos específicos
    setTheme,
    setLanguage,
    setCurrency,
    setDashboardLayout,
    
    // Getters convenientes
    theme: settings.theme,
    language: settings.language,
    currency: settings.currency,
    dashboardLayout: settings.dashboardLayout,
    notifications: settings.notifications,
    privacy: settings.privacy,
    display: settings.display,
  };
};

// Hook específico para tema (carregamento mais rápido)
export const useTheme = () => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    // Carregar tema dos cookies (mais rápido que configurações completas)
    const savedTheme = userPreferences.getTheme() as 'light' | 'dark' | 'system' || 'system';
    setThemeState(savedTheme);
    
    // Aplicar tema imediatamente
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    userPreferences.setTheme(newTheme);
  }, []);

  return { theme, setTheme };
};

export default useUserSettings;
