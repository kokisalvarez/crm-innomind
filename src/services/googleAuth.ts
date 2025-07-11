// src/services/googleAuth.ts

import { GoogleCredentials, GoogleTokens } from '../types/calendar';

const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI  = import.meta.env.VITE_GOOGLE_REDIRECT_URI!;

class GoogleAuthService {
  private credentials: GoogleCredentials;
  private tokens: GoogleTokens | null = null;

  constructor() {
    this.credentials = {
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      project_id:    'crm-innomind',
      auth_uri:      'https://accounts.google.com/o/oauth2/auth',
      token_uri:     'https://oauth2.googleapis.com/token',
    };

    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    const stored = localStorage.getItem('google_tokens');
    if (stored) {
      try {
        this.tokens = JSON.parse(stored);
      } catch {
        console.error('Error parsing stored tokens');
        localStorage.removeItem('google_tokens');
      }
    }
  }

  private saveTokensToStorage(tokens: GoogleTokens): void {
    this.tokens = tokens;
    localStorage.setItem('google_tokens', JSON.stringify(tokens));
  }

  public getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const params = new URLSearchParams({
      client_id:     this.credentials.client_id,
      redirect_uri:  this.credentials.redirect_uris[0],
      scope:         scopes,
      response_type: 'code',
      access_type:   'offline',
      prompt:        'consent'
    });

    return `${this.credentials.auth_uri}?${params.toString()}`;
  }

  public async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const resp = await fetch(this.credentials.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        code,
        grant_type:    'authorization_code',
        redirect_uri:  this.credentials.redirect_uris[0],
      })
    });

    if (!resp.ok) {
      throw new Error(`Token exchange failed: ${resp.statusText}`);
    }

    const tokens: GoogleTokens = await resp.json();
    this.saveTokensToStorage(tokens);
    return tokens;
  }

  public async refreshAccessToken(): Promise<GoogleTokens> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const resp = await fetch(this.credentials.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        refresh_token: this.tokens.refresh_token,
        grant_type:    'refresh_token',
      })
    });

    if (!resp.ok) {
      throw new Error(`Token refresh failed: ${resp.statusText}`);
    }

    const body = await resp.json();
    const updated: GoogleTokens = {
      ...this.tokens,
      access_token: body.access_token,
      expiry_date:  Date.now() + body.expires_in * 1000
    };

    this.saveTokensToStorage(updated);
    return updated;
  }

  public async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('No tokens available. Authenticate first.');
    }
    if (this.tokens.expiry_date && Date.now() > this.tokens.expiry_date - 300_000) {
      await this.refreshAccessToken();
    }
    return this.tokens.access_token;
  }

  public isAuthenticated(): boolean {
    return !!this.tokens?.access_token;
  }

  public logout(): void {
    this.tokens = null;
    localStorage.removeItem('google_tokens');
  }

  public getTokens(): GoogleTokens | null {
    return this.tokens;
  }
}

export const googleAuthService = new GoogleAuthService();
