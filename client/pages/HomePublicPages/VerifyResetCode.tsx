import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, ArrowLeft, Shield, Mail, Timer, Eye, EyeOff, Lock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { useToast } from "@/hooks/use-toast";
// LanguageSelector removed - Portuguese only application
import EmailService from "@/services/emailService";

export default function VerifyResetCode() {
  const [darkMode, setDarkMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(180); // 3 minutes
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  // Pega o email do state da navegação
  const email = location.state?.email;

  // Se não tem email no state, redireciona para forgot-password
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Countdown para expiração do código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const handleCodeChange = (index: number, value: string) => {
    // Aceita qualquer caractere (letras maiúsculas, minúsculas, números e caracteres especiais)
    // Limita apenas o comprimento para 1 caractere por input
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus próximo input
      if (value && index < 7) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // Aceita qualquer caractere colado, mantendo case-sensitive
    const pastedText = e.clipboardData.getData("text");
    
    if (pastedText.length === 8) {
      const newCode = pastedText.split("");
      setCode(newCode);
      inputRefs.current[7]?.focus(); // Focus no último input
    } else if (pastedText.length > 8) {
      // Se o texto colado for maior que 8 caracteres, pega apenas os primeiros 8
      const newCode = pastedText.substring(0, 8).split("");
      setCode(newCode);
      inputRefs.current[7]?.focus(); // Focus no último input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    
    // Validações
    if (fullCode.length !== 8) {
      toast({
        title: "Código incompleto",
        description: "Por favor, insira o código completo de 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        title: "Nova senha obrigatória",
        description: "Por favor, insira uma nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Chamar API para redefinir senha com código
      const response = await EmailService.redefinirSenhaComCodigo({
        email: email,
        codigo: fullCode,
        senha: newPassword,
        senha_confirmacao: confirmPassword
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
        description: error.message || "Não foi possível alterar a senha. Verifique se o código está correto.",
        variant: "destructive",
      });
      
      // Limpar código em caso de erro
      setCode(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    // Previne clique se ainda há countdown ativo
    if (countdown > 0) {
      return;
    }

    try {
      await EmailService.recuperarSenha({ email: email });
      
      toast({
        title: "Novo código enviado",
        description: "Um novo código foi enviado para seu email.",
        variant: "default",
      });
      
      setCountdown(180); // Reset countdown to 3 minutes
      setCode(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar",
        description: error.message || "Não foi possível reenviar o código.",
        variant: "destructive",
      });
    }
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
                <span className="text-primary-foreground font-bold text-sm">O</span>
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
        <div className="w-full max-w-lg">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
              <p className="text-muted-foreground">
                Digite o código de verificação e defina sua nova senha
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">Código enviado para:</p>
                    <p className="text-sm text-blue-700 break-all">{email}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-center block">Código de Verificação</Label>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-lg font-mono"
                        maxLength={1}
                        disabled={isVerifying}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Código de 8 caracteres (letras, números e símbolos - sensível a maiúsculas/minúsculas)
                  </p>
                </div>

                {/* Campo Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      className="pr-10"
                      disabled={isVerifying}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isVerifying}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {newPassword && (
                    <div className="text-sm text-muted-foreground">
                      <div className={`flex items-center space-x-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-destructive'}`}>
                        <Lock className="h-3 w-3" />
                        <span>Mínimo 8 caracteres</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo Confirmação de Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className="pr-10"
                      disabled={isVerifying}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isVerifying}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {confirmPassword && (
                    <div className="text-sm">
                      <div className={`flex items-center space-x-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
                        <Lock className="h-3 w-3" />
                        <span>{newPassword === confirmPassword ? 'Senhas coincidem' : 'Senhas não coincidem'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={
                    isVerifying || 
                    code.join("").length !== 8 || 
                    !newPassword.trim() || 
                    !confirmPassword.trim() ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                  }
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Alterando Senha...
                    </>
                  ) : (
                    "Alterar Senha"
                  )}
                </Button>
              </form>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>
                    {countdown > 0 
                      ? `Código expira em ${formatTime(countdown)}`
                      : "Código expirado"
                    }
                  </span>
                </div>

                {countdown > 0 ? (
                  <Button 
                    variant="outline" 
                    onClick={handleResendCode} 
                    className="text-sm"
                    disabled={countdown > 0}
                  >
                    Reenviar código em {formatTime(countdown)}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">O código expirou</p>
                    <Button onClick={handleResendCode} className="text-sm">
                      Solicitar novo código
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Não recebeu o código?{" "}
                  {countdown > 0 ? (
                    <span className="text-muted-foreground">
                      Aguarde {formatTime(countdown)} para reenviar
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-primary hover:underline font-medium"
                    >
                      Reenviar
                    </button>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Lembrou da senha?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Voltar ao Login
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
