import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, ArrowLeft, Mail, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
// LanguageSelector removed - Portuguese only application
import EmailService from "@/services/emailService";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);

    try {
      // Validar email antes de enviar
      if (!EmailService.validarEmail(data.email)) {
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
          variant: "destructive",
        });
        return;
      }

      // Chamar a API de recuperação de senha
      const response = await EmailService.recuperarSenha({ 
        email: data.email 
      });

      toast({
        title: "Código enviado!",
        description: response.message || "Um código de verificação foi enviado para seu email.",
        variant: "default",
      });

      // Navegar para a página de verificação de código
      navigate("/verify-reset-code", { 
        state: { email: data.email } 
      });

    } catch (error: any) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      
      toast({
        title: "Erro ao enviar código",
        description: error.message || "Não foi possível enviar o código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {t('forgot_password_title')}
              </CardTitle>
              <p className="text-muted-foreground">
                {t('forgot_password_description')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('enter_registered_email')}
                      {...register("email", {
                        required: t('email_required'),
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: t('email_invalid'),
                        },
                      })}
                      className={`${errors.email ? "border-destructive" : ""} pl-10`}
                      disabled={isSubmitting}
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('sending')}
                    </>
                  ) : (
                    t('send_instructions')
                  )}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{t('your_data_is_safe')}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('remembered_password')}{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      {t('back_to_login')}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('dont_have_account')}{" "}
                    <Link
                      to="/signup"
                      className="text-primary hover:underline font-medium"
                    >
                      {t('register_free')}
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
