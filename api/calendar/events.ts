// project/api/calendar/events.ts
import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Subimos de calendar → api, luego entramos a services
import { getStoredTokens } from '../services/googleAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Only GET allowed');
  }

  try {
    const tokens = await getStoredTokens();
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    const oAuth2 = new google.auth.OAuth2();
    oAuth2.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oAuth2 });
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.status(200).json({ events: data.items || [] });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: err.message });
  }
}
