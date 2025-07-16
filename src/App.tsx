// src/App.tsx

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { CRMProvider } from './context/CRMContext';
import { CalendarProvider } from './context/CalendarContext';
import { ProjectProvider } from './context/ProjectContext';
import { FinanceProvider } from './context/FinanceContext';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import AppContent from './components/AppContent';
import ProspectForm from './components/Prospects/ProspectForm';

function App() {
  // Estado que controla si el modal de agregar prospecto está abierto
  const [showProspectForm, setShowProspectForm] = useState(false);

  // Abre el form
  const openForm = () => setShowProspectForm(true);
  // Cierra el form
  const closeForm = () => setShowProspectForm(false);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <UserProvider>
          <CRMProvider>
            <CalendarProvider>
              <ProjectProvider>
                <FinanceProvider>
                  {/* Tu layout principal (sidebar, header, vistas) */}
                  <AppContent />

                  {/* Botón flotante para abrir “Nuevo Prospecto” */}
                  <button
                    onClick={openForm}
                    className="
                      fixed bottom-6 right-6
                      bg-green-600 hover:bg-green-700
                      text-white px-4 py-2 rounded-full
                      shadow-lg z-50
                    "
                  >
                    + Nuevo Prospecto
                  </button>

                  {/* Renderiza ProspectForm solo si showProspectForm es true */}
                  {showProspectForm && (
                    <ProspectForm
                      onClose={closeForm}
                      onSuccess={() => {
                        // Aquí podrías refrescar tu lista de prospectos si quieres
                        console.log('Prospecto creado');
                        closeForm();
                      }}
                    />
                  )}
                </FinanceProvider>
              </ProjectProvider>
            </CalendarProvider>
          </CRMProvider>
        </UserProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
