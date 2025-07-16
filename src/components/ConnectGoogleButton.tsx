// src/components/ConnectGoogleButton.tsx
import { useState } from 'react';

export function ConnectGoogleButton() {
  const [loading, setLoading] = useState(false);

  const onConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/auth/url');
      const { url } = await res.json();
      // Rediriges al usuario al consent screen de Google
      window.location.href = url;
    } catch (err) {
      console.error('Error al pedir URL de Google:', err);
      setLoading(false);
    }
  };

  return (
    <button onClick={onConnect} disabled={loading}>
      {loading ? 'Cargando…' : 'Conectar con Google'}
    </button>
  );
}
