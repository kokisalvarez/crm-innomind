// project/api/calendar/auth/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStoredTokens } from '../../../lib/googleAuth';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Only GET allowed');
  }

  try {
    const tokens = await getStoredTokens();
    res.status(200).json({ connected: Boolean(tokens) });
  } catch (err: any) {
    console.error('Status error:', err);
    res.status(500).json({ error: err.message });
  }
}
