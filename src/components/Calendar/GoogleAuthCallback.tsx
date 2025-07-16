// src/components/Calendar/GoogleAuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const GoogleAuthCallback: React.FC = () => {
  const { syncWithGoogle } = useCalendar();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication error: ${error}`);
        return;
      }
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        // Exchange code & sync via your API
        await fetch('/api/calendar/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        await syncWithGoogle();

        setStatus('success');
        setMessage('¡Conexión exitosa! Tu calendario se ha sincronizado.');

        setTimeout(() => {
          window.location.href = '/calendar';
        }, 3000);
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setMessage(err.message || 'Error durante la autenticación');
      }
    };

    handleCallback();
  }, [syncWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow border p-8">
        {status === 'loading' && (
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4 h-12 w-12" />
            <h2 className="text-xl font-semibold mb-2">Conectando con Google...</h2>
            <p className="text-gray-600">Procesando autenticación...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="text-green-600 mx-auto mb-4 h-12 w-12" />
            <h2 className="text-xl font-semibold mb-2">¡Conexión Exitosa!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirigiendo al calendario…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="text-red-600 mx-auto mb-4 h-12 w-12" />
            <h2 className="text-xl font-semibold mb-2">Error de Conexión</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => (window.location.href = '/calendar')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Volver al Calendario
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
