// project/api/webhook.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prospectService } from './services/prospectService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Only POST allowed');
  }

  const { firstName, lastName, phone, email, service, source } = req.body as any;

  try {
    const prospect = await prospectService.createProspect({
      nombre:      `${firstName} ${lastName}`,
      telefono:    phone,
      correo:      email,
      servicio:    service,     // ahora sí está en tu tipo
      origen:      source,      // y este también
      estado:      'Nuevo',
      plataforma:  'WhatsApp',
      responsable: 'sistema'
    });

    return res.status(200).json({ success: true, prospect });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
