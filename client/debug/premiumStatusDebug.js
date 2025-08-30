// Debug Premium Status
// Esta função pode ser executada no console do browser para debug
// Digite: debugPremiumStatus() no console

window.debugPremiumStatus = function() {
  console.log("🔍 === DEBUG PREMIUM STATUS ===");
  
  // Verificar localStorage diretamente
  const isPaidUserRaw = localStorage.getItem('isPaidUser');
  const userDataRaw = localStorage.getItem('userData');
  
  console.log("📦 Dados RAW do localStorage:", {
    isPaidUser: isPaidUserRaw,
    userData: userDataRaw ? JSON.parse(userDataRaw) : null
  });
  
  // Verificar através do localStorageManager
  try {
    const localStorageManager = window.localStorageManager || 
      window['localStorageManager'] || 
      JSON.parse(localStorage.getItem('localStorageManager') || 'null');
    
    if (localStorageManager && localStorageManager.get) {
      console.log("🔧 Através do localStorageManager:", {
        isPaidUser: localStorageManager.get('isPaidUser'),
        userData: localStorageManager.getUserData ? localStorageManager.getUserData() : 'método não encontrado'
      });
    } else {
      console.log("❌ localStorageManager não encontrado no window");
    }
  } catch (error) {
    console.log("❌ Erro ao acessar localStorageManager:", error);
  }
  
  // Verificar contexto de autenticação se disponível
  if (window.React && window.React.useState) {
    console.log("⚛️ React disponível - verifique o contexto de autenticação manualmente");
  }
  
  // Verificar todos os itens do localStorage relacionados
  console.log("🗂️ Todos os itens do localStorage:");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    if (key && (key.includes('user') || key.includes('auth') || key.includes('premium') || key.includes('paid'))) {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  console.log("🔍 === FIM DEBUG ===");
  
  return {
    isPaidUserRaw,
    userDataRaw: userDataRaw ? JSON.parse(userDataRaw) : null,
    timestamp: new Date().toISOString()
  };
};

console.log("🔧 Função debugPremiumStatus() disponível no console");
