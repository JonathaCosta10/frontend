import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

export default function TwoFactorSMSSetup() {
  const [currentStep, setCurrentStep] = useState<
    "setup" | "verify" | "complete"
  >("setup");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const cleanValue = value.replace(/\D/g, "");

    // Apply Brazilian phone number formatting
    if (cleanValue.length <= 11) {
      return cleanValue
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    }
    return value;
  };

  const handleSendCode = async () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length < 10) {
      toast({
        title: t("error"),
        description: t("error_valid_phone"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("verify");
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: t("sms_sent"),
        description: t("verification_code_sent_to_phone", { phone }),
      });
    }, 2000);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t("error"),
        description: t("error_six_digits"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("complete");

      toast({
        title: t("two_fa_sms_configured"),
        description: t("two_fa_sms_success"),
      });
    }, 1500);
  };

  const handleResendCode = () => {
    handleSendCode();
  };

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">{t("two_fa_configured")}</CardTitle>
            <p className="text-muted-foreground">
              {t("account_protected_sms")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {t("sms_login_verification_info")}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("phone_configured")}</span>
                <Badge variant="secondary">{phone}</Badge>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Link to="/dashboard/configuracoes">
                <Button className="w-full">{t("back_to_settings")}</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  {t("go_to_dashboard")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Link to="/dashboard/configuracoes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-xl">{t("setup_2fa_sms")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentStep === "setup"
                  ? t("setup_2fa_sms_description")
                  : t("verify_sms_code_description")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === "setup" && (
            <>
              <div className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    {t("configure_2fa_sms_info")}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone_number_label")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("phone_placeholder")}
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("phone_format_info")}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={isLoading || !phone}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {t("sending_code")}
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    {t("send_sms_code")}
                  </>
                )}
              </Button>
            </>
          )}

          {currentStep === "verify" && (
            <>
              <div className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    {t("sms_code_sent_description", { phone })}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="code">{t("verification_code_label")}</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder={t("verification_code_placeholder")}
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    className="w-full text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("resend_code_in", { seconds: countdown })}
                    </p>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleResendCode}
                      className="text-sm"
                    >
                      {t("resend_code")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      {t("verifying")}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("verify_code")}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("setup")}
                  className="w-full"
                >
                  {t("back_button")}
                </Button>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>{t("data_protected_encrypted")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
