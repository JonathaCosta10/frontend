import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

interface VercelInsightsProps {
  enableAnalytics?: boolean;
  enableSpeedInsights?: boolean;
}

export function VercelInsights({ 
  enableAnalytics = true, 
  enableSpeedInsights = true 
}: VercelInsightsProps) {
  // Só carrega em produção para não afetar desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    return null;
  }

  return (
    <>
      {enableSpeedInsights && <SpeedInsights />}
      {enableAnalytics && <Analytics />}
    </>
  );
}