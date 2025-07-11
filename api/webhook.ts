// api/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prospectService } from '../src/services/prospectService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health-check para GET
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Webhook endpoint is alive' });
  }

  // Solo permitimos POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1) Valida tu token secreto
  const authHeader = req.headers['authorization'];
  const secret     = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error('WEBHOOK_SECRET no está definido');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  if (authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2) Extrae y valida el body
  const {
    nombre,
    telefono,
    correo,
    plataforma,
    servicio_interes,
    fecha_contacto
  } = req.body;

  if (!nombre || !telefono || !correo) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let fechaContacto: Date;
  try {
    fechaContacto = fecha_contacto
      ? new Date(fecha_contacto)
      : new Date();
  } catch {
    return res.status(400).json({ error: 'Invalid fecha_contacto format' });
  }

  try {
    // 3) Crea el prospecto
    const newProspect = await prospectService.createProspect({
      nombre,
      telefono,
      correo,
      plataforma,
      servicioInteres: servicio_interes,
      fechaContacto,
      estado: 'Nuevo',
      responsable: '1',
      notasInternas: `Entró vía webhook (${plataforma})`
    });

    return res.status(201).json({ success: true, prospect: newProspect });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return res.status(500).json({ success: false, message: e.message });
  }
}
