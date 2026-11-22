/** Contracts shared by API calls, session state, and the login feature. */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role?: string;
  readonly roles?: readonly string[];
}

export type SessionStatus = 'anonymous' | 'authenticating' | 'authenticated' | 'failed';

export class AuthApiError extends Error {
  constructor(readonly code: 'invalid-credentials' | 'request-in-progress') {
    super(code);
    this.name = 'AuthApiError';
  }
}
