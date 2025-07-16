// src/pages/CalendarPage.tsx
import { useState, useEffect } from 'react';
import { ConnectGoogleButton } from '../components/ConnectGoogleButton';
import { CalendarListEvents } from '../components/CalendarListEvents';

export function CalendarPage() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Consulta si ya hay tokens guardados
    fetch('/api/calendar/auth/status')
      .then(res => res.json())
      .then(data => setConnected(data.connected))
      .catch(() => setConnected(false));
  }, []);

  if (connected === null) {
    return <p>Verificando conexión con Google…</p>;
  }

  if (!connected) {
    // Si NO está conectado aparece el botón
    return <ConnectGoogleButton />;
  }

  // Si YA está conectado, muestra los eventos
  return <CalendarListEvents />;
}
