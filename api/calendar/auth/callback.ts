// project/api/calendar/auth/callback.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exchangeCodeAndStore } from '../../../lib/googleAuth';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error) {
    return res.status(400).send(`OAuth Error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('No se recibió el code de Google');
  }

  try {
    await exchangeCodeAndStore(code);
    return res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; margin-top: 3rem;">
          <h2>✅ Autenticación completada</h2>
          <p>Haz clic para <a href="http://localhost:5173">volver a la app</a></p>
        </body>
      </html>
    `);
  } catch (e) {
    console.error('Error en callback:', e);
    return res.status(500).send('Error al intercambiar el código con Google');
  }
}
