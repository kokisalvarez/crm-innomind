import { GoogleCredentials, GoogleTokens } from '../types/calendar';

class GoogleAuthService {
  private credentials: GoogleCredentials;
  private tokens: GoogleTokens | null = null;

  constructor() {
    this.credentials = {
      client_id: "881256214969-q8nmabf0mvm26pgaqskc9qh23rpkk9m8.apps.googleusercontent.com",
      client_secret: "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",
      redirect_uris: ["https://tu-app.bolt.new/auth/google/callback"],
      project_id: "crm-innomind",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token"
    };
    
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    const storedTokens = localStorage.getItem('google_tokens');
    if (storedTokens) {
      try {
        this.tokens = JSON.parse(storedTokens);
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
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
      client_id: this.credentials.client_id,
      redirect_uri: this.credentials.redirect_uris[0],
      scope: scopes,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.credentials.auth_uri}?${params.toString()}`;
  }

  public async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    try {
      const response = await fetch(this.credentials.token_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.credentials.client_id,
          client_secret: this.credentials.client_secret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.credentials.redirect_uris[0],
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens: GoogleTokens = await response.json();
      this.saveTokensToStorage(tokens);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  public async refreshAccessToken(): Promise<GoogleTokens> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(this.credentials.token_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.credentials.client_id,
          client_secret: this.credentials.client_secret,
          refresh_token: this.tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const newTokens = await response.json();
      const updatedTokens: GoogleTokens = {
        ...this.tokens,
        access_token: newTokens.access_token,
        expiry_date: Date.now() + (newTokens.expires_in * 1000),
      };

      this.saveTokensToStorage(updatedTokens);
      return updatedTokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  public async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('No tokens available. Please authenticate first.');
    }

    // Check if token is expired (with 5 minute buffer)
    if (this.tokens.expiry_date && Date.now() > (this.tokens.expiry_date - 300000)) {
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