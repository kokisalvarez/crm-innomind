import { CalendarEvent, EventAttendee } from '../types/calendar';
import { googleAuthService } from './googleAuth';

class GoogleCalendarService {
  private readonly baseUrl = 'https://www.googleapis.com/calendar/v3';

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await googleAuthService.getValidAccessToken();
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  public async getCalendars(): Promise<any[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/users/me/calendarList`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendars: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw error;
    }
  }

  public async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      if (timeMin) {
        params.append('timeMin', timeMin.toISOString());
      }

      if (timeMax) {
        params.append('timeMax', timeMax.toISOString());
      }

      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      return this.convertGoogleEventsToCalendarEvents(data.items || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  public async createEvent(event: Partial<CalendarEvent>, calendarId: string = 'primary'): Promise<CalendarEvent> {
    try {
      const googleEvent = this.convertCalendarEventToGoogleEvent(event);
      
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          body: JSON.stringify(googleEvent),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      return this.convertGoogleEventToCalendarEvent(createdEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  public async updateEvent(eventId: string, event: Partial<CalendarEvent>, calendarId: string = 'primary'): Promise<CalendarEvent> {
    try {
      const googleEvent = this.convertCalendarEventToGoogleEvent(event);
      
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PUT',
          body: JSON.stringify(googleEvent),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      const updatedEvent = await response.json();
      return this.convertGoogleEventToCalendarEvent(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  public async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  public async createMeetLink(event: Partial<CalendarEvent>): Promise<string> {
    try {
      const googleEvent = {
        ...this.convertCalendarEventToGoogleEvent(event),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/calendars/primary/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          body: JSON.stringify(googleEvent),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create event with Meet link: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      return createdEvent.conferenceData?.entryPoints?.[0]?.uri || '';
    } catch (error) {
      console.error('Error creating Meet link:', error);
      throw error;
    }
  }

  private convertGoogleEventsToCalendarEvents(googleEvents: any[]): CalendarEvent[] {
    return googleEvents.map(event => this.convertGoogleEventToCalendarEvent(event));
  }

  private convertGoogleEventToCalendarEvent(googleEvent: any): CalendarEvent {
    const start = googleEvent.start?.dateTime 
      ? new Date(googleEvent.start.dateTime)
      : new Date(googleEvent.start?.date || new Date());
    
    const end = googleEvent.end?.dateTime 
      ? new Date(googleEvent.end.dateTime)
      : new Date(googleEvent.end?.date || new Date());

    const attendees: EventAttendee[] = (googleEvent.attendees || []).map((attendee: any) => ({
      id: attendee.email,
      email: attendee.email,
      name: attendee.displayName,
      status: attendee.responseStatus || 'needsAction',
      isOptional: attendee.optional || false,
    }));

    return {
      id: googleEvent.id,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description || '',
      start,
      end,
      location: googleEvent.location || '',
      meetLink: googleEvent.conferenceData?.entryPoints?.[0]?.uri || '',
      attendees,
      category: {
        id: 'default',
        name: 'Default',
        color: googleEvent.colorId || '#3174ad',
      },
      color: googleEvent.colorId || '#3174ad',
      reminders: (googleEvent.reminders?.overrides || []).map((reminder: any) => ({
        id: `${reminder.method}-${reminder.minutes}`,
        method: reminder.method,
        minutes: reminder.minutes,
        enabled: true,
      })),
      isRecurring: !!googleEvent.recurrence,
      recurrenceRule: googleEvent.recurrence?.[0] || '',
      googleEventId: googleEvent.id,
      createdBy: googleEvent.creator?.email || 'unknown',
      createdAt: new Date(googleEvent.created),
      updatedAt: new Date(googleEvent.updated),
      status: googleEvent.status || 'confirmed',
      visibility: googleEvent.visibility || 'public',
    };
  }

  private convertCalendarEventToGoogleEvent(event: Partial<CalendarEvent>): any {
    const googleEvent: any = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start?.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end?.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (event.attendees && event.attendees.length > 0) {
      googleEvent.attendees = event.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name,
        optional: attendee.isOptional,
      }));
    }

    if (event.reminders && event.reminders.length > 0) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: event.reminders
          .filter(reminder => reminder.enabled)
          .map(reminder => ({
            method: reminder.method === 'whatsapp' ? 'popup' : reminder.method,
            minutes: reminder.minutes,
          })),
      };
    }

    if (event.recurrenceRule) {
      googleEvent.recurrence = [event.recurrenceRule];
    }

    return googleEvent;
  }
}

export const googleCalendarService = new GoogleCalendarService();