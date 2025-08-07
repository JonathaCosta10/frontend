import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, ArrowLeft, Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";
import EmailService from "@/services/emailService";

interface ResetPasswordForm {
  new_password: string;
  confirm_password: string;
}

export default function ResetPassword() {
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    valida: boolean;
    erros: string[];
  }>({ valida: false, erros: [] });

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  // Pega os dados do state da navegação
  const email = location.state?.email;
  const codigo = location.state?.codigo;
  const token = location.state?.token;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
  } = useForm<ResetPasswordForm>();

  const watchPassword = watch("new_password", "");

  // Se não tem dados necessários, redireciona
  useEffect(() => {
    if (!email || !codigo || !token) {
      navigate("/forgot-password");
    }
  }, [email, codigo, token, navigate]);

  // Validar força da senha em tempo real
  useEffect(() => {
    if (watchPassword) {
      const validation = EmailService.validarSenha(watchPassword);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength({ valida: false, erros: [] });
    }
  }, [watchPassword]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsSubmitting(true);

    try {
      // Validar se as senhas coincidem
      if (data.new_password !== data.confirm_password) {
        toast({
          title: "Senhas não coincidem",
          description: "As senhas informadas não são iguais. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Validar força da senha
      if (!passwordStrength.valida) {
        toast({
          title: "Senha não atende aos critérios",
          description: "A senha deve atender a todos os requisitos de segurança.",
          variant: "destructive",
        });
        return;
      }

      // Chamar API para redefinir senha
      const response = await EmailService.redefinirSenhaComCodigo({
        email: email,
        codigo: codigo,
        token: token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi redefinida. Você pode fazer login agora.",
        variant: "default",
      });

      // Redirecionar para login após sucesso
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Senha alterada com sucesso! Faça login com sua nova senha." 
          } 
        });
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!watchPassword) return "text-muted-foreground";
    if (passwordStrength.valida) return "text-green-600";
    if (watchPassword.length >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getPasswordStrengthText = () => {
    if (!watchPassword) return "Digite uma senha";
    if (passwordStrength.valida) return "Senha forte";
    if (watchPassword.length >= 4) return "Senha média";
    return "Senha fraca";
  };

  if (!email || !codigo || !token) {
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
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <LanguageSelector variant="compact" showCurrency={false} size="sm" />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Link to="/forgot-password">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
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
              <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
              <p className="text-muted-foreground">
                Defina uma nova senha segura para sua conta
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-900">Código verificado!</p>
                    <p className="text-sm text-green-700">Agora você pode definir sua nova senha</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      {...register("new_password", {
                        required: "Nova senha é obrigatória",
                        minLength: {
                          value: 8,
                          message: "Senha deve ter pelo menos 8 caracteres",
                        },
                      })}
                      className={`pr-10 ${errors.new_password ? "border-destructive" : ""}`}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.new_password && (
                    <p className="text-sm text-destructive">{errors.new_password.message}</p>
                  )}
                  
                  {/* Indicador de força da senha */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Força da senha:</span>
                      <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    
                    {watchPassword && passwordStrength.erros.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Requisitos:</p>
                        <ul className="text-xs space-y-1">
                          {passwordStrength.erros.map((erro, index) => (
                            <li key={index} className="text-red-600 flex items-center space-x-1">
                              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                              <span>{erro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua nova senha"
                      {...register("confirm_password", {
                        required: "Confirmação de senha é obrigatória",
                        validate: (value) => {
                          const password = getValues("new_password");
                          return value === password || "Senhas não coincidem";
                        },
                      })}
                      className={`pr-10 ${errors.confirm_password ? "border-destructive" : ""}`}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !passwordStrength.valida}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Alterando senha...
                    </>
                  ) : (
                    "Alterar Senha"
                  )}
                </Button>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Lembrou da senha?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Voltar ao Login
                  </Link>
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">🔒 Dicas de Segurança</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use uma combinação de letras maiúsculas e minúsculas</li>
                  <li>• Inclua números e caracteres especiais</li>
                  <li>• Evite informações pessoais (nome, data de nascimento)</li>
                  <li>• Use uma senha única para cada conta</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
