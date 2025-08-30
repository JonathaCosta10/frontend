import React from 'react';
import { Button } from "@/components/ui/button";
import { localStorageManager } from "../lib/localStorage";
import { eventEmitter, EVENTS } from "../lib/eventEmitter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, User } from "lucide-react";

export default function PremiumStatusTestSimulator() {
  const currentStatus = localStorageManager.get("isPaidUser");
  
  const togglePremiumStatus = () => {
    const newStatus = !currentStatus;
    
    console.log(`🧪 Simulando mudança de status premium: ${currentStatus} → ${newStatus}`);
    
    // Atualizar localStorage (que vai disparar eventos)
    localStorageManager.set("isPaidUser", newStatus);
    
    // Atualizar userData também
    const userData = localStorageManager.getUserData();
    if (userData) {
      userData.isPaidUser = newStatus;
      localStorageManager.setUserData(userData);
    }
    
    // Disparar evento manual para garantir
    eventEmitter.emit(EVENTS.PREMIUM_STATUS_CHANGED, {
      isPaidUser: newStatus,
      source: 'test_simulator'
    });
    
    console.log(`✅ Status premium simulado atualizado para: ${newStatus ? "Premium" : "Gratuito"}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Simulador de Status Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {currentStatus ? (
              <>
                <Crown className="h-6 w-6 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-600">PREMIUM</span>
              </>
            ) : (
              <>
                <User className="h-6 w-6 text-gray-500" />
                <span className="text-lg font-bold text-gray-600">GRATUITO</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Status atual no localStorage: {String(currentStatus)}
          </p>
        </div>
        
        <Button 
          onClick={togglePremiumStatus}
          className="w-full"
          variant={currentStatus ? "outline" : "default"}
        >
          {currentStatus ? "Simular Downgrade para Gratuito" : "Simular Upgrade para Premium"}
        </Button>
        
        <div className="text-xs text-gray-400 text-center">
          ⚠️ Apenas para desenvolvimento e debug
        </div>
      </CardContent>
    </Card>
  );
}
