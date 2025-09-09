import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPercentage } from "@/utils/formatters";

interface AssetCardProps {
  title: string;
  value: number;
  variation: number;
  dailyChange?: number;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  title,
  value,
  variation,
  dailyChange,
}) => {
  const { formatCurrency } = useTranslation();
  const isPositiveVariation = variation >= 0;
  const isPositiveDailyChange = dailyChange !== undefined ? dailyChange >= 0 : true;

  return (
    <Card className="h-full hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <div className="font-bold text-lg mb-1">{formatCurrency(value)}</div>
        <div className="flex items-center space-x-2 text-sm">
          <div
            className={`flex items-center gap-1 ${
              isPositiveVariation ? "text-success" : "text-destructive"
            }`}
          >
            {isPositiveVariation ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{formatPercentage(variation)}</span>
          </div>
          
          {dailyChange !== undefined && (
            <div
              className={`flex items-center gap-1 ${
                isPositiveDailyChange ? "text-success" : "text-destructive"
              }`}
            >
              <span className="text-muted-foreground text-xs">hoje:</span>
              <span>{formatPercentage(dailyChange)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
