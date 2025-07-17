// api/debug-env.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.status(200).json({
    projectId: process.env.FIRESTORE_PROJECT_ID,
    clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
    hasKey: Boolean(process.env.FIRESTORE_PRIVATE_KEY),
  });
}
