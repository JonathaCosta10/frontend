import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { localStorageManager } from "../lib/localStorage";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const AuthDebugger: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkAuthState = () => {
    const authToken = localStorageManager.getAuthToken();
    const refreshToken = localStorageManager.getRefreshToken();
    const userData = localStorageManager.getUserData();

    const info = {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      loading,
      hasUser: !!user,
      hasAuthToken: !!authToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData,
      authTokenValid: authToken ? isTokenValid(authToken) : false,
      userEmail: user?.email || userData?.email || "N/A",
      authTokenExpiry: authToken ? getTokenExpiry(authToken) : "N/A",
    };

    setDebugInfo(info);
    console.log("🔍 Auth Debug Info:", info);
  };

  const testRefreshToken = async () => {
    try {
      const refreshTokenValue = localStorageManager.getRefreshToken();
      if (!refreshTokenValue) {
        console.error("❌ No refresh token found");
        return;
      }

      console.log("🔄 Testing refresh token...");

      // Simular chamada de refresh (substitua pela função real quando disponível)
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
      const response = await fetch(
        `${BACKEND_URL}/api/auth/token/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": import.meta.env.VITE_API_KEY || "organizesee-api-key-2025-secure",
          },
          body: JSON.stringify({ refresh: refreshTokenValue }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Refresh successful:", data);

        if (data.access) {
          localStorageManager.setAuthToken(data.access);
        }
        if (data.refresh) {
          localStorageManager.setRefreshToken(data.refresh);
        }

        checkAuthState();
      } else {
        console.error("❌ Refresh failed:", response.status);
      }
    } catch (error) {
      console.error("❌ Refresh error:", error);
    }
  };

  const clearAuthData = () => {
    localStorageManager.clearAuthData();
    setDebugInfo(null);
    console.log("🧹 Auth data cleared");
  };

  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  };

  const getTokenExpiry = (token: string): string => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return new Date(payload.exp * 1000).toLocaleString();
    } catch {
      return "Invalid token";
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto z-50 bg-background border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🔍 Auth Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Button size="sm" onClick={checkAuthState}>
            Check State
          </Button>
          <Button size="sm" onClick={testRefreshToken}>
            Test Refresh
          </Button>
          <Button size="sm" variant="destructive" onClick={clearAuthData}>
            Clear Auth
          </Button>
        </div>

        {debugInfo && (
          <div className="text-xs bg-muted p-2 rounded">
            <div>
              🔐 Authenticated: {debugInfo.isAuthenticated ? "✅" : "❌"}
            </div>
            <div>⏳ Loading: {debugInfo.loading ? "⏳" : "✅"}</div>
            <div>👤 User: {debugInfo.hasUser ? "✅" : "❌"}</div>
            <div>🎫 Auth Token: {debugInfo.hasAuthToken ? "✅" : "❌"}</div>
            <div>
              🔄 Refresh Token: {debugInfo.hasRefreshToken ? "✅" : "❌"}
            </div>
            <div>✅ Token Valid: {debugInfo.authTokenValid ? "✅" : "❌"}</div>
            <div>📧 Email: {debugInfo.userEmail}</div>
            <div>⏰ Expires: {debugInfo.authTokenExpiry}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
