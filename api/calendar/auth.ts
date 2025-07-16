// project/api/calendar/auth.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUrl } from '../../lib/googleAuth';  // ← import correcto

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Redirige al usuario a la pantalla de consentimiento de Google
  const url = getAuthUrl();
  res.redirect(url);
}
