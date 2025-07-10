export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  meetLink?: string;
  attendees: EventAttendee[];
  category: EventCategory;
  color?: string;
  reminders: EventReminder[];
  isRecurring: boolean;
  recurrenceRule?: string;
  googleEventId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'public' | 'private';
}

export interface EventAttendee {
  id: string;
  email: string;
  name?: string;
  status: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  isOptional: boolean;
  phone?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface EventReminder {
  id: string;
  method: 'email' | 'popup' | 'whatsapp';
  minutes: number;
  enabled: boolean;
}

export interface GoogleCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  project_id: string;
  auth_uri: string;
  token_uri: string;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface CalendarSettings {
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  workingHours: {
    start: string;
    end: string;
  };
  timezone: string;
  defaultReminders: EventReminder[];
  autoCreateMeetLinks: boolean;
  syncWithGoogle: boolean;
  notificationsEnabled: boolean;
}

export interface MeetingSettings {
  allowExternalParticipants: boolean;
  requireApproval: boolean;
  enableRecording: boolean;
  defaultDuration: number;
  cameraDefault: boolean;
  microphoneDefault: boolean;
}