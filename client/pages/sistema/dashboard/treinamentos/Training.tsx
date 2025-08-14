import React from "react";
import { Outlet } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Training() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t("training")}</h1>
          <p className="text-muted-foreground">{t("training_description")}</p>
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
