import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LegendItem {
  icon?: React.ReactNode;
  color: string;
  label: string;
  value?: string | number;
  percentage?: string | number;
}

interface CompactLegendProps {
  items: LegendItem[];
  showPercentages?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  columns?: number; // Número de colunas quando em layout grid
  iconOnly?: boolean; // Apenas mostrar ícones, sem texto
}

/**
 * Componente para exibir legendas compactas de gráficos
 * Mostra ícones com cores e opcionalmente valores ou percentuais
 */
const CompactLegend = ({
  items,
  showPercentages = true,
  orientation = "horizontal",
  size = "md",
  columns,
  iconOnly = false
}: CompactLegendProps) => {
  // Definir tamanhos com base no prop size
  const sizeClasses = {
    sm: {
      container: "gap-1.5",
      item: "gap-1",
      dot: "w-2 h-2",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      container: "gap-2",
      item: "gap-1.5",
      dot: "w-3 h-3",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      container: "gap-3",
      item: "gap-2",
      dot: "w-4 h-4",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };

  const sizeClass = sizeClasses[size];
  
  // Determinar se deve usar grid layout baseado no prop columns
  const useGridLayout = columns && columns > 0;
  
  // Definir estilo grid ou flex
  const containerStyle = useGridLayout ? {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: size === 'sm' ? '0.375rem' : size === 'md' ? '0.5rem' : '0.75rem',
  } : {};

  return (
    <div 
      className={`${!useGridLayout ? `flex ${orientation === "horizontal" ? "flex-row flex-wrap" : "flex-col"}` : ''} ${sizeClass.container} justify-center`}
      style={useGridLayout ? containerStyle : undefined}
      aria-label="Legenda do gráfico"
    >
      {items.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`flex items-center ${sizeClass.item}`} 
                role="listitem"
              >
                {/* Círculo de cor ou ícone */}
                {item.icon ? (
                  <div 
                    className={`${sizeClass.icon} flex items-center justify-center`} 
                    style={{ color: item.color }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                ) : (
                  <div 
                    className={`${sizeClass.dot} rounded-full`} 
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                )}
                
                {/* Mostrar label e/ou percentual se não for iconOnly */}
                {!iconOnly && (
                  <>
                    {/* Label do item */}
                    <span className={`${sizeClass.text} ml-1.5`}>
                      {item.label}
                    </span>
                    
                    {/* Mostrar percentual se solicitado */}
                    {showPercentages && item.percentage && (
                      <span className={`${sizeClass.text} font-medium ml-1`}>
                        {typeof item.percentage === 'number' 
                          ? `${Math.round(item.percentage)}%` 
                          : item.percentage}
                      </span>
                    )}
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium">{item.label}</p>
                {item.value && <p>{item.value}</p>}
                {item.percentage && <p>{typeof item.percentage === 'number' 
                  ? `${item.percentage.toFixed(2)}%` 
                  : item.percentage}</p>}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default CompactLegend;
