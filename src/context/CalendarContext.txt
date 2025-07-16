import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, CalendarSettings, EventCategory, EventReminder } from '../types/calendar';
import { googleCalendarService } from '../services/googleCalendar';
import { googleAuthService } from '../services/googleAuth';

interface CalendarContextType {
  events: CalendarEvent[];
  categories: EventCategory[];
  settings: CalendarSettings;
  isGoogleConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Event management
  addEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => CalendarEvent | undefined;
  
  // Google integration
  connectToGoogle: () => void;
  disconnectFromGoogle: () => void;
  syncWithGoogle: () => Promise<void>;
  
  // Categories
  addCategory: (category: Omit<EventCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<EventCategory>) => void;
  deleteCategory: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<CalendarSettings>) => void;
  
  // Utility functions
  getEventsForDateRange: (start: Date, end: Date) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

const defaultCategories: EventCategory[] = [
  { id: '1', name: 'Reunión de trabajo', color: '#3174ad', description: 'Reuniones profesionales y de trabajo' },
  { id: '2', name: 'Llamada con cliente', color: '#28a745', description: 'Llamadas y reuniones con clientes' },
  { id: '3', name: 'Seguimiento', color: '#ffc107', description: 'Seguimientos y revisiones' },
  { id: '4', name: 'Presentación', color: '#dc3545', description: 'Presentaciones y demos' },
  { id: '5', name: 'Personal', color: '#6f42c1', description: 'Eventos personales' },
];

const defaultSettings: CalendarSettings = {
  defaultView: 'month',
  workingHours: {
    start: '09:00',
    end: '18:00',
  },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  defaultReminders: [
    { id: '1', method: 'popup', minutes: 15, enabled: true },
    { id: '2', method: 'email', minutes: 60, enabled: true },
  ],
  autoCreateMeetLinks: true,
  syncWithGoogle: false,
  notificationsEnabled: true,
};

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>(defaultCategories);
  const [settings, setSettings] = useState<CalendarSettings>(defaultSettings);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    const savedCategories = localStorage.getItem('calendar-categories');
    const savedSettings = localStorage.getItem('calendar-settings');

    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        const processedEvents = parsed.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        setEvents(processedEvents);
      } catch (error) {
        console.error('Error parsing saved events:', error);
      }
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error parsing saved categories:', error);
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }

    // Check Google connection status
    setIsGoogleConnected(googleAuthService.isAuthenticated());
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('calendar-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('calendar-settings', JSON.stringify(settings));
  }, [settings]);

  const addEvent = async (eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    setIsLoading(true);
    setError(null);

    try {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventData.title || 'Untitled Event',
        description: eventData.description || '',
        start: eventData.start || new Date(),
        end: eventData.end || new Date(Date.now() + 60 * 60 * 1000), // 1 hour default
        location: eventData.location || '',
        meetLink: eventData.meetLink || '',
        attendees: eventData.attendees || [],
        category: eventData.category || categories[0],
        color: eventData.color || eventData.category?.color || '#3174ad',
        reminders: eventData.reminders || settings.defaultReminders,
        isRecurring: eventData.isRecurring || false,
        recurrenceRule: eventData.recurrenceRule || '',
        createdBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: eventData.status || 'confirmed',
        visibility: eventData.visibility || 'public',
      };

      // Create Meet link if enabled and not provided
      if (settings.autoCreateMeetLinks && !newEvent.meetLink && isGoogleConnected) {
        try {
          const meetLink = await googleCalendarService.createMeetLink(newEvent);
          newEvent.meetLink = meetLink;
        } catch (error) {
          console.warn('Failed to create Meet link:', error);
        }
      }

      // Sync with Google Calendar if connected
      if (isGoogleConnected && settings.syncWithGoogle) {
        try {
          const googleEvent = await googleCalendarService.createEvent(newEvent);
          newEvent.googleEventId = googleEvent.googleEventId;
        } catch (error) {
          console.warn('Failed to sync with Google Calendar:', error);
        }
      }

      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    setIsLoading(true);
    setError(null);

    try {
      const existingEvent = events.find(e => e.id === id);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      const updatedEvent: CalendarEvent = {
        ...existingEvent,
        ...updates,
        updatedAt: new Date(),
      };

      // Sync with Google Calendar if connected
      if (isGoogleConnected && settings.syncWithGoogle && existingEvent.googleEventId) {
        try {
          await googleCalendarService.updateEvent(existingEvent.googleEventId, updatedEvent);
        } catch (error) {
          console.warn('Failed to sync update with Google Calendar:', error);
        }
      }

      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
      return updatedEvent;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const existingEvent = events.find(e => e.id === id);
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Sync with Google Calendar if connected
      if (isGoogleConnected && settings.syncWithGoogle && existingEvent.googleEventId) {
        try {
          await googleCalendarService.deleteEvent(existingEvent.googleEventId);
        } catch (error) {
          console.warn('Failed to sync deletion with Google Calendar:', error);
        }
      }

      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete event');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getEvent = (id: string): CalendarEvent | undefined => {
    return events.find(e => e.id === id);
  };

  const connectToGoogle = (): void => {
    const authUrl = googleAuthService.getAuthUrl();
    window.location.href = authUrl;
  };

  const disconnectFromGoogle = (): void => {
    googleAuthService.logout();
    setIsGoogleConnected(false);
    setSettings(prev => ({ ...prev, syncWithGoogle: false }));
  };

  const syncWithGoogle = async (): Promise<void> => {
    if (!isGoogleConnected) {
      throw new Error('Not connected to Google');
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      const googleEvents = await googleCalendarService.getEvents('primary', oneMonthAgo, oneMonthFromNow);
      
      // Merge Google events with local events
      const mergedEvents = [...events];
      
      googleEvents.forEach(googleEvent => {
        const existingIndex = mergedEvents.findIndex(e => e.googleEventId === googleEvent.googleEventId);
        if (existingIndex >= 0) {
          // Update existing event
          mergedEvents[existingIndex] = {
            ...mergedEvents[existingIndex],
            ...googleEvent,
            updatedAt: new Date(),
          };
        } else {
          // Add new event from Google
          mergedEvents.push({
            ...googleEvent,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          });
        }
      });

      setEvents(mergedEvents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sync with Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = (categoryData: Omit<EventCategory, 'id'>): void => {
    const newCategory: EventCategory = {
      ...categoryData,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<EventCategory>): void => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string): void => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateSettings = (newSettings: Partial<CalendarSettings>): void => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getEventsForDateRange = (start: Date, end: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (eventStart >= start && eventStart <= end) || 
             (eventEnd >= start && eventEnd <= end) ||
             (eventStart <= start && eventEnd >= end);
    });
  };

  const getUpcomingEvents = (limit: number = 5): CalendarEvent[] => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, limit);
  };

  return (
    <CalendarContext.Provider value={{
      events,
      categories,
      settings,
      isGoogleConnected,
      isLoading,
      error,
      addEvent,
      updateEvent,
      deleteEvent,
      getEvent,
      connectToGoogle,
      disconnectFromGoogle,
      syncWithGoogle,
      addCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
      getEventsForDateRange,
      getUpcomingEvents,
    }}>
      {children}
    </CalendarContext.Provider>
  );
};