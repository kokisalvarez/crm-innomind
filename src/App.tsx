import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { CRMProvider } from './context/CRMContext';
import { CalendarProvider } from './context/CalendarContext';
import { ProjectProvider } from './context/ProjectContext';
import { FinanceProvider } from './context/FinanceContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AppContent from './components/AppContent';
import UserManagement from './components/Users/UserManagement';


export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <UserProvider>
          <CRMProvider>
            <CalendarProvider>
              <ProjectProvider>
                <FinanceProvider>
                  <AppContent />
                </FinanceProvider>
              </ProjectProvider>
            </CalendarProvider>
          </CRMProvider>
        </UserProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}