// src/components/Layout/Sidebar.tsx

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  FolderOpen,
  DollarSign,
  Calendar,
  Settings,
  Webhook,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/Innomind logo.png';   // ← importa tu logo

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Panel',        icon: LayoutDashboard },
    { id: 'prospects', label: 'Prospectos',   icon: Users },
    { id: 'kanban',    label: 'Embudo',       icon: Target },
    { id: 'quotes',    label: 'Cotizaciones', icon: FileText },
    { id: 'projects',  label: 'Proyectos',    icon: FolderOpen },
    { id: 'finance',   label: 'Finanzas',     icon: DollarSign },
    { id: 'calendar',  label: 'Calendario',   icon: Calendar },
    ...(isAdmin ? [{ id: 'users', label: 'Usuarios', icon: UserCog }] : []),
    { id: 'webhook',   label: 'Webhook',      icon: Webhook },
    { id: 'settings',  label: 'Configuración',icon: Settings }
  ];

  return (
    <div className="bg-white w-64 shadow-sm border-r border-gray-200 flex flex-col">
      {/* cabecera con logo y nombre */}
      <div className="flex items-center p-6">
        <img src={logo} alt="Innomind CRM" className="h-14 w-auto mr-3" />
        <h1 className="text-xl font-kollektiv text-blue-900">
          Innomind CRM
        </h1>
      </div>

      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
