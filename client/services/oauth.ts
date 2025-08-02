interface OAuthProvider {
  name: string;
  authUrl: string;
  redirectUri: string;
}

// Configurações OAuth2
const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    redirectUri: `${window.location.origin}/auth/google/callback`,
    scope: "openid email profile",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
  github: {
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || "",
    redirectUri: `${window.location.origin}/auth/github/callback`,
    scope: "user:email",
    authUrl: "https://github.com/login/oauth/authorize",
  },
};

export class OAuthService {
  private static generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private static storeState(state: string): void {
    sessionStorage.setItem("oauth_state", state);
  }

  private static validateState(state: string): boolean {
    const storedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");
    return storedState === state;
  }

  static async initiateGoogleAuth(): Promise<void> {
    const state = this.generateState();
    this.storeState(state);

    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.google.clientId,
      redirect_uri: OAUTH_CONFIG.google.redirectUri,
      response_type: "code",
      scope: OAUTH_CONFIG.google.scope,
      state: state,
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
  }

  static async initiateGitHubAuth(): Promise<void> {
    const state = this.generateState();
    this.storeState(state);

    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.github.clientId,
      redirect_uri: OAUTH_CONFIG.github.redirectUri,
      scope: OAUTH_CONFIG.github.scope,
      state: state,
      allow_signup: "true",
    });

    const authUrl = `${OAUTH_CONFIG.github.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
  }

  static async exchangeCodeForToken(
    provider: "google" | "github",
    code: string,
    state: string,
  ): Promise<any> {
    if (!this.validateState(state)) {
      throw new Error("Invalid OAuth state parameter");
    }

    // Aqui você faria a chamada para seu backend para trocar o código pelo token
    const response = await fetch("/api/auth/oauth/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        code,
        redirectUri: OAUTH_CONFIG[provider].redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async handleOAuthCallback(
    provider: "google" | "github",
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      if (error) {
        return { success: false, error: `OAuth error: ${error}` };
      }

      if (!code || !state) {
        return { success: false, error: "Missing OAuth parameters" };
      }

      const tokenData = await this.exchangeCodeForToken(provider, code, state);

      // Aqui você salvaria o token e dados do usuário
      localStorage.setItem("auth_token", tokenData.access_token);

      return { success: true, user: tokenData.user };
    } catch (error) {
      console.error("OAuth callback error:", error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export default OAuthService;
