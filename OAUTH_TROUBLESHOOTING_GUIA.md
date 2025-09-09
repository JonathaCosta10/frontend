# Troubleshooting e Resolução de Problemas de Autenticação

Este documento fornece orientações para diagnosticar e resolver problemas comuns relacionados à autenticação OAuth no aplicativo.

## Sintomas Comuns e Soluções

### 1. Mensagem "Precisa estar logado" após autenticação bem-sucedida

**Possíveis causas:**
- Estado de autenticação não sincronizado entre componentes
- Tokens não armazenados corretamente no localStorage
- Eventos de autenticação não propagados corretamente

**Soluções:**
1. **Verifique o localStorage:**
   ```javascript
   // Abra o console do navegador e execute:
   console.log({
     authToken: !!localStorage.getItem('authToken'), 
     userData: !!localStorage.getItem('userData')
   });
   ```

2. **Force a revalidação manual:**
   ```javascript
   // No console do navegador:
   window.dispatchEvent(new CustomEvent('auth:login:success', {
     detail: { forceRevalidate: true }
   }));
   ```

3. **Limpe dados e faça login novamente:**
   ```javascript
   // No console do navegador:
   localStorage.removeItem('authToken');
   localStorage.removeItem('refreshToken');
   localStorage.removeItem('userData');
   // Agora vá para /login e tente novamente
   ```

### 2. Página em branco após autenticação

**Possíveis causas:**
- Erro no processamento do callback OAuth
- Problema com o formato do URL de redirecionamento
- Erro ao processar os tokens recebidos

**Soluções:**
1. **Verifique os erros no console do navegador**
2. **Verifique o formato da URL de callback:**
   - Certifique-se que está usando a URL correta registrada no console do Google Cloud Platform
   - Verifique se há problemas com localhost vs 127.0.0.1

3. **Verificar registro de eventos no console:**
   - Procure mensagens com prefixo "🔄", "✅" ou "❌" que indicam o status do processo de autenticação

### 3. Redirecionamento infinito ou erro CORS

**Possíveis causas:**
- Inconsistência entre URLs (localhost vs 127.0.0.1)
- Problema com as configurações de CORS no backend
- Cookies não sendo salvos corretamente

**Soluções:**
1. **Padronize o uso de URLs:**
   - Use consistentemente ou `localhost` ou `127.0.0.1`, não misture os dois
   - Atualize a configuração no Google Cloud Platform para corresponder

2. **Verifique as configurações de CORS:**
   - Certifique-se que o backend está permitindo requisições da origem correta
   - Verifique se `credentials: 'include'` está sendo usado nas chamadas fetch

## Ferramentas de Diagnóstico

### 1. Estado de Autenticação

Execute no console para verificar o estado atual da autenticação:

```javascript
// Verificar tokens no localStorage
const checkAuthStatus = () => {
  const authToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userData = localStorage.getItem('userData');
  
  console.log({
    authTokenPresente: !!authToken,
    refreshTokenPresente: !!refreshToken,
    userDataPresente: !!userData,
    authTokenValido: authToken ? 'Verificar validade' : 'N/A',
    userData: userData ? JSON.parse(userData) : 'N/A'
  });
};

checkAuthStatus();
```

### 2. Teste de Eventos

Para verificar se os eventos de autenticação estão funcionando:

```javascript
// Registrar listener temporário para eventos de autenticação
window.addEventListener('auth:login:success', (event) => {
  console.log('✅ Evento auth:login:success detectado:', event);
});

// Disparar evento de teste
window.dispatchEvent(new CustomEvent('auth:login:success', { 
  detail: { test: true } 
}));
```

### 3. Revalidação Manual do Token

Para forçar uma revalidação manual do token:

```javascript
// Obter a função revalidateAuth do contexto
const forceRevalidation = async () => {
  try {
    // Importar dynamicamente o contexto de autenticação
    const AuthContext = await import('/contexts/AuthContext.jsx');
    const auth = AuthContext.useAuth();
    
    if (auth && auth.revalidateAuth) {
      console.log('🔄 Iniciando revalidação manual...');
      await auth.revalidateAuth();
      console.log('✅ Revalidação concluída');
    } else {
      console.log('❌ Função revalidateAuth não encontrada');
    }
  } catch (error) {
    console.error('❌ Erro na revalidação manual:', error);
  }
};

forceRevalidation();
```

## Prevenção de Problemas

Para evitar futuros problemas de autenticação:

1. **Padronize URLs:**
   - Use consistentemente ou `localhost` ou `127.0.0.1`
   - Configure o projeto Google Cloud Platform adequadamente

2. **Verifique o fluxo de eventos:**
   - Garanta que eventos `auth:login:success` são propagados
   - Verifique se tokens são armazenados antes de disparar eventos

3. **Mantenha logs detalhados:**
   - Inclua informações de diagnóstico no console durante processo de autenticação
   - Capture e registre erros durante o processo de login

## Contato para Suporte

Se encontrar problemas persistentes:

1. Documente exatamente os passos para reproduzir o problema
2. Capture logs relevantes do console
3. Verifique o estado do localStorage antes e depois do login
4. Entre em contato com a equipe de desenvolvimento com essas informações
