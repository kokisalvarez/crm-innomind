import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut, UserCircle, Mail, Phone, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  onNavigate?: (view: string, params?: any) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'prospect' | 'quote' | 'followup' | 'system';
  relatedId?: string;
  relatedData?: any;
}

interface SearchResult {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  plataforma: string;
  servicioInteres: string;
  estado: string;
}

const Header: React.FC<HeaderProps> = ({ title, onNavigate }) => {
  const { prospects } = useCRM();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nuevo prospecto',
      message: 'Carlos García se registró desde WhatsApp',
      time: 'Hace 5 minutos',
      unread: true,
      type: 'prospect',
      relatedId: '1',
      relatedData: { prospectId: '1', name: 'Carlos García' }
    },
    {
      id: '2',
      title: 'Cotización vencida',
      message: 'La cotización COT-2024-003 ha vencido',
      time: 'Hace 2 horas',
      unread: true,
      type: 'quote',
      relatedId: '1',
      relatedData: { quoteId: '1', quoteNumber: 'COT-2024-003' }
    },
    {
      id: '3',
      title: 'Seguimiento pendiente',
      message: 'María Rodríguez necesita seguimiento',
      time: 'Hace 1 día',
      unread: false,
      type: 'followup',
      relatedId: '2',
      relatedData: { prospectId: '2', name: 'María Rodríguez' }
    },
    {
      id: '4',
      title: 'Nueva cotización creada',
      message: 'Se creó la cotización COT-2024-004 para Laura González',
      time: 'Hace 3 horas',
      unread: true,
      type: 'quote',
      relatedId: '2',
      relatedData: { quoteId: '2', quoteNumber: 'COT-2024-004', prospectId: '4' }
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        setSearchError(null);
        return;
      }

      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Filter prospects based on search term
        const filteredProspects = prospects.filter(prospect => {
          const searchLower = searchTerm.toLowerCase();
          return (
            prospect.nombre.toLowerCase().includes(searchLower) ||
            prospect.correo.toLowerCase().includes(searchLower) ||
            prospect.telefono.includes(searchTerm) ||
            prospect.id.toLowerCase().includes(searchLower) ||
            prospect.servicioInteres.toLowerCase().includes(searchLower)
          );
        });

        // Limit to 10 results
        const limitedResults = filteredProspects.slice(0, 10).map(prospect => ({
          id: prospect.id,
          nombre: prospect.nombre,
          telefono: prospect.telefono,
          correo: prospect.correo,
          plataforma: prospect.plataforma,
          servicioInteres: prospect.servicioInteres,
          estado: prospect.estado
        }));

        setSearchResults(limitedResults);
        setShowSearchResults(true);
      } catch (error) {
        setSearchError('Error al buscar prospectos. Intenta nuevamente.');
        setSearchResults([]);
        setShowSearchResults(true);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, prospects]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchTerm('');
    setShowSearchResults(false);
    setSearchResults([]);
    
    if (onNavigate) {
      onNavigate('prospects', {
        prospectId: result.id,
        showDetail: true
      });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchError(null);
    searchInputRef.current?.focus();
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    setShowSearchResults(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
    setShowSearchResults(false);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowNotifications(false);
      setShowUserMenu(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNotificationItemClick = (notification: Notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );

    // Close notifications panel
    setShowNotifications(false);

    // Navigate based on notification type
    if (onNavigate) {
      switch (notification.type) {
        case 'prospect':
          // Navigate to prospects module and show specific prospect detail
          onNavigate('prospects', { 
            prospectId: notification.relatedId,
            showDetail: true 
          });
          break;
        
        case 'quote':
          // Navigate to quotes module and show specific quote detail
          onNavigate('quotes', { 
            quoteId: notification.relatedId,
            showDetail: true,
            prospectId: notification.relatedData?.prospectId 
          });
          break;
        
        case 'followup':
          // Navigate to prospects module and show specific prospect for follow-up
          onNavigate('prospects', { 
            prospectId: notification.relatedId,
            showDetail: true,
            highlightFollowup: true 
          });
          break;
        
        case 'system':
          // Navigate to settings or dashboard based on system notification
          onNavigate('dashboard');
          break;
        
        default:
          onNavigate('dashboard');
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, unread: false }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'prospect':
        return '👤';
      case 'quote':
        return '📄';
      case 'followup':
        return '⏰';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis = {
      'WhatsApp': '💬',
      'Instagram': '📷',
      'Facebook': '📘'
    };
    return emojis[platform as keyof typeof emojis] || '📱';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Nuevo': 'text-blue-600',
      'Contactado': 'text-yellow-600',
      'En seguimiento': 'text-orange-600',
      'Cotizado': 'text-purple-600',
      'Venta cerrada': 'text-green-600',
      'Perdido': 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-40">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative" ref={searchContainerRef}>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar prospectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                  {searchError ? (
                    <div className="px-4 py-3 text-center">
                      <div className="text-red-600 text-sm mb-2">⚠️ {searchError}</div>
                      <button
                        onClick={() => setSearchTerm(searchTerm)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : searchResults.length === 0 && searchTerm.length >= 2 ? (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                      <div className="mb-2">🔍</div>
                      <div>No se encontraron prospectos</div>
                      <div className="text-xs mt-1">Intenta con otros términos de búsqueda</div>
                    </div>
                  ) : searchTerm.length < 2 && searchTerm.length > 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                      <div className="mb-2">⌨️</div>
                      <div>Escribe al menos 2 caracteres para buscar</div>
                    </div>
                  ) : (
                    <>
                      {searchResults.length > 0 && (
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-xs text-gray-500">
                            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                            {searchResults.length === 10 && ' (máximo 10)'}
                          </div>
                        </div>
                      )}
                      
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleSearchResultClick(result)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-transparent hover:border-blue-400"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <span className="text-lg mr-2">
                                  {getPlatformEmoji(result.plataforma)}
                                </span>
                                <div className="font-medium text-gray-900 text-sm">
                                  {highlightSearchTerm(result.nombre, searchTerm)}
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-1">
                                📧 {highlightSearchTerm(result.correo, searchTerm)}
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-1">
                                📞 {highlightSearchTerm(result.telefono, searchTerm)}
                              </div>
                              
                              <div className="text-xs text-gray-500 truncate">
                                {highlightSearchTerm(result.servicioInteres, searchTerm)}
                              </div>
                            </div>
                            
                            <div className="ml-3 text-right">
                              <div className={`text-xs font-medium ${getStatusColor(result.estado)}`}>
                                {result.estado}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {result.id}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {searchResults.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 text-center">
                          <button
                            onClick={() => {
                              setShowSearchResults(false);
                              onNavigate && onNavigate('prospects');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Ver todos los prospectos →
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => handleNotificationItemClick(notification)}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                          notification.unread 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="text-lg mr-2">
                                {getNotificationIcon(notification.type)}
                              </span>
                              <p className={`text-sm font-medium ${
                                notification.unread ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button 
                      onClick={() => onNavigate && onNavigate('dashboard')}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={handleUserMenuClick}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user ? getUserInitials(user.name) : 'U'}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Usuario'}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      Rol: {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate && onNavigate('settings', { tab: 'users' });
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserCircle className="h-4 w-4 mr-3" />
                      Mi Perfil
                    </button>
                    
                    {/* Show Users menu only for admins */}
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate && onNavigate('users');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Gestión de Usuarios
                      </button>
                    )}
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate && onNavigate('settings');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Configuración
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <Mail className="h-4 w-4 mr-3" />
                      Soporte
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for closing dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-30"
          onClick={handleClickOutside}
        ></div>
      )}
    </>
  );
};

export default Header;