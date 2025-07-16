// project/lib/googleCalendarService.ts

import type { CalendarEvent, EventAttendee } from '../src/types/calendar';
import { googleAuthService } from './googleAuth';

class GoogleCalendarService {
  private readonly baseUrl = 'https://www.googleapis.com/calendar/v3';

  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const accessToken = await googleAuthService.getValidAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  }

  public async getCalendars(): Promise<any[]> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/users/me/calendarList`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  }

  public async getEvents(
    calendarId = 'primary',
    timeMin?: Date,
    timeMax?: Date
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
    });
    if (timeMin) params.append('timeMin', timeMin.toISOString());
    if (timeMax) params.append('timeMax', timeMax.toISOString());

    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/calendars/${encodeURIComponent(
        calendarId
      )}/events?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    const data = await response.json();
    return this.convertGoogleEventsToCalendarEvents(data.items || []);
  }

  // ... resto de métodos igual

  private convertGoogleEventsToCalendarEvents(
    googleEvents: any[]
  ): CalendarEvent[] {
    return googleEvents.map((evt) =>
      this.convertGoogleEventToCalendarEvent(evt)
    );
  }

  private convertGoogleEventToCalendarEvent(googleEvent: any): CalendarEvent {
    /* ... igual que antes ... */
  }

  private convertCalendarEventToGoogleEvent(
    event: Partial<CalendarEvent>
  ): any {
    /* ... igual que antes ... */
  }
}

export const googleCalendarService = new GoogleCalendarService();
