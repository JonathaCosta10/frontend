import React from "react";
import { Link } from "react-router-dom";

interface NavigationLinkProps {
  to: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ to, label, isActive, onClick }) => {
  return (
    <li>
      <Link
        to={to}
        className={`text-muted-foreground hover:text-foreground ${isActive ? 'font-medium text-foreground' : ''}`}
        onClick={onClick}
      >
        {label}
      </Link>
    </li>
  );
};

interface NavigationLinksProps {
  currentPath?: string;
  onClick?: () => void;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ currentPath, onClick }) => {
  // Define all navigation links in a single array for easy maintenance
  const links = [
    { to: "/market", label: "Mercado" },
    { to: "/cripto-market", label: "Criptomoedas" },
    { to: "/whitepaper", label: "Whitepaper" },
    { to: "/about", label: "Sobre" },
    { to: "/privacy-policy", label: "Política de Privacidade" },
    { to: "/terms", label: "Termos" },
  ];

  return (
    <ul className="flex space-x-6">
      {links.map((link) => (
        <NavigationLink
          key={link.to}
          to={link.to}
          label={link.label}
          isActive={currentPath === link.to}
          onClick={onClick}
        />
      ))}
    </ul>
  );
};

export default NavigationLinks;
