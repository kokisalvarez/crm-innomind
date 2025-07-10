// src/App.tsx

import React, { useState } from 'react'
import { CRMProvider, useCRM } from './context/CRMContext'
import { CalendarProvider } from './context/CalendarContext'
import { ProjectProvider } from './context/ProjectContext'
import { FinanceProvider } from './context/FinanceContext'

import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'

import Dashboard from './components/Dashboard/Dashboard'
import ProspectTable from './components/Prospects/ProspectTable'
import ProspectDetail from './components/Prospects/ProspectDetail'
import KanbanBoard from './components/Kanban/KanbanBoard'
import WebhookTester from './components/Webhook/WebhookTester'
import Settings from './components/Settings/Settings'
import QuoteManager from './components/Quotes/QuoteManager'
import ProductCatalog from './components/Quotes/ProductCatalog'
import QuoteTemplates from './components/Quotes/QuoteTemplates'
import CalendarView from './components/Calendar/CalendarView'
import GoogleAuthCallback from './components/Calendar/GoogleAuthCallback'
import ProjectDashboard from './components/Projects/ProjectDashboard'
import ProjectDetail from './components/Projects/ProjectDetail'
import { Project } from './types/projects'

// Ahora usamos el módulo completo de Finanzas
import FinanceModule from './components/Finance/FinanceModule';

interface NavigationParams {
  prospectId?: string
  quoteId?: string
  showDetail?: boolean
  tab?: string
}

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const [activeQuoteTab, setActiveQuoteTab] = useState('quotes')
  const [navigationParams, setNavigationParams] = useState<NavigationParams>({})
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { selectedProspect, selectProspect, prospects, quotes } = useCRM()

  // Google OAuth callback
  if (window.location.pathname === '/auth/google/callback') {
    return <GoogleAuthCallback />
  }

  const handleNavigation = (view: string, params?: NavigationParams) => {
    setActiveView(view)
    // reset quote tab if leaving quotes
    if (view !== 'quotes') setActiveQuoteTab('quotes')
    setNavigationParams(params || {})

    // prospect detail
    if (params?.prospectId && params.showDetail) {
      const p = prospects.find(x => x.id === params.prospectId)
      if (p) selectProspect(p)
    }

    // quote detail
    if (params?.quoteId && params.showDetail) {
      const all = [...quotes, ...prospects.flatMap(p => p.cotizaciones)]
      const q = all.find(x => x.id === params.quoteId)
      if (q) setNavigationParams({ ...params, quote: q })
    }
  }

  const getViewTitle = () => {
    const titles: Record<string,string> = {
      dashboard: 'Dashboard',
      prospects: 'Gestión de Prospectos',
      kanban: 'Embudo de Ventas',
      quotes: 'Gestión de Cotizaciones',
      projects: 'Gestión de Proyectos',
      finance: 'Módulo de Finanzas',    // agregado
      calendar: 'Calendario',
      webhook: 'Webhook Test',
      settings: 'Configuración'
    }
    return titles[activeView] || 'CRM'
  }

  const renderQuotes = () => {
    const tabs = [
      { id: 'quotes', label: 'Cotizaciones', component: QuoteManager },
      { id: 'catalog', label: 'Catálogo', component: ProductCatalog },
      { id: 'templates', label: 'Plantillas', component: QuoteTemplates }
    ]
    const Active = tabs.find(t => t.id === activeQuoteTab)?.component || QuoteManager
    return (
      <div className="space-y-6">
        <div className="border-b"><nav className="flex space-x-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveQuoteTab(t.id)}
              className={
                t.id === activeQuoteTab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            >
              {t.label}
            </button>
          ))}
        </nav></div>
        <Active navigationParams={navigationParams} />
      </div>
    )
  }

  const renderContent = () => {
    if (selectedProject) {
      return (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={() => console.log('Edit project', selectedProject.id)}
        />
      )
    }

    if (selectedProspect && (activeView === 'prospects' || activeView === 'kanban')) {
      return <ProspectDetail />
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} />
      case 'prospects':
        return <ProspectTable navigationParams={navigationParams} />
      case 'kanban':
        return <KanbanBoard />
      case 'quotes':
        return renderQuotes()
      case 'projects':
        return (
          <ProjectDashboard
            onProjectSelect={setSelectedProject}
            onNewProject={() => console.log('New project')}
            onNewClient={() => console.log('New client')}
          />
        )
      case 'finance':
        // renderiza el módulo completo de Finanzas
        return <FinanceModule />
      case 'calendar':
        return <CalendarView />
      case 'webhook':
        return <WebhookTester />
      case 'settings':
        return <Settings navigationParams={navigationParams} />
      default:
        return <Dashboard onNavigate={handleNavigation} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={handleNavigation} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getViewTitle()} onNavigate={handleNavigation} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <CRMProvider>
      <CalendarProvider>
        <ProjectProvider>
          <FinanceProvider>
            <AppContent />
          </FinanceProvider>
        </ProjectProvider>
      </CalendarProvider>
    </CRMProvider>
  )
}
