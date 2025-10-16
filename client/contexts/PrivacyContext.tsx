import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PrivacyContextType {
  hideValues: boolean;
  toggleHideValues: () => void;
  formatValue: (value: string | number, prefix?: string) => string;
  shouldHideCharts: () => boolean;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

interface PrivacyProviderProps {
  children: ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [hideValues, setHideValues] = useState(false);

  // Carregar preferência do localStorage quando o usuário logar
  useEffect(() => {
    if (user?.email) {
      const storageKey = `privacy_hide_values_${user.email}`;
      const savedPreference = localStorage.getItem(storageKey);
      if (savedPreference !== null) {
        setHideValues(JSON.parse(savedPreference));
      }
    }
  }, [user?.email]);

  const toggleHideValues = () => {
    setHideValues(prev => {
      const newValue = !prev;
      // Salvar preferência no localStorage
      if (user?.email) {
        const storageKey = `privacy_hide_values_${user.email}`;
        localStorage.setItem(storageKey, JSON.stringify(newValue));
      }
      return newValue;
    });
  };

  const formatValue = (value: string | number, prefix: string = 'R$ ') => {
    if (hideValues) {
      return `${prefix}****`;
    }
    
    if (typeof value === 'number') {
      return `${prefix}${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    return `${prefix}${value}`;
  };

  const shouldHideCharts = () => {
    return hideValues;
  };

  return (
    <PrivacyContext.Provider value={{ hideValues, toggleHideValues, formatValue, shouldHideCharts }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

export default PrivacyContext;
