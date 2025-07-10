// api/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prospectService } from '../src/services/prospectService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1) Valida tu token secreto
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2) Extrae el body que manda ManyChat
  const {
    nombre,
    telefono,
    correo,
    plataforma,
    servicio_interes,
    fecha_contacto
  } = req.body;

  try {
    // 3) Crea el prospecto
    const newProspect = await prospectService.createProspect({
      nombre,
      telefono,
      correo,
      plataforma,
      servicioInteres: servicio_interes,
      fechaContacto: new Date(fecha_contacto),
      estado: 'Nuevo',
      responsable: '1', // ID de tu Admin por defecto
      notasInternas: `Entró via webhook (${plataforma})`
    });

    return res.status(201).json({ success: true, prospect: newProspect });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return res.status(500).json({ success: false, message: e.message });
  }
}
