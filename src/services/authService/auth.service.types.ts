export interface AuthSessionResponse {
  name: string;
  authenticated: boolean;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkResponse {
  message: string;
}
