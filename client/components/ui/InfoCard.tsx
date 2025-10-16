import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn  } from '@/lib/utils';
import { getVariationColor } from '@/utils/fii-formatters';

interface InfoCardProps {
  title: string;
  value: string | number;
  tooltip?: string;
  icon?: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  variation?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  tooltip,
  icon: IconComponent,
  trend,
  variation,
  className,
  size = 'medium'
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const titleSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const valueSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-3xl'
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className={cn("font-medium text-muted-foreground", titleSizeClasses[size])}>
                {title}
              </p>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={cn("font-bold", valueSizeClasses[size])}>
                {value}
              </span>
              {(trend || variation !== undefined) && (
                <div className="flex items-center gap-1">
                  {trend && getTrendIcon()}
                  {variation !== undefined && (
                    <span className={cn("text-sm font-medium", getVariationColor(variation))}>
                      {variation > 0 ? '+' : ''}{variation.toFixed(2)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {IconComponent && (
            <div className="ml-2">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
