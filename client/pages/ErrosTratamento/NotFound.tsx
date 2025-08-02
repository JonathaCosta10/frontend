import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>

          <h1 className="text-6xl font-bold text-primary mb-4">
            {t("page_not_found_404")}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t("page_not_found_message")}
          </p>

          <Link to="/">
            <Button className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>{t("return_to_home")}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
