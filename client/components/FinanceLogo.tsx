import React from "react";

export const FinanceLogo = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect x="50" y="30" width="190" height="190" rx="20" fill="currentColor" className="text-primary-foreground" />
      <rect x="60" y="40" width="170" height="170" rx="15" fill="currentColor" className="text-primary" />
      
      {/* Dollar Sign */}
      <path 
        d="M150 65C135 65 125 75 125 90C125 105 135 115 150 115C165 115 175 125 175 140C175 155 165 165 150 165M150 65V50M150 165V180" 
        stroke="currentColor" 
        className="text-primary-foreground"
        strokeWidth="25" 
        strokeLinecap="round"
      />
      
      {/* Circuit Lines */}
      <path 
        d="M240 180L300 180C310 180 320 190 320 200L320 260" 
        stroke="currentColor" 
        className="text-primary-foreground" 
        strokeWidth="15" 
        strokeLinecap="round"
      />
      <path 
        d="M240 125L280 125C290 125 300 135 300 145L300 300" 
        stroke="currentColor" 
        className="text-primary-foreground" 
        strokeWidth="15" 
        strokeLinecap="round"
      />
      <path 
        d="M120 220L120 280C120 290 130 300 140 300L230 300" 
        stroke="currentColor" 
        className="text-primary-foreground" 
        strokeWidth="15" 
        strokeLinecap="round"
      />
      
      {/* Circuit Nodes */}
      <circle cx="360" cy="200" r="15" fill="currentColor" className="text-primary-foreground"/>
      <circle cx="360" cy="260" r="15" fill="currentColor" className="text-primary-foreground"/>
      <circle cx="300" cy="300" r="15" fill="currentColor" className="text-primary-foreground"/>
      <circle cx="230" cy="300" r="15" fill="currentColor" className="text-primary-foreground"/>
    </svg>
  );
};

export default FinanceLogo;
