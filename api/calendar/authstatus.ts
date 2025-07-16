// project/api/calendar/auth/status.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getStoredTokens } from '../services/googleAuth.js';

export default async function handler(_: VercelRequest, res: VercelResponse) {
  const tokens = await getStoredTokens();
  res.status(200).json({ connected: !!tokens });
}
