import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface LanguageSelectorProps {
  variant?: 'button' | 'select' | 'compact';
  showCurrency?: boolean; // Deprecated - kept for compatibility but not used
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSelector({ 
  variant = 'button', 
  showCurrency = false, // Ignored
  size = 'md' 
}: LanguageSelectorProps) {
  const { 
    language, 
    setLanguage, 
    getAvailableLanguages, 
    t 
  } = useTranslation();

  const availableLanguages = getAvailableLanguages();
  
  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  };

  if (variant === 'select') {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent border border-input rounded px-2 py-1 text-sm"
          >
            {availableLanguages.map((lang) => (
              <option key={`lang-${lang.code}`} value={lang.code}>
                {lang.flag} {lang.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`${sizeClasses[size]} px-2`}>
            <Globe className="h-3 w-3 mr-1" />
            <span className="text-xs">{currentLanguage?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={`compact-lang-${lang.code}`}
              onClick={() => setLanguage(lang.code)}
              className={language === lang.code ? 'bg-accent' : ''}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default button variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size === 'md' ? 'default' : size} className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.flag} {currentLanguage?.name.split(' ')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={`default-lang-${lang.code}`}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
