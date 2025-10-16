import React from "react";
import { Link } from "react-router-dom";

interface NavigationLinkProps {
  to: string;
  children: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}

/**
 * NavigationLink component for consistent styling across navigation links
 */
export const NavigationLink: React.FC<NavigationLinkProps> = ({ 
  to, 
  children,
  isMobile = false,
  onClick
}) => {
  if (isMobile) {
    return (
      <Link to={to} className="w-full" onClick={onClick}>
        <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">
          {children}
        </button>
      </Link>
    );
  }
  
  return (
    <li>
      <Link 
        to={to} 
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  );
};

/**
 * Standard navigation items for the public pages
 */
export const publicNavigationItems = [
  { path: "/market", label: "Mercado" },
  { path: "/cripto-market", label: "Criptomoedas" },
  { path: "/whitepaper", label: "Whitepaper" },
  { path: "/about", label: "Sobre" },
  { path: "/privacy-policy", label: "Política de Privacidade" },
  { path: "/terms", label: "Termos" },
];

/**
 * Desktop navigation component that renders the standard navigation links
 */
export const DesktopNavigation = () => {
  return (
    <nav className="mr-4">
      <ul className="flex space-x-6">
        {publicNavigationItems.map((item) => (
          <NavigationLink key={item.path} to={item.path}>
            {item.label}
          </NavigationLink>
        ))}
      </ul>
    </nav>
  );
};

/**
 * Mobile navigation component that renders the standard navigation links
 */
export const MobileNavigation = ({ onItemClick }: { onItemClick?: () => void }) => {
  return (
    <div className="px-2 pt-2 border-t border-border">
      <p className="text-sm text-muted-foreground mb-3">Navegação:</p>
      <div className="grid grid-cols-1 gap-2">
        {publicNavigationItems.map((item) => (
          <NavigationLink 
            key={item.path} 
            to={item.path} 
            isMobile={true}
            onClick={onItemClick}
          >
            {item.label}
          </NavigationLink>
        ))}
      </div>
    </div>
  );
};
