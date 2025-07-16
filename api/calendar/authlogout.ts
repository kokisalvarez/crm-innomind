// project/api/calendar/auth/logout.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteStoredTokens } from '../services/googleAuth.js';

export default async function handler(_: VercelRequest, res: VercelResponse) {
  await deleteStoredTokens();
  res.status(200).json({ success: true });
}
