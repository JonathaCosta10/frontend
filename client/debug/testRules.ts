// Teste rápido para verificar se Rules.login está funcionando
import { login } from '../contexts/Rules';

console.log("🧪 TESTE - login function:", typeof login);
console.log("🧪 TESTE - login function exists:", !!login);

// Função de teste
window.testLogin = async () => {
  console.log("🧪 TESTE - Iniciando testLogin...");
  try {
    const result = await login("teste", "teste", "login");
    console.log("🧪 TESTE - Resultado:", result);
  } catch (error) {
    console.error("🧪 TESTE - Erro:", error);
  }
};

console.log("🧪 TESTE - testLogin adicionada ao window. Use: window.testLogin()");
