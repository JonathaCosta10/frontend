/**
 * LoginExample.tsx - Exemplo de como usar o design pattern Rules
 * Este arquivo mostra como as páginas devem chamar o sistema de APIs
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { login, register } from "@/contexts/Rules";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export default function LoginExample() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit } = useForm<LoginForm>();

  // Exemplo de uso do design pattern conforme especificado
  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);

    try {
      // Seguindo as regras especificadas:
      // const chave = "login"
      // const success = await login(data.email, data.password, chave);

      const chave = "login";
      const success = await login(data.email, data.password, chave);

      if (success) {
        console.log("✅ Login realizado com sucesso!");
        // Redirecionar para dashboard
      } else {
        console.error("❌ Falha no login");
        // Mostrar erro para o usuário
      }
    } catch (error) {
      console.error("❌ Erro durante login:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exemplo para registro
  const onRegister = async (data: RegisterForm) => {
    setIsSubmitting(true);

    try {
      const chave = "register";
      const success = await register(data, chave);

      if (success) {
        console.log("✅ Registro realizado com sucesso!");
      } else {
        console.error("❌ Falha no registro");
      }
    } catch (error) {
      console.error("❌ Erro durante registro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-example">
      <h2>Exemplo de Uso do Design Pattern Rules</h2>

      <div className="code-example">
        <h3>Como usar nas páginas:</h3>
        <pre>
          {`// 1. Importar as funções do Rules
import { login, register, getBudgetData } from "@/contexts/Rules";

// 2. Chamar conforme especificado
const chave = "login";
const success = await login(data.email, data.password, chave);

// 3. Para outras operações
const custosData = await getBudgetData("custos", "maioresCustos");
const dividasData = await getBudgetData("dividas", "maioresDividas");`}
        </pre>
      </div>

      <div className="flow-explanation">
        <h3>Fluxo do Sistema:</h3>
        <ol>
          <li>
            <strong>Página chama:</strong> login(email, password, "login")
          </li>
          <li>
            <strong>Rules monta:</strong>
            <ul>
              <li>endpoint = getRoute("login") → "/api/auth/login/"</li>
              <li>headers = getHeaders("login") + hardCode</li>
              <li>body = {`{ email, password }`}</li>
            </ul>
          </li>
          <li>
            <strong>Rules consulta:</strong> services/api/PublicPages/Login.js
          </li>
          <li>
            <strong>Login.js faz:</strong> fetch para API Django
          </li>
          <li>
            <strong>Login.js retorna:</strong> success/error para Rules
          </li>
          <li>
            <strong>Rules retorna:</strong> boolean para a página
          </li>
        </ol>
      </div>

      <div className="status-codes">
        <h3>Tratamento de Status:</h3>
        <ul>
          <li>
            <strong>Sucesso:</strong> 200, 201, 202, 203
          </li>
          <li>
            <strong>Erro:</strong> 400, 401, 404
          </li>
        </ul>
      </div>
    </div>
  );
}
