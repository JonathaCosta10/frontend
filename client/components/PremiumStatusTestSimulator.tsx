/**
 * Simulador de Refresh Token - Para Testes de Premium Status
 * Use este componente temporariamente para testar mudanças de status premium
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { localStorageManager } from "../lib/localStorage";
import { eventEmitter, EVENTS } from "../lib/eventEmitter";
import { responseParms } from "../contexts/ResponseParms";

export default function PremiumStatusTestSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);
  const currentUser = localStorageManager.getUserData();
  const currentPremiumStatus = localStorageManager.get("isPaidUser");

  const simulateRefreshTokenResponse = async (newPremiumStatus: boolean) => {
    setIsSimulating(true);
    
    console.log("🧪 Simulando resposta de refresh token com status premium:", newPremiumStatus);
    
    // Simular resposta do backend igual ao exemplo fornecido
    const mockRefreshResponse = {
      access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_access_token",
      refresh: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_refresh_token", 
      user: {
        id: currentUser?.id || 9,
        username: currentUser?.username || "test@example.com",
        email: currentUser?.email || "test@example.com",
        first_name: currentUser?.first_name || "Test",
        last_name: currentUser?.last_name || "User",
        full_name: currentUser?.full_name || "Test User",
        isPaidUser: newPremiumStatus
      }
    };

    // Simular o processamento através do ResponseParms
    const apiResponse = {
      success: true,
      data: mockRefreshResponse,
      status: 200,
      message: "Token refreshed successfully"
    };

    // Processar através do sistema real
    responseParms.processResponse({
      response: apiResponse,
      chave: "refreshToken",
      method: "POST",
      endpoint: "/api/auth/token/refresh/",
      withAuth: false
    });

    // Se o status mudou, a página será recarregada automaticamente
    // Senão, resetar o estado após um tempo
    if (localStorageManager.get("isPaidUser") === newPremiumStatus) {
      setTimeout(() => {
        setIsSimulating(false);
      }, 1000);
    }
  };

  const forcePageRefresh = () => {
    console.log("🔄 Forçando refresh manual da página...");
    window.location.reload();
  };

  return (
    <Card className="max-w-md mx-auto mb-6 border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-900/20">
      <CardHeader>
        <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
          🧪 Simulador de Premium Status
          <Badge variant="outline" className="text-xs">
            DEBUG ONLY
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <p>
            <strong>Status Atual:</strong>{" "}
            <Badge variant={currentPremiumStatus ? "default" : "secondary"}>
              {currentPremiumStatus ? "Premium" : "Gratuito"}
            </Badge>
          </p>
          <p>
            <strong>Usuário:</strong> {currentUser?.full_name || "N/A"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Simular mudança de status através do refresh token:
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isSimulating || currentPremiumStatus}
              onClick={() => simulateRefreshTokenResponse(true)}
            >
              {isSimulating ? "Simulando..." : "→ Premium"}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              disabled={isSimulating || !currentPremiumStatus}
              onClick={() => simulateRefreshTokenResponse(false)}
            >
              {isSimulating ? "Simulando..." : "→ Gratuito"}
            </Button>
          </div>
          
          <div className="pt-2 border-t">
            <Button
              size="sm"
              variant="destructive"
              onClick={forcePageRefresh}
            >
              🔄 Forçar Refresh da Página
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          💡 <strong>Como funciona:</strong><br/>
          • Mudança de status → Notificação visual → Página recarrega automaticamente em 2s<br/>
          • Se algo não funcionar, use o botão "Forçar Refresh" acima
        </div>
      </CardContent>
    </Card>
  );
}
