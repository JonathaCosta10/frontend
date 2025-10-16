import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon, Sun, Eye, EyeOff, ArrowLeft, Menu, X, Play, TrendingUp, Home } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
// LanguageSelector removed - Portuguese only application
import OAuthService from "@/services/oauth";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import Footer from "@/components/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";

interface LoginForm {
  username: string; // email ou usuário
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const toggleDarkMode = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    console.log("🚀 Login iniciado");

    try {
      const success = await login(data.username, data.password);
      console.log("📊 Resultado do login:", success);

      if (success) {
        // Redireciona para a página que o usuário tentou acessar ou para o dashboard
        const searchParams = new URLSearchParams(location.search);
        const redirectTo =
          searchParams.get("redirect") ||
          location.state?.from?.pathname ||
          "/dashboard/orcamento";

        console.log("➡️ Redirecionando para:", redirectTo);

        // Pequeno delay para garantir que o estado de autenticação seja propagado
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 100);
      } else {
        console.log("❌ Login falhado");
        setError("password", {
          type: "manual",
          message: t("incorrect_email_password"),
        });
      }
    } catch (error) {
      console.error("💥 Erro durante login:", error);
      setError("password", {
        type: "manual",
        message: t("login_error_retry"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-2">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Link to="/home">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("back")}</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                {/* Navigation Options */}
                <div className="px-2">
                  <p className="text-sm text-muted-foreground mb-3">Navegação:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/home" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Início
                      </Button>
                    </Link>
                    <Link to="/demo" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Demonstração
                      </Button>
                    </Link>
                    <Link to="/market" className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Mercado
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className={`container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-88px)] ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <Card className="border-0 shadow-lg">
            <CardHeader className={`text-center ${isMobile ? 'pb-4' : 'pb-6'}`}>
              <CardTitle className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {t("enter_account")}
              </CardTitle>
              <p className="text-muted-foreground text-sm">{t("enter_data_access")}</p>
            </CardHeader>
            <CardContent className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("email_or_username")}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t("email_or_username_placeholder")}
                    autoComplete="username"
                    {...register("username", {
                      required: t("username_required"),
                    })}
                    className={errors.username ? "border-destructive" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("enter_your_password")}
                      autoComplete="current-password"
                      {...register("password", {
                        required: t("password_required"),
                        minLength: {
                          value: 6,
                          message: t("password_min_6_chars"),
                        },
                      })}
                      className={
                        errors.password ? "border-destructive pr-10" : "pr-10"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <div className="space-y-1">
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                      {errors.password.type === "manual" && (
                        <p className="text-sm text-destructive">
                          {t("forgot_password")}{" "}
                          <Link
                            to="/forgot-password"
                            className="underline hover:no-underline"
                          >
                            {t("click_here")}
                          </Link>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="rememberMe" {...register("rememberMe")} />
                    <Label htmlFor="rememberMe" className="text-sm">
                      {t("remember_me")}
                    </Label>
                  </div>
                  <Link to="/forgot-password">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm p-0"
                    >
                      {t("forgot_password")}
                    </Button>
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t("logging_in")}
                    </>
                  ) : (
                    t("login")
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("or_continue_with")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <GoogleAuthButton context="signin" />
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t("dont_have_account")}{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("register_free")}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
