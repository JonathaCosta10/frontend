import { api } from "@/lib/api";

export interface TwoFactorSetupResponse {
  qr_code: string;
  secret_key: string;
}

export interface TwoFactorVerifyResponse {
  backup_codes: string[];
}

class AuthApiService {
  // ===== 2FA APIs =====
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    return await api.post("/api/auth/2fa/setup/", {});
  }

  async verify2FA(code: string): Promise<TwoFactorVerifyResponse> {
    return await api.post("/api/auth/2fa/verify/", { code });
  }

  // ===== AUTH APIs =====
  async login(email: string, password: string) {
    return await api.post("/api/auth/login/", { username: email, password }, false);
  }

  async register(userData: any) {
    return await api.post("/api/auth/register/", userData, false);
  }

  async refreshToken(refreshToken: string) {
    return await api.post("/api/auth/token/refresh/", { refresh: refreshToken }, false);
  }

  async logout(refreshToken: string) {
    return await api.post("/api/auth/logout/", { refresh: refreshToken }, false);
  }

  async getUser() {
    return await api.get("/api/auth/user/");
  }
}

export const authApi = new AuthApiService();
