// src/main.tsx

import React, { StrictMode } from 'react'
import { createRoot }      from 'react-dom/client'
import { BrowserRouter }   from 'react-router-dom'

import App from './App'
import './index.css'

// Trae estos dos providers:
import { AuthProvider }  from './context/AuthContext'
import { UserProvider }  from './context/UserContext'
import { CRMProvider }   from './context/CRMContext'
import { FinanceProvider } from './context/FinanceContext'
import { CalendarProvider } from './context/CalendarContext'
import { ProjectProvider }  from './context/ProjectContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 1º AuthProvider */}
      <AuthProvider>
        {/* 2º UserProvider (usa useAuth internamente) */}
        <UserProvider>
          {/* luego el resto de providers existentes */}
          <CRMProvider>
            <CalendarProvider>
              <ProjectProvider>
                <FinanceProvider>
                  <App />
                </FinanceProvider>
              </ProjectProvider>
            </CalendarProvider>
          </CRMProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
