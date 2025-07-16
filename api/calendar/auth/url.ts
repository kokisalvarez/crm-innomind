// project/api/calendar/auth/url.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUrl } from '../../../lib/googleAuth';
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Only GET allowed');
  }

  const url = getAuthUrl();
  return res.status(200).json({ url });
}
