import { api } from "@/lib/api";

// Interfaces para os requests de email
interface RecuperarSenhaRequest {
  email: string;
}

interface VerificarCodigoRequest {
  email: string;
  codigo: string;
}

interface RedefinirSenhaComCodigoRequest {
  email: string;
  codigo: string;
  senha: string;
  senha_confirmacao: string;
}

interface RedefinirSenhaRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

interface ContatoSuporteRequest {
  assunto: string;
  mensagem: string;
  email?: string; // Opcional para usuários logados
}

interface ContatoPublicoRequest {
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
}

interface TesteEmailResponse {
  status: string;
  mensagem: string;
}

export class EmailService {
  /**
   * Solicita recuperação de senha - Público
   */
  static async recuperarSenha(data: RecuperarSenhaRequest): Promise<{ message: string }> {
    try {
      // Usar endpoint correto conforme configurado no backend
      const response = await api.post("/services/api/auth/recuperar-senha/", data, false);
      return response;
    } catch (error: any) {
      throw new Error(
        error.details?.message || 
        error.details?.error || 
        error.message ||
        "Erro ao solicitar recuperação de senha"
      );
    }
  }

  /**
   * Verifica código de recuperação de 8 dígitos - Público
   */
  static async verificarCodigoRecuperacao(data: VerificarCodigoRequest): Promise<{ token: string; message: string }> {
    try {
      const response = await api.post("/api/auth/validar-codigo/", data, false);
      return response;
    } catch (error: any) {
      throw new Error(
        error.details?.message || 
        error.details?.error || 
        error.message ||
        "Código inválido ou expirado"
      );
    }
  }

  /**
   * Redefine senha com código verificado - Público
   */
  static async redefinirSenhaComCodigo(data: RedefinirSenhaComCodigoRequest): Promise<{ message: string }> {
    try {
      const response = await api.post("/api/auth/validar-redefinir-senha/", data, false);
      return response;
    } catch (error: any) {
      throw new Error(
        error.details?.message || 
        error.details?.error || 
        error.message ||
        "Erro ao redefinir senha"
      );
    }
  }

  /**
   * Redefine senha com token - Público
   */
  static async redefinirSenha(data: RedefinirSenhaRequest): Promise<{ message: string }> {
    try {
      const response = await api.post("/api/auth/redefinir-senha/", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao redefinir senha"
      );
    }
  }

  /**
   * Contato de suporte para usuários logados - Autenticado
   */
  static async contatoSuporte(data: ContatoSuporteRequest): Promise<{ message: string }> {
    try {
      const response = await api.post("/api/contato/suporte/", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao enviar mensagem de suporte"
      );
    }
  }

  /**
   * Contato público (sem login) - Público
   */
  static async contatoPublico(data: ContatoPublicoRequest): Promise<{ message: string }> {
    try {
      const response = await api.post("/api/contato/publico/", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao enviar mensagem"
      );
    }
  }

  /**
   * Teste de configuração de email - Autenticado
   */
  static async testeEmail(): Promise<TesteEmailResponse> {
    try {
      const response = await api.post("/api/email/teste/", {});
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Erro ao testar configuração de email"
      );
    }
  }

  /**
   * Valida formato de email
   */
  static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida força da senha
   */
  static validarSenha(senha: string): {
    valida: boolean;
    erros: string[];
  } {
    const erros: string[] = [];
    
    if (senha.length < 8) {
      erros.push("Senha deve ter pelo menos 8 caracteres");
    }
    
    if (!/[A-Z]/.test(senha)) {
      erros.push("Senha deve conter pelo menos uma letra maiúscula");
    }
    
    if (!/[a-z]/.test(senha)) {
      erros.push("Senha deve conter pelo menos uma letra minúscula");
    }
    
    if (!/\d/.test(senha)) {
      erros.push("Senha deve conter pelo menos um número");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      erros.push("Senha deve conter pelo menos um caractere especial");
    }
    
    return {
      valida: erros.length === 0,
      erros
    };
  }
}

export default EmailService;
