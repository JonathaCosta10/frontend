import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";

export default function LoginRequired() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">{t("restricted_access")}</CardTitle>
          <p className="text-muted-foreground">
            {t("login_required_message")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t("advanced_tools_login_required")}</p>
            <p>{t("need_to_be_logged_in")}</p>
          </div>

          <div className="space-y-3">
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="block"
            >
              <Button className="w-full flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>{t("login")}</span>
              </Button>
            </Link>

            <Link
              to={`/signup?redirect=${encodeURIComponent(redirect)}`}
              className="block"
            >
              <Button
                variant="outline"
                className="w-full flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>{t("create_account")}</span>
              </Button>
            </Link>

            <Link to="/market" className="block">
              <Button variant="ghost" className="w-full">
                {t("back_to_market")}
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {t("with_account_access")}
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>• {t("complete_ticker_analysis")}</li>
              <li>• {t("custom_wishlist")}</li>
              <li>• {t("economic_indicators")}</li>
              <li>• {t("financial_calculator")}</li>
              <li>• {t("investment_management")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
