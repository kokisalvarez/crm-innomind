import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Code, Copy } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { WebhookData, Platform } from '../../types';

const WebhookTester: React.FC = () => {
  const { processWebhook } = useCRM();
  const [formData, setFormData] = useState<WebhookData>({
    nombre: '',
    telefono: '',
    correo: '',
    plataforma: 'WhatsApp',
    servicio_interes: '',
    fecha_contacto: new Date().toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      // Simulate webhook processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      processWebhook(formData);
      
      setResult({
        success: true,
        message: 'Prospecto agregado exitosamente al CRM'
      });
      
      // Reset form
      setFormData({
        nombre: '',
        telefono: '',
        correo: '',
        plataforma: 'WhatsApp',
        servicio_interes: '',
        fecha_contacto: new Date().toISOString()
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Error al procesar el webhook'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const webhookCode = `// Ejemplo de configuración para ManyChat
const webhookData = {
  "nombre": "{{user_full_name}}",
  "telefono": "{{user_phone}}",
  "correo": "{{user_email}}",
  "plataforma": "WhatsApp",
  "servicio_interes": "{{user_input}}",
  "fecha_contacto": "{{datetime}}"
};

// URL del Webhook
POST https://tu-dominio.com/api/webhook

// Headers requeridos
Content-Type: application/json
Authorization: Bearer tu-token-secreto`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookCode);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Probador de Webhook</h2>
        <p className="text-gray-600 mb-6">
          Simula datos que llegarían desde tu chatbot para probar la integración
        </p>

        {/* Toggle Code View */}
        <div className="mb-6">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Code className="h-4 w-4 mr-2" />
            {showCode ? 'Ocultar código' : 'Ver código de ejemplo'}
          </button>
        </div>

        {/* Code Example */}
        {showCode && (
          <div className="mb-6 bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm font-medium">Configuración para ManyChat/Webhook</span>
              <button
                onClick={copyToClipboard}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <pre className="text-green-400 text-sm overflow-x-auto">
              <code>{webhookCode}</code>
            </pre>
          </div>
        )}

        {/* Test Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: +521234567890"
              />
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: juan@example.com"
              />
            </div>

            <div>
              <label htmlFor="plataforma" className="block text-sm font-medium text-gray-700 mb-1">
                Plataforma *
              </label>
              <select
                id="plataforma"
                name="plataforma"
                value={formData.plataforma}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="servicio_interes" className="block text-sm font-medium text-gray-700 mb-1">
              Servicio de interés *
            </label>
            <textarea
              id="servicio_interes"
              name="servicio_interes"
              value={formData.servicio_interes}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Chatbot para WhatsApp, Automatización de ventas, etc."
            />
          </div>

          <div>
            <label htmlFor="fecha_contacto" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de contacto
            </label>
            <input
              type="datetime-local"
              id="fecha_contacto"
              name="fecha_contacto"
              value={formData.fecha_contacto.slice(0, 16)}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fecha_contacto: new Date(e.target.value).toISOString()
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Datos de Prueba
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg flex items-center ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={result.success ? 'text-green-800' : 'text-red-800'}>
              {result.message}
            </span>
          </div>
        )}
      </div>

      {/* Integration Instructions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones de Integración</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">1. Configuración en ManyChat</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Ve a la sección "Automations" en ManyChat</li>
              <li>• Crea un nuevo flujo o edita uno existente</li>
              <li>• Agrega una acción "External Request"</li>
              <li>• Configura la URL del webhook (proporcionada por tu desarrollador)</li>
              <li>• Usa el método POST y agrega los campos mostrados arriba</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">2. Variables de ManyChat</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="text-gray-700 mb-2">Usa estas variables en tu configuración:</p>
              <ul className="text-gray-600 space-y-1">
                <li><code className="bg-gray-200 px-1 rounded">{'{{user_full_name}}'}</code> - Nombre del usuario</li>
                <li><code className="bg-gray-200 px-1 rounded">{'{{user_phone}}'}</code> - Teléfono del usuario</li>
                <li><code className="bg-gray-200 px-1 rounded">{'{{user_email}}'}</code> - Email del usuario</li>
                <li><code className="bg-gray-200 px-1 rounded">{'{{user_input}}'}</code> - Respuesta del usuario</li>
                <li><code className="bg-gray-200 px-1 rounded">{'{{datetime}}'}</code> - Fecha y hora actual</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">3. Seguridad</h4>
            <p className="text-sm text-gray-600">
              Asegúrate de que tu webhook esté protegido con autenticación y validación de origen para evitar spam o datos maliciosos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookTester;