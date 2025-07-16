// project/api/calendar/auth/logout.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteStoredTokens } from '../../lib/googleAuth';
export default async function handler(_: VercelRequest, res: VercelResponse) {
  await deleteStoredTokens();
  res.status(200).json({ success: true });
}
