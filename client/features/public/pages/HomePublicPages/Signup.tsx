import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Moon, Sun, Eye, EyeOff, ArrowLeft, Check, CheckCircle, Circle, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/core/auth/AuthContext";
import { useTranslation } from '../../../../contexts/TranslationContext';
import { TermsAndPrivacyModal } from "@/components/ui/TermsAndPrivacyModal";
import { useToast } from '@/shared/hooks/use-toast';
import OAuthService from "@/core/auth/services/oauth";
import GoogleAuthButton from "@/core/auth/components/GoogleAuthButton";
import Footer from "@/components/ui/Footer";
import { useTheme } from '../../../../contexts/ThemeContext';
import { useResponsive } from '@/shared/hooks/useResponsive';

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
  const { toast } = useToast();
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
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);

    if (!hasMinLength) return t("password_min_length");
    if (!hasUpperCase) return t("password_uppercase");
    if (!hasLowerCase) return t("password_lowercase");
    if (!hasNumber) return t("password_number");
    if (!hasSpecialChar) return t("password_special_char") || "A senha deve conter pelo menos um caractere especial";
    return true;
  };

  const getPasswordRequirements = (password: string) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    };
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

  const getUsernameRequirements = (username: string) => {
    return {
      hasValidChars: /^[a-zA-Z0-9_]*$/.test(username),
      hasMinLength: username.length >= 3,
    };
  };

  const passwordStrength = getPasswordStrength(watch("password") || "");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-2">
              <img src="/finance-logo.svg" alt="Organizesee Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            <div className="flex items-center space-x-4">
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
                  <div className="relative">
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
                        onChange: (e) => {
                          // Prevent spaces and special characters while typing
                          const value = e.target.value;
                          if (value && !/^[a-zA-Z0-9_]*$/.test(value)) {
                            e.target.value = value.replace(/[^a-zA-Z0-9_]/g, '');
                          }
                        }
                      })}
                      className={errors.username ? "border-destructive" : ""}
                    />
                  </div>
                  {errors.username ? (
                    <p className="text-sm text-destructive">
                      {errors.username.message}
                    </p>
                  ) : (
                    <div className="space-y-1 mt-2 text-xs">
                      {(() => {
                        const username = watch("username") || "";
                        const requirements = getUsernameRequirements(username);
                        
                        // Mostrar apenas requisitos NÃO atendidos
                        const unmetRequirements = [];
                        
                        if (!requirements.hasValidChars) {
                          unmetRequirements.push({
                            key: 'validChars',
                            text: "Nome de usuário deve conter apenas letras, números e _"
                          });
                        }
                        
                        if (!requirements.hasMinLength) {
                          unmetRequirements.push({
                            key: 'minLength',
                            text: "Nome de usuário deve ter pelo menos 3 caracteres"
                          });
                        }
                        
                        // Se todos os requisitos foram atendidos, não mostrar nada
                        if (unmetRequirements.length === 0) {
                          return null;
                        }
                        
                        return (
                          <ul className="space-y-1 pl-1">
                            {unmetRequirements.map((req) => (
                              <li key={req.key} className="flex items-center text-red-500">
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                {req.text}
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </div>
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

                  {/* Password Strength and Requirements Indicator */}
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

                      {/* Password Requirements Checklist */}
                      <div className="space-y-1 mt-2 text-xs">
                        {(() => {
                          const password = watch("password") || "";
                          const requirements = getPasswordRequirements(password);
                          
                          // Mostrar apenas requisitos NÃO atendidos
                          const unmetRequirements = [];
                          
                          if (!requirements.hasMinLength) {
                            unmetRequirements.push({
                              key: 'minLength',
                              text: t("password_min_length") || "Pelo menos 8 caracteres"
                            });
                          }
                          
                          if (!requirements.hasUpperCase) {
                            unmetRequirements.push({
                              key: 'upperCase',
                              text: t("password_uppercase") || "Pelo menos uma letra maiúscula"
                            });
                          }
                          
                          if (!requirements.hasLowerCase) {
                            unmetRequirements.push({
                              key: 'lowerCase',
                              text: t("password_lowercase") || "Pelo menos uma letra minúscula"
                            });
                          }
                          
                          if (!requirements.hasNumber) {
                            unmetRequirements.push({
                              key: 'number',
                              text: t("password_number") || "Pelo menos um número"
                            });
                          }
                          
                          if (!requirements.hasSpecialChar) {
                            unmetRequirements.push({
                              key: 'specialChar',
                              text: t("password_special_char") || "Pelo menos um caractere especial"
                            });
                          }
                          
                          // Se todos os requisitos foram atendidos, não mostrar nada
                          if (unmetRequirements.length === 0) {
                            return null;
                          }
                          
                          return (
                            <ul className="space-y-1 pl-1">
                              {unmetRequirements.map((req) => (
                                <li key={req.key} className="flex items-center text-red-500">
                                  <X className="h-3.5 w-3.5 mr-1.5" />
                                  {req.text}
                                </li>
                              ))}
                            </ul>
                          );
                        })()}
                      </div>
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
                      {t("i_agree_with")} {" "}
                      <TermsAndPrivacyModal 
                        triggerText={`${t("terms_of_service")} ${t("and")} ${t("privacy_policy")}`}
                        className="inline"
                      />
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

              <div className="grid grid-cols-1 gap-4">
                <GoogleAuthButton context="signup" />
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
      
      <Footer />
    </div>
  );
}
