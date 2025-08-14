import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import LanguageSelector from "@/components/LanguageSelector";
import OAuthService from "@/services/oauth";

interface SignupForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  // Investor Profile
  investmentExperience: "beginner" | "intermediate" | "advanced";
  riskTolerance: "conservative" | "moderate" | "aggressive";
  investmentGoal:
    | "retirement"
    | "wealth_building"
    | "short_term"
    | "emergency_fund";
  monthlyIncome: string;
  investmentHorizon: "1-2" | "3-5" | "5-10" | "10+";
}

export default function Signup() {
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SignupForm>();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const password = watch("password");

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const onSubmit = async (data: SignupForm) => {
    if (!data.acceptTerms) {
      setError("acceptTerms", {
        type: "manual",
        message: t("must_accept_terms"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        first_name: data.firstName,
        last_name: data.lastName,
      });

      if (result.success) {
        // Redireciona para a página que o usuário tentou acessar ou para o dashboard
        const searchParams = new URLSearchParams(location.search);
        const redirectTo =
          searchParams.get("redirect") || "/dashboard/orcamento";
        navigate(redirectTo, { replace: true });
      } else {
        // Verificar o tipo de erro para exibir a mensagem apropriada
        const errorMessage = result.error;
        
        // Se o erro contém informações sobre email ou username duplicados
        if (typeof errorMessage === 'object' && errorMessage !== null) {
          if (errorMessage.email) {
            setError("email", {
              type: "manual",
              message: Array.isArray(errorMessage.email) 
                ? errorMessage.email[0] 
                : String(errorMessage.email),
            });
          }
          if (errorMessage.username) {
            setError("username", {
              type: "manual", 
              message: Array.isArray(errorMessage.username)
                ? errorMessage.username[0]
                : String(errorMessage.username),
            });
          }
          // Se não há erro específico de campo, mostrar erro geral
          if (!errorMessage.email && !errorMessage.username) {
            setError("email", {
              type: "manual",
              message: t("account_creation_error"),
            });
          }
        } else {
          // Erro de string simples
          setError("email", {
            type: "manual",
            message: String(errorMessage) || t("account_creation_error"),
          });
        }
      }
    } catch (error) {
      setError("email", {
        type: "manual",
        message: t("account_creation_error_retry"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePassword = (value: string) => {
    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    if (!hasMinLength) return t("password_min_length");
    if (!hasUpperCase) return t("password_uppercase");
    if (!hasLowerCase) return t("password_lowercase");
    if (!hasNumber) return t("password_number");
    return true;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watch("password") || "");

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
              {/* Language and Currency Selector */}
              <LanguageSelector
                variant="compact"
                showCurrency={false}
                size="sm"
              />

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

              <Link to="/home">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("back")}</span>
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
              <CardTitle className="text-2xl font-bold">
                {t("create_account")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("first_name")}</Label>
                    <Input
                      id="firstName"
                      placeholder={t("first_name_placeholder")}
                      {...register("firstName", {
                        required: t("first_name_required"),
                        minLength: {
                          value: 2,
                          message: t("first_name_min_length"),
                        },
                      })}
                      className={errors.firstName ? "border-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("last_name")}</Label>
                    <Input
                      id="lastName"
                      placeholder={t("last_name_placeholder")}
                      {...register("lastName", {
                        required: t("last_name_required"),
                        minLength: {
                          value: 2,
                          message: t("last_name_min_length"),
                        },
                      })}
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t("username")}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t("username_placeholder")}
                    {...register("username", {
                      required: t("username_required"),
                      minLength: {
                        value: 3,
                        message: t("username_min_length"),
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: t("username_invalid_chars"),
                      },
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
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("your_email_placeholder")}
                    {...register("email", {
                      required: t("email_required"),
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: t("email_invalid"),
                      },
                    })}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("enter_strong_password")}
                      {...register("password", {
                        required: t("password_required"),
                        validate: validatePassword,
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
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {watch("password") && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < passwordStrength
                                ? passwordStrength <= 2
                                  ? "bg-destructive"
                                  : passwordStrength <= 3
                                    ? "bg-yellow-500"
                                    : "bg-success"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("password_strength")}:{" "}
                        {passwordStrength <= 2
                          ? t("password_weak")
                          : passwordStrength <= 3
                            ? t("password_medium")
                            : t("password_strong")}
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("confirm_password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("enter_password_again")}
                      {...register("confirmPassword", {
                        required: t("confirm_password_required"),
                        validate: (value) =>
                          value === password || t("passwords_dont_match"),
                      })}
                      className={
                        errors.confirmPassword
                          ? "border-destructive pr-10"
                          : "pr-10"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      {...register("acceptTerms", {
                        required: t("must_accept_terms"),
                      })}
                      className="mt-0.5"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-5">
                      {t("i_agree_with")}{" "}
                      <Button variant="link" className="p-0 h-auto text-sm">
                        {t("terms_of_service")}
                      </Button>{" "}
                      {t("and")}{" "}
                      <Button variant="link" className="p-0 h-auto text-sm">
                        {t("privacy_policy")}
                      </Button>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-destructive">
                      {errors.acceptTerms.message}
                    </p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      {...register("acceptMarketing")}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="acceptMarketing"
                      className="text-sm leading-5"
                    >
                      {t("accept_marketing_emails")}
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("creating_account") : t("create_account")}
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

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full relative"
                  onClick={() => OAuthService.initiateGoogleAuth()}
                  type="button"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t("google")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full relative"
                  onClick={() => OAuthService.initiateGitHubAuth()}
                  type="button"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  {t("github")}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t("already_have_account")}{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    {t("login")}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
