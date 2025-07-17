// api/firestore-test.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Firestore } from '@google-cloud/firestore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Inicializa el cliente con tus env-vars
  const firestore = new Firestore({
    projectId: process.env.FIRESTORE_PROJECT_ID,
    credentials: {
      client_email: process.env.FIRESTORE_CLIENT_EMAIL!,
      private_key: process.env.FIRESTORE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
  });

  try {
    // Intenta listar colecciones raíz
    const cols = await firestore.listCollections();
    const ids = cols.map(c => c.id);
    return res.status(200).json({ collections: ids });
  } catch (err: any) {
    console.error('Firestore test error:', err);
    return res.status(500).json({ error: err.message });
  }
}
