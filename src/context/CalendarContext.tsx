// src/context/CalendarContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import axios from 'axios';
import {
  CalendarEvent,
  CalendarSettings,
  EventCategory,
  EventReminder
} from '../types/calendar';

interface CalendarContextType {
  events: CalendarEvent[];
  categories: EventCategory[];
  settings: CalendarSettings;
  isGoogleConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Event management
  addEvent: (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<CalendarEvent>;
  updateEvent: (
    id: string,
    updates: Partial<CalendarEvent>
  ) => Promise<CalendarEvent>;
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

export const useCalendar = (): CalendarContextType => {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error('useCalendar must be used within CalendarProvider');
  }
  return ctx;
};

const defaultCategories: EventCategory[] = [
  { id: '1', name: 'Reunión de trabajo', color: '#3174ad', description: 'Reuniones profesionales' },
  { id: '2', name: 'Llamada con cliente', color: '#28a745', description: 'Llamadas con clientes' },
  { id: '3', name: 'Seguimiento', color: '#ffc107', description: 'Seguimientos' },
  { id: '4', name: 'Presentación', color: '#dc3545', description: 'Presentaciones' },
  { id: '5', name: 'Personal', color: '#6f42c1', description: 'Eventos personales' }
];

const defaultSettings: CalendarSettings = {
  defaultView: 'month',
  workingHours: { start: '09:00', end: '18:00' },
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  defaultReminders: [
    { id: '1', method: 'popup', minutes: 15, enabled: true },
    { id: '2', method: 'email', minutes: 60, enabled: true }
  ],
  autoCreateMeetLinks: false,
  syncWithGoogle: false,
  notificationsEnabled: true
};

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>(defaultCategories);
  const [settings, setSettings] = useState<CalendarSettings>(defaultSettings);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const sev = localStorage.getItem('calendar-events');
    if (sev) {
      try {
        const parsed = JSON.parse(sev) as any[];
        const loaded = parsed.map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt)
        }));
        setEvents(loaded);
      } catch {}
    }

    const sc = localStorage.getItem('calendar-categories');
    if (sc) {
      try { setCategories(JSON.parse(sc)); } catch {}
    }

    const ss = localStorage.getItem('calendar-settings');
    if (ss) {
      try { setSettings(JSON.parse(ss)); } catch {}
    }

    // Check Google auth status via API
    axios
      .get('/api/calendar/auth/status')
      .then(res => setIsGoogleConnected(res.data.connected))
      .catch(() => setIsGoogleConnected(false));
  }, []);

  // Persist changes
  useEffect(() => { localStorage.setItem('calendar-events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('calendar-categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('calendar-settings', JSON.stringify(settings)); }, [settings]);

  // Event methods
  const addEvent = async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true); setError(null);
    try {
      const evt: CalendarEvent = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setEvents(prev => [evt, ...prev]);
      return evt;
    } catch (err: any) {
      setError(err.message); throw err;
    } finally { setIsLoading(false); }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    setIsLoading(true); setError(null);
    try {
      let updated!: CalendarEvent;
      setEvents(prev => prev.map(e => {
        if (e.id === id) {
          updated = { ...e, ...updates, updatedAt: new Date() };
          return updated;
        }
        return e;
      }));
      return updated;
    } catch (err: any) {
      setError(err.message); throw err;
    } finally { setIsLoading(false); }
  };

  const deleteEvent = async (id: string) => {
    setIsLoading(true); setError(null);
    try {
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message); throw err;
    } finally { setIsLoading(false); }
  };

  const getEvent = (id: string) => events.find(e => e.id === id);

  // Google integration
  const connectToGoogle = () => {
    window.location.href = '/api/calendar/auth';
  };

  const disconnectFromGoogle = () => {
    axios.post('/api/calendar/auth/logout').catch(console.error);
    setIsGoogleConnected(false);
  };

  const syncWithGoogle = async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await axios.post('/api/calendar/sync');
      const googleEvents = (res.data.events || []) as any[];
      const mapped = googleEvents.map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt)
      }));
      setEvents(mapped);
    } catch (err: any) {
      setError(err.message); throw err;
    } finally { setIsLoading(false); }
  };

  // Category methods
  const addCategory = (data: Omit<EventCategory, 'id'>) => {
    const cat: EventCategory = { ...data, id: Date.now().toString() };
    setCategories(prev => [...prev, cat]);
  };

  const updateCategory = (id: string, updates: Partial<EventCategory>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Settings
  const updateSettings = (data: Partial<CalendarSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  // Utilities
  const getEventsForDateRange = (start: Date, end: Date) =>
    events.filter(e =>
      (e.start >= start && e.start <= end) ||
      (e.end >= start && e.end <= end) ||
      (e.start <= start && e.end >= end)
    );

  const getUpcomingEvents = (limit = 5) => {
    const now = new Date();
    return events
      .filter(e => e.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  };

  return (
    <CalendarContext.Provider
      value={{
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
        getUpcomingEvents
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
