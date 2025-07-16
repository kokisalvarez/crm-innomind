// src/hooks/useCreateProspect.ts
import axios from 'axios';

export interface ProspectInput {
  nombre: string;
  telefono: string;
  correo: string;
  plataforma: string;
  servicio_interes: string;
  fecha_contacto: string; // ISO string
}

export function useCreateProspect() {
  const secret = import.meta.env.VITE_WEBHOOK_SECRET;

  return async function createProspect(data: ProspectInput) {
    const response = await axios.post('/api/webhook', data, {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.prospect as any;
  };
}
