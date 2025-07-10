import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import Sidebar from './Layout/Sidebar';
import Header from './Layout/Header';
import Dashboard from './Dashboard/Dashboard';
import ProspectTable from './Prospects/ProspectTable';
import ProspectDetail from './Prospects/ProspectDetail';
import KanbanBoard from './Kanban/KanbanBoard';
import WebhookTester from './Webhook/WebhookTester';
import Settings from './Settings/Settings';
import QuoteManager from './Quotes/QuoteManager';
import ProductCatalog from './Quotes/ProductCatalog';
import QuoteTemplates from './Quotes/QuoteTemplates';
import CalendarView from './Calendar/CalendarView';
import GoogleAuthCallback from './Calendar/GoogleAuthCallback';
import ProjectDashboard from './Projects/ProjectDashboard';
import ProjectDetail from './Projects/ProjectDetail';
import FinanceModule from './Finance/FinanceModule';
import UserManagement from './Users/UserManagement';
import { Project } from '../types/projects';

interface NavigationParams {
  prospectId?: string;
  quoteId?: string;
  showDetail?: boolean;
  tab?: string;
}

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeQuoteTab, setActiveQuoteTab] = useState('quotes');
  const [navigationParams, setNavigationParams] = useState<NavigationParams>({});
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { selectedProspect, selectProspect, prospects, quotes } = useCRM();

  // Google OAuth callback
  if (window.location.pathname === '/auth/google/callback') {
    return <GoogleAuthCallback />;
  }

  const handleNavigation = (view: string, params?: NavigationParams) => {
    setActiveView(view);
    // reset quote tab if leaving quotes
    if (view !== 'quotes') setActiveQuoteTab('quotes');
    setNavigationParams(params || {});

    // prospect detail
    if (params?.prospectId && params.showDetail) {
      const p = prospects.find(x => x.id === params.prospectId);
      if (p) selectProspect(p);
    }

    // quote detail
    if (params?.quoteId && params.showDetail) {
      const all = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];
      const q = all.find(x => x.id === params.quoteId);
      if (q) setNavigationParams({ ...params, quote: q });
    }
  };

  const getViewTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      prospects: 'Gestión de Prospectos',
      kanban: 'Embudo de Ventas',
      quotes: 'Gestión de Cotizaciones',
      projects: 'Gestión de Proyectos',
      finance: 'Módulo de Finanzas',
      calendar: 'Calendario',
      users: 'Gestión de Usuarios',
      webhook: 'Webhook Test',
      settings: 'Configuración'
    };
    return titles[activeView] || 'CRM';
  };

  const renderQuotes = () => {
    const tabs = [
      { id: 'quotes', label: 'Cotizaciones', component: QuoteManager },
      { id: 'catalog', label: 'Catálogo', component: ProductCatalog },
      { id: 'templates', label: 'Plantillas', component: QuoteTemplates }
    ];
    const Active = tabs.find(t => t.id === activeQuoteTab)?.component || QuoteManager;
    return (
      <div className="space-y-6">
        <div className="border-b">
          <nav className="flex space-x-4">
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
          </nav>
        </div>
        <Active navigationParams={navigationParams} />
      </div>
    );
  };

  const renderContent = () => {
    if (selectedProject) {
      return (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={() => console.log('Edit project', selectedProject.id)}
        />
      );
    }

    if (selectedProspect && (activeView === 'prospects' || activeView === 'kanban')) {
      return <ProspectDetail />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'prospects':
        return <ProspectTable navigationParams={navigationParams} />;
      case 'kanban':
        return <KanbanBoard />;
      case 'quotes':
        return renderQuotes();
      case 'projects':
        return (
          <ProjectDashboard
            onProjectSelect={setSelectedProject}
            onNewProject={() => console.log('New project')}
            onNewClient={() => console.log('New client')}
          />
        );
      case 'finance':
        return <FinanceModule />;
      case 'calendar':
        return <CalendarView />;
      case 'users':
        return <UserManagement />;
      case 'webhook':
        return <WebhookTester />;
      case 'settings':
        return <Settings navigationParams={navigationParams} />;
      default:
        return <Dashboard onNavigate={handleNavigation} />;
    }
  };

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
  );
};

export default AppContent;