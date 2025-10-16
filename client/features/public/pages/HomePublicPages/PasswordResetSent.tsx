import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, ArrowLeft, CheckCircle, Mail, Clock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from '../../../../contexts/TranslationContext';
// LanguageSelector removed - Portuguese only application

export default function PasswordResetSent() {
  const [darkMode, setDarkMode] = useState(false);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Pega o email do state da navegação
  const email = location.state?.email;

  // Se não tem email no state, redireciona para forgot-password
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const handleResendEmail = () => {
    console.log("Resending email to:", email);
    setCountdown(180);
    setCanResend(false);
    // Aqui você implementaria a lógica de reenvio
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!email) {
    return null; // Evita flash antes do redirect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  O
                </span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Language selector removed - Portuguese only */}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Link to="/login">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t('back_to_login')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {t('email_sent')}!
              </CardTitle>
              <p className="text-muted-foreground">
                {t('email_sent_description')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('email_sent_to')}:</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">{t('what_to_do_now')}?</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{t('check_inbox_spam')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{t('click_recovery_link')}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{t('follow_instructions_new_password')}</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  {!canResend ? (
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t('resend_in')} {formatTime(countdown)}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={handleResendEmail}
                        className="text-sm"
                      >
                        {t('resend_email')}
                      </Button>
                      <div>
                        <Link to="/forgot-password">
                          <Button
                            variant="ghost"
                            className="text-sm"
                          >
                            {t('send_new_email')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('didnt_receive_email')}?{" "}
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('try_another_email')}
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('remembered_password')}?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    {t('back_to_login')}
                  </Link>
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">
                  🔒 {t('security_policy')}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t('security_policy_description')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
