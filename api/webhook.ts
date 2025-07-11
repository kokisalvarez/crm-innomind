// api/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Importa el objeto prospectService en vez de la función suelta
import { prospectService } from '../src/services/prospectService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('▶️ Webhook invoked:', req.method, req.url);

  // 1) Health‐check
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Webhook endpoint is alive' });
  }

  // 2) Solo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 3) Autorización
  const authHeader = req.headers.authorization;
  const secret     = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error('❌ WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  if (authHeader !== `Bearer ${secret}`) {
    console.warn('🚫 Unauthorized:', authHeader);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 4) Validar body
  const {
    nombre,
    telefono,
    correo,
    plataforma,
    servicio_interes,
    fecha_contacto
  } = req.body || {};

  if (!nombre || !telefono || !correo) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: nombre, telefono, correo' });
  }

  // 5) Parsear fecha de contacto
  let fechaContacto = new Date();
  if (fecha_contacto) {
    const ts = Date.parse(fecha_contacto);
    if (isNaN(ts)) {
      return res.status(400).json({ error: 'Invalid fecha_contacto format' });
    }
    fechaContacto = new Date(ts);
  }

  // 6) Crear prospecto usando el método del objeto
  try {
    const prospect = await prospectService.createProspect({
      nombre,
      telefono,
      correo,
      plataforma: plataforma ?? 'desconocido',
      servicioInteres: servicio_interes ?? '',
      fechaContacto,
      estado: 'Nuevo',
      responsable: '1',
      notasInternas: `Entró vía webhook (${plataforma ?? 'desconocido'})`
    });

    console.log('✅ Prospect created with ID:', prospect.id);
    return res.status(201).json({ success: true, prospect });
  } catch (err: any) {
    console.error('❌ Webhook processing error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
