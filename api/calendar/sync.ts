// project/api/calendar/sync.ts
import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Misma ruta: calendar → api, luego services
import { getStoredTokens, syncEventsToFirestore } from '../services/googleAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Only POST allowed');
  }

  try {
    const tokens = await getStoredTokens();
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    const oAuth2 = new google.auth.OAuth2();
    oAuth2.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oAuth2 });
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneMonthAhead = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: oneMonthAgo.toISOString(),
      timeMax: oneMonthAhead.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = data.items || [];
    await syncEventsToFirestore(events);

    res.status(200).json({ synced: true, events });
  } catch (err: any) {
    console.error('Error syncing events:', err);
    res.status(500).json({ error: err.message });
  }
}
