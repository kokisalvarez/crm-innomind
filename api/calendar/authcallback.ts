// project/api/calendar/auth/callback.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { googleAuthService } from '../../lib/googleAuth';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    await exchangeCodeAndStore(code);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
