export interface PromptMomentNotification {
  isDisplayed(): boolean;
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
  getNotDisplayedReason(): string;
  getSkippedReason(): string;
  getDismissedReason(): string;
  getMomentType(): string;
}

export interface CredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

export interface GsiButtonConfiguration {
  type: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: string;
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
  local?: string;
}

export interface GsiInitializeOptions {
  client_id: string;
  auto_select?: boolean;
  callback: (response: CredentialResponse) => void;
  native_callback?: (response: CredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: string;
  state_cookie_domain?: string;
  ux_mode?: string;
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
}

export interface IdConfiguration extends GsiInitializeOptions {
  type?: string;
}

export interface GoogleAccountsId {
  initialize: (options: GsiInitializeOptions) => void;
  prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
  renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
  disableAutoSelect: () => void;
  storeCredential: (credential: { id: string; password: string }, callback?: () => void) => void;
  cancel: () => void;
  onGoogleLibraryLoad: () => void;
  revoke: (accessToken: string, callback?: () => void) => void;
}

export interface Google {
  accounts: {
    id: GoogleAccountsId;
    oauth2: {
      initTokenClient: (config: any) => any;
      hasGrantedAllScopes: (token: string, ...scopes: string[]) => boolean;
      hasGrantedAnyScope: (token: string, ...scopes: string[]) => boolean;
      revoke: (accessToken: string, callback?: () => void) => void;
    };
  };
}

declare global {
  interface Window {
    google?: Google;
  }
}
