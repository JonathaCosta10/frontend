interface Window {
  gapi: {
    load(api: string, callback: () => void): void;
    auth2: {
      init(params: {
        client_id: string;
        scope: string;
      }): Promise<any>;
      getAuthInstance(): {
        signIn(params?: { scope: string }): Promise<GoogleUser>;
        signOut(): Promise<void>;
      };
    };
  };
}

interface GoogleUser {
  getBasicProfile(): {
    getId(): string;
    getName(): string;
    getGivenName(): string;
    getFamilyName(): string;
    getImageUrl(): string;
    getEmail(): string;
  };
  getAuthResponse(): {
    id_token: string;
    access_token: string;
    expires_in: number;
    scope: string;
    first_issued_at: number;
    expires_at: number;
  };
}
