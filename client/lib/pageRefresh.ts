/**
 * Utilitários para gerenciamento de refresh da página
 * Usado quando mudanças críticas precisam de recarregamento completo
 */

/**
 * Força um refresh da página com delay opcional
 * @param delayMs - Delay em milissegundos antes do refresh (padrão: 0)
 * @param reason - Motivo do refresh (para logs)
 */
export const forcePageRefresh = (delayMs: number = 0, reason: string = "Atualização necessária") => {
  console.log(`🔄 Forçando refresh da página: ${reason}`);
  
  if (delayMs > 0) {
    console.log(`⏰ Refresh da página em ${delayMs}ms...`);
    setTimeout(() => {
      window.location.reload();
    }, delayMs);
  } else {
    window.location.reload();
  }
};

/**
 * Força refresh da página com notificação visual
 * @param message - Mensagem a ser exibida
 * @param delayMs - Delay antes do refresh
 * @param type - Tipo da notificação (success, warning, info)
 */
export const forcePageRefreshWithNotification = (
  message: string,
  delayMs: number = 2000,
  type: 'success' | 'warning' | 'info' = 'info'
) => {
  // Cores baseadas no tipo
  const colors = {
    success: '#10B981',
    warning: '#F59E0B', 
    info: '#3B82F6'
  };

  // Criar notificação visual
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    max-width: 400px;
    font-family: system-ui, -apple-system, sans-serif;
    animation: slideIn 0.3s ease-out;
  `;

  // Adicionar CSS da animação
  if (!document.getElementById('refresh-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'refresh-notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 20px;">🔄</span>
      <div>
        <div style="font-size: 14px; font-weight: 700;">${message}</div>
        <div style="font-size: 12px; opacity: 0.9;">Recarregando em ${Math.ceil(delayMs/1000)}s...</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Forçar refresh após delay
  forcePageRefresh(delayMs, message);
  
  // Remover notificação após refresh (caso algo dê errado)
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, delayMs + 1000);
};

/**
 * Verifica se um refresh é necessário baseado em mudanças de dados críticos
 * @param oldData - Dados anteriores
 * @param newData - Novos dados
 * @param criticalFields - Campos que requerem refresh se mudarem
 */
export const checkIfRefreshNeeded = (
  oldData: any,
  newData: any,
  criticalFields: string[] = ['isPaidUser', 'subscription_type']
): boolean => {
  if (!oldData || !newData) return false;
  
  for (const field of criticalFields) {
    if (oldData[field] !== newData[field]) {
      console.log(`🔍 Campo crítico '${field}' mudou: ${oldData[field]} → ${newData[field]}`);
      return true;
    }
  }
  
  return false;
};

/**
 * Força refresh se dados críticos mudaram
 * @param oldData - Dados anteriores  
 * @param newData - Novos dados
 * @param message - Mensagem personalizada
 */
export const refreshIfCriticalDataChanged = (
  oldData: any,
  newData: any,
  message: string = "Dados importantes foram atualizados"
) => {
  if (checkIfRefreshNeeded(oldData, newData)) {
    forcePageRefreshWithNotification(message, 2000, 'info');
    return true;
  }
  return false;
};

export default {
  forcePageRefresh,
  forcePageRefreshWithNotification,
  checkIfRefreshNeeded,
  refreshIfCriticalDataChanged
};
