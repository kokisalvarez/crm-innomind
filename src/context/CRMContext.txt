import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prospect, Product, Quote, DashboardMetrics, WebhookData, QuoteTemplate, CompanySettings, QuoteItem, QuoteHistoryEntry } from '../types';
import { mockProspects, mockProducts, mockQuoteTemplates, mockCompanySettings } from '../data/mockData';
import { prospectService } from '../services/prospectService';

interface CRMContextType {
  prospects: Prospect[];
  products: Product[];
  quotes: Quote[];
  quoteTemplates: QuoteTemplate[];
  companySettings: CompanySettings;
  selectedProspect: Prospect | null;
  dashboardMetrics: DashboardMetrics;
  loading: boolean;
  
  // Prospect methods
  addProspect: (prospect: Omit<Prospect, 'id' | 'seguimientos' | 'cotizaciones'>) => Promise<void>;
  updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
  selectProspect: (prospect: Prospect | null) => void;
  addFollowUp: (prospectId: string, nota: string) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
  
  // User-prospect integration methods
  assignProspectToUser: (prospectId: string, userId: string) => Promise<void>;
  getProspectsByUser: (userId: string) => Prospect[];
  
  // Quote methods
  addQuote: (quote: Omit<Quote, 'id' | 'numero' | 'fechaCreacion' | 'fechaActualizacion' | 'historialCambios'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  generateQuoteNumber: () => string;
  calculateQuoteTotal: (items: QuoteItem[], descuentoGlobal: number, tipoDescuentoGlobal: 'porcentaje' | 'monto', iva: number) => { subtotal: number; total: number };
  
  // Product methods
  addProduct: (product: Omit<Product, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Template methods
  addQuoteTemplate: (template: Omit<QuoteTemplate, 'id' | 'fechaCreacion'>) => void;
  updateQuoteTemplate: (id: string, updates: Partial<QuoteTemplate>) => void;
  deleteQuoteTemplate: (id: string) => void;
  
  // Settings and webhook methods
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  processWebhook: (data: WebhookData) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

interface CRMProviderProps {
  children: ReactNode;
}

export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(mockCompanySettings);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage and prospectService on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load prospects from prospectService
      const allProspects = await prospectService.getAllProspects();
      setProspects(allProspects);

      // Load other data from localStorage
      loadProductsFromStorage();
      loadQuotesFromStorage();
      loadTemplatesFromStorage();
      loadSettingsFromStorage();
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsFromStorage = () => {
    const savedProducts = localStorage.getItem('crm-products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      if (Array.isArray(parsed)) {
        const processedProducts = parsed.map((p: any) => ({
          ...p,
          fechaCreacion: new Date(p.fechaCreacion),
          fechaActualizacion: new Date(p.fechaActualizacion)
        }));
        setProducts(processedProducts);
      } else {
        setProducts(mockProducts);
      }
    } else {
      setProducts(mockProducts);
    }
  };

  const loadQuotesFromStorage = () => {
    const savedQuotes = localStorage.getItem('crm-quotes');
    if (savedQuotes) {
      const parsed = JSON.parse(savedQuotes);
      if (Array.isArray(parsed)) {
        const processedQuotes = parsed.map((q: any) => ({
          ...q,
          fecha: new Date(q.fecha),
          vigencia: new Date(q.vigencia),
          fechaCreacion: new Date(q.fechaCreacion),
          fechaActualizacion: new Date(q.fechaActualizacion),
          historialCambios: Array.isArray(q.historialCambios) ? q.historialCambios.map((h: any) => ({
            ...h,
            fecha: new Date(h.fecha)
          })) : []
        }));
        setQuotes(processedQuotes);
      }
    }
  };

  const loadTemplatesFromStorage = () => {
    const savedTemplates = localStorage.getItem('crm-quote-templates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      if (Array.isArray(parsed)) {
        const processedTemplates = parsed.map((t: any) => ({
          ...t,
          fechaCreacion: new Date(t.fechaCreacion)
        }));
        setQuoteTemplates(processedTemplates);
      } else {
        setQuoteTemplates(mockQuoteTemplates);
      }
    } else {
      setQuoteTemplates(mockQuoteTemplates);
    }
  };

  const loadSettingsFromStorage = () => {
    const savedSettings = localStorage.getItem('crm-company-settings');
    if (savedSettings) {
      setCompanySettings(JSON.parse(savedSettings));
    }
  };

  // Save to localStorage whenever data changes (except prospects, handled by prospectService)
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('crm-products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (quotes.length > 0) {
      localStorage.setItem('crm-quotes', JSON.stringify(quotes));
    }
  }, [quotes]);

  useEffect(() => {
    if (quoteTemplates.length > 0) {
      localStorage.setItem('crm-quote-templates', JSON.stringify(quoteTemplates));
    }
  }, [quoteTemplates]);

  useEffect(() => {
    localStorage.setItem('crm-company-settings', JSON.stringify(companySettings));
  }, [companySettings]);

  // Prospect methods using prospectService
  const addProspect = async (prospectData: Omit<Prospect, 'id' | 'seguimientos' | 'cotizaciones'>) => {
    try {
      const newProspect = await prospectService.createProspect(prospectData);
      setProspects(prev => [newProspect, ...prev]);
    } catch (error) {
      console.error('Error creating prospect:', error);
      throw error;
    }
  };

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    try {
      const updatedProspect = await prospectService.updateProspect(id, updates);
      setProspects(prev => prev.map(prospect => 
        prospect.id === id ? updatedProspect : prospect
      ));
      
      if (selectedProspect?.id === id) {
        setSelectedProspect(updatedProspect);
      }
    } catch (error) {
      console.error('Error updating prospect:', error);
      throw error;
    }
  };

  const deleteProspect = async (id: string) => {
    try {
      await prospectService.deleteProspect(id);
      setProspects(prev => prev.filter(prospect => prospect.id !== id));
      if (selectedProspect?.id === id) {
        setSelectedProspect(null);
      }
    } catch (error) {
      console.error('Error deleting prospect:', error);
      throw error;
    }
  };

  const addFollowUp = async (prospectId: string, nota: string) => {
    try {
      const updatedProspect = await prospectService.addFollowUp(prospectId, nota);
      setProspects(prev => prev.map(prospect => 
        prospect.id === prospectId ? updatedProspect : prospect
      ));
      
      if (selectedProspect?.id === prospectId) {
        setSelectedProspect(updatedProspect);
      }
    } catch (error) {
      console.error('Error adding follow-up:', error);
      throw error;
    }
  };

  const assignProspectToUser = async (prospectId: string, userId: string) => {
    try {
      const updatedProspect = await prospectService.assignProspectToUser(prospectId, userId);
      setProspects(prev => prev.map(prospect => 
        prospect.id === prospectId ? updatedProspect : prospect
      ));
      
      if (selectedProspect?.id === prospectId) {
        setSelectedProspect(updatedProspect);
      }
    } catch (error) {
      console.error('Error assigning prospect:', error);
      throw error;
    }
  };

  const getProspectsByUser = (userId: string): Prospect[] => {
    return prospects.filter(prospect => prospect.responsable === userId);
  };

  const selectProspect = (prospect: Prospect | null) => {
    setSelectedProspect(prospect);
  };

  // Quote methods (keeping existing functionality)
  const generateQuoteNumber = (): string => {
    const year = new Date().getFullYear();
    const existingQuotes = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];
    const yearQuotes = existingQuotes.filter(q => q.numero.includes(year.toString()));
    const nextNumber = yearQuotes.length + 1;
    return `COT-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const calculateQuoteTotal = (
    items: QuoteItem[], 
    descuentoGlobal: number, 
    tipoDescuentoGlobal: 'porcentaje' | 'monto', 
    iva: number
  ) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    let descuentoAplicado = 0;
    if (tipoDescuentoGlobal === 'porcentaje') {
      descuentoAplicado = subtotal * (descuentoGlobal / 100);
    } else {
      descuentoAplicado = descuentoGlobal;
    }
    
    const subtotalConDescuento = subtotal - descuentoAplicado;
    const ivaAmount = subtotalConDescuento * (iva / 100);
    const total = subtotalConDescuento + ivaAmount;
    
    return { subtotal, total };
  };

  const addQuote = (quoteData: Omit<Quote, 'id' | 'numero' | 'fechaCreacion' | 'fechaActualizacion' | 'historialCambios'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: Date.now().toString(),
      numero: generateQuoteNumber(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      historialCambios: [{
        id: Date.now().toString(),
        fecha: new Date(),
        accion: 'Cotización creada',
        usuario: quoteData.creadoPor,
        detalles: 'Cotización creada inicialmente'
      }]
    };

    setQuotes(prev => [newQuote, ...prev]);

    // Also add to prospect's quotes
    setProspects(prev => prev.map(p => 
      p.id === quoteData.prospectId 
        ? { ...p, cotizaciones: [newQuote, ...p.cotizaciones] }
        : p
    ));

    if (selectedProspect?.id === quoteData.prospectId) {
      setSelectedProspect(prev => prev ? {
        ...prev,
        cotizaciones: [newQuote, ...prev.cotizaciones]
      } : null);
    }
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    const updatedQuote = {
      ...updates,
      fechaActualizacion: new Date()
    };

    setQuotes(prev => prev.map(q => 
      q.id === id ? { ...q, ...updatedQuote } : q
    ));

    // Update in prospects as well
    setProspects(prev => prev.map(p => ({
      ...p,
      cotizaciones: p.cotizaciones.map(c => 
        c.id === id ? { ...c, ...updatedQuote } : c
      )
    })));

    if (selectedProspect) {
      setSelectedProspect(prev => prev ? {
        ...prev,
        cotizaciones: prev.cotizaciones.map(c => 
          c.id === id ? { ...c, ...updatedQuote } : c
        )
      } : null);
    }
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    
    setProspects(prev => prev.map(p => ({
      ...p,
      cotizaciones: p.cotizaciones.filter(c => c.id !== id)
    })));

    if (selectedProspect) {
      setSelectedProspect(prev => prev ? {
        ...prev,
        cotizaciones: prev.cotizaciones.filter(c => c.id !== id)
      } : null);
    }
  };

  // Product methods (keeping existing functionality)
  const addProduct = (productData: Omit<Product, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, fechaActualizacion: new Date() } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Template methods (keeping existing functionality)
  const addQuoteTemplate = (templateData: Omit<QuoteTemplate, 'id' | 'fechaCreacion'>) => {
    const newTemplate: QuoteTemplate = {
      ...templateData,
      id: Date.now().toString(),
      fechaCreacion: new Date()
    };
    setQuoteTemplates(prev => [newTemplate, ...prev]);
  };

  const updateQuoteTemplate = (id: string, updates: Partial<QuoteTemplate>) => {
    setQuoteTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteQuoteTemplate = (id: string) => {
    setQuoteTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Settings and webhook methods (keeping existing functionality)
  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...settings }));
  };

  const processWebhook = (data: WebhookData) => {
    const newProspectData: Omit<Prospect, 'id' | 'seguimientos' | 'cotizaciones'> = {
      nombre: data.nombre,
      telefono: data.telefono,
      correo: data.correo || '',
      plataforma: data.plataforma,
      servicioInteres: data.servicio_interes,
      fechaContacto: new Date(data.fecha_contacto),
      estado: 'Nuevo',
      notasInternas: `Prospecto ingresado automáticamente desde ${data.plataforma}`,
      responsable: '1' // Default to admin user, can be changed later
    };
    
    addProspect(newProspectData);
  };

  // Calculate dashboard metrics
  const allQuotes = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];

  const dashboardMetrics: DashboardMetrics = {
    totalProspectos: prospects.length,
    prospectosPorPlataforma: prospects.reduce((acc, p) => {
      acc[p.plataforma] = (acc[p.plataforma] || 0) + 1;
      return acc;
    }, {} as Record<any, number>),
    prospectosPorEstado: prospects.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {} as Record<any, number>),
    cotizacionesGeneradas: allQuotes.length,
    ventasCerradas: prospects.filter(p => p.estado === 'Venta cerrada').length,
    tasaConversion: prospects.length > 0 
      ? (prospects.filter(p => p.estado === 'Venta cerrada').length / prospects.length) * 100 
      : 0,
    cotizacionesPorEstado: allQuotes.reduce((acc, q) => {
      acc[q.estado] = (acc[q.estado] || 0) + 1;
      return acc;
    }, {} as Record<Quote['estado'], number>),
    valorTotalCotizaciones: allQuotes.reduce((sum, q) => sum + q.total, 0),
    tasaAceptacion: allQuotes.length > 0 
      ? (allQuotes.filter(q => q.estado === 'Aceptada').length / allQuotes.length) * 100 
      : 0
  };

  return (
    <CRMContext.Provider value={{
      prospects,
      products,
      quotes,
      quoteTemplates,
      companySettings,
      selectedProspect,
      dashboardMetrics,
      loading,
      
      // Prospect methods
      addProspect,
      updateProspect,
      selectProspect,
      addFollowUp,
      deleteProspect,
      
      // User-prospect integration
      assignProspectToUser,
      getProspectsByUser,
      
      // Quote methods
      addQuote,
      updateQuote,
      deleteQuote,
      generateQuoteNumber,
      calculateQuoteTotal,
      
      // Product methods
      addProduct,
      updateProduct,
      deleteProduct,
      
      // Template methods
      addQuoteTemplate,
      updateQuoteTemplate,
      deleteQuoteTemplate,
      
      // Settings and webhook methods
      updateCompanySettings,
      processWebhook
    }}>
      {children}
    </CRMContext.Provider>
  );
};