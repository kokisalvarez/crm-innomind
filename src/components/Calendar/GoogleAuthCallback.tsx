import React, { useEffect, useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { googleAuthService } from '../../services/googleAuth';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const GoogleAuthCallback: React.FC = () => {
  const { syncWithGoogle } = useCalendar();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Exchange code for tokens
        await googleAuthService.exchangeCodeForTokens(code);
        
        // Sync with Google Calendar
        await syncWithGoogle();

        setStatus('success');
        setMessage('¡Conexión exitosa! Tu calendario se ha sincronizado con Google Calendar.');

        // Redirect to calendar after 3 seconds
        setTimeout(() => {
          window.location.href = '/calendar';
        }, 3000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Error durante la autenticación');
      }
    };

    handleAuthCallback();
  }, [syncWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Conectando con Google Calendar
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras procesamos tu autenticación...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Conexión Exitosa!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Serás redirigido al calendario en unos segundos...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error de Conexión
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => window.location.href = '/calendar'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al Calendario
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;