import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from '../../../contexts/TranslationContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useResponsive } from '@/shared/hooks/useResponsive';
import NavigationLinks from "@/components/ui/NavigationLinks";
import {
  Moon,
  Sun,
  User,
  LogIn,
  Menu,
  X,
} from "lucide-react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className={`border-b bg-card transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="mr-4">
                <NavigationLinks currentPath={location.pathname} />
              </nav>
            
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t('login')}</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t('signup')}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                {/* Main Action Buttons */}
                <div className="flex flex-col space-y-3 px-2">
                  <Link to="/login" className="w-full">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-center flex items-center space-x-2 text-lg py-6"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>{t("login")}</span>
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button
                      size="lg"
                      className="w-full justify-center flex items-center space-x-2 text-lg py-6 bg-primary hover:bg-primary/90"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>{t("signup")}</span>
                    </Button>
                  </Link>
                </div>
                
                {/* Navigation Links */}
                <div className="px-2 pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Navegação:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Using the links defined in NavigationLinks but adapted for mobile view */}
                    <MobileNavLinks currentPath={location.pathname} onLinkClick={() => setMobileMenuOpen(false)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className={`container mx-auto px-4 pb-32 md:pb-8 ${isScrolled ? 'pt-20' : ''}`}>
        {children}
      </main>
    </div>
  );
}

// Mobile Navigation Links Component
const MobileNavLinks: React.FC<{
  currentPath?: string;
  onLinkClick?: () => void;
}> = ({ currentPath, onLinkClick }) => {
  const { t } = useTranslation();
  
  // Define all navigation links in a single array for easy maintenance
  const links = [
    { to: "/market", label: "Mercado" },
    { to: "/cripto-market", label: "Criptomoedas" },
    { to: "/whitepaper", label: "Whitepaper" },
    { to: "/about", label: "Sobre" },
    { to: "/privacy-policy", label: "Política de Privacidade" },
    { to: "/terms", label: "Termos" },
    { to: "/plans", label: t("plans") },
  ];

  return (
    <>
      {links.map((link) => (
        <Link key={link.to} to={link.to} className="w-full">
          <Button
            variant={currentPath === link.to ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={onLinkClick}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </>
  );
};
