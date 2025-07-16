// src/context/CRMContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import {
  Prospect,
  Product,
  Quote,
  DashboardMetrics,
  WebhookData,
  QuoteTemplate,
  CompanySettings,
  QuoteItem,
  QuoteHistoryEntry
} from '../types';
import {
  mockProspects,
  mockProducts,
  mockQuoteTemplates,
  mockCompanySettings
} from '../data/mockData';
import { useCreateProspect, ProspectInput } from '../hooks/useCreateProspect';

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
  addProspect: (data: Omit<Prospect, 'id' | 'seguimientos' | 'cotizaciones'>) => Promise<void>;
  updateProspect: (id: string, updates: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  addFollowUp: (prospectId: string, nota: string) => void;
  selectProspect: (prospect: Prospect | null) => void;

  // User‐prospect integration
  assignProspectToUser: (prospectId: string, userId: string) => void;
  getProspectsByUser: (userId: string) => Prospect[];

  // Quote methods
  addQuote: (quoteData: Omit<Quote, 'id' | 'numero' | 'fechaCreacion' | 'fechaActualizacion' | 'historialCambios'>) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  generateQuoteNumber: () => string;
  calculateQuoteTotal: (items: QuoteItem[], descuentoGlobal: number, tipoDescuentoGlobal: 'porcentaje' | 'monto', iva: number) => { subtotal: number; total: number };

  // Product methods
  addProduct: (data: Omit<Product, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Template methods
  addQuoteTemplate: (data: Omit<QuoteTemplate, 'id' | 'fechaCreacion'>) => void;
  updateQuoteTemplate: (id: string, updates: Partial<QuoteTemplate>) => void;
  deleteQuoteTemplate: (id: string) => void;

  // Settings & Webhook
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  processWebhook: (data: WebhookData) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const ctx = useContext(CRMContext);
  if (!ctx) {
    throw new Error('useCRM must be used within CRMProvider');
  }
  return ctx;
};

interface CRMProviderProps {
  children: ReactNode;
}

export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const createProspect = useCreateProspect();

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(mockCompanySettings);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data from localStorage or mocks
  useEffect(() => {
    // Prospects
    const savedProspects = localStorage.getItem('crm-prospects');
    if (savedProspects) {
      setProspects(JSON.parse(savedProspects));
    } else {
      setProspects(mockProspects);
    }

    // Products
    const savedProducts = localStorage.getItem('crm-products');
    setProducts(savedProducts ? JSON.parse(savedProducts) : mockProducts);

    // Quotes
    const savedQuotes = localStorage.getItem('crm-quotes');
    setQuotes(savedQuotes ? JSON.parse(savedQuotes) : []);

    // Templates
    const savedTemplates = localStorage.getItem('crm-quote-templates');
    setQuoteTemplates(savedTemplates ? JSON.parse(savedTemplates) : mockQuoteTemplates);

    // Company Settings
    const savedSettings = localStorage.getItem('crm-company-settings');
    if (savedSettings) {
      setCompanySettings(JSON.parse(savedSettings));
    }
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem('crm-prospects', JSON.stringify(prospects));
  }, [prospects]);

  useEffect(() => {
    localStorage.setItem('crm-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('crm-quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('crm-quote-templates', JSON.stringify(quoteTemplates));
  }, [quoteTemplates]);

  useEffect(() => {
    localStorage.setItem('crm-company-settings', JSON.stringify(companySettings));
  }, [companySettings]);

  // Prospect methods
  const addProspect = async (data: Omit<Prospect, 'id' | 'seguimientos' | 'cotizaciones'>) => {
    setLoading(true);
    try {
      const newProspect = await createProspect(data as ProspectInput);
      setProspects(prev => [newProspect, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    setProspects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProspect = (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    if (selectedProspect?.id === id) setSelectedProspect(null);
  };

  const addFollowUp = (prospectId: string, nota: string) => {
    setProspects(prev =>
      prev.map(p =>
        p.id === prospectId
          ? {
              ...p,
              seguimientos: [
                ...p.seguimientos,
                { id: Date.now().toString(), fecha: new Date(), nota }
              ]
            }
          : p
      )
    );
  };

  const selectProspect = (prospect: Prospect | null) => {
    setSelectedProspect(prospect);
  };

  const assignProspectToUser = (prospectId: string, userId: string) => {
    setProspects(prev =>
      prev.map(p =>
        p.id === prospectId ? { ...p, responsable: userId } : p
      )
    );
  };

  const getProspectsByUser = (userId: string) =>
    prospects.filter(p => p.responsable === userId);

  // Quote methods
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const allQuotes = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];
    const yearQuotes = allQuotes.filter(q =>
      q.numero.includes(year.toString())
    );
    return `COT-${year}-${(yearQuotes.length + 1)
      .toString()
      .padStart(3, '0')}`;
  };

  const calculateQuoteTotal = (
    items: QuoteItem[],
    descuentoGlobal: number,
    tipoDescuentoGlobal: 'porcentaje' | 'monto',
    iva: number
  ) => {
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const descuento =
      tipoDescuentoGlobal === 'porcentaje'
        ? (subtotal * descuentoGlobal) / 100
        : descuentoGlobal;
    const subtotalConDesc = subtotal - descuento;
    const total = subtotalConDesc + (subtotalConDesc * iva) / 100;
    return { subtotal, total };
  };

  const addQuote = (
    quoteData: Omit<
      Quote,
      'id' | 'numero' | 'fechaCreacion' | 'fechaActualizacion' | 'historialCambios'
    >
  ) => {
    const nueva: Quote = {
      ...quoteData,
      id: Date.now().toString(),
      numero: generateQuoteNumber(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      historialCambios: [
        {
          id: Date.now().toString(),
          fecha: new Date(),
          accion: 'Cotización creada',
          usuario: quoteData.creadoPor,
          detalles: 'Creada inicialmente'
        }
      ]
    };
    setQuotes(prev => [nueva, ...prev]);
    setProspects(prev =>
      prev.map(p =>
        p.id === quoteData.prospectId
          ? { ...p, cotizaciones: [nueva, ...p.cotizaciones] }
          : p
      )
    );
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(prev =>
      prev.map(q =>
        q.id === id ? { ...q, ...updates, fechaActualizacion: new Date() } : q
      )
    );
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    setProspects(prev =>
      prev.map(p => ({
        ...p,
        cotizaciones: p.cotizaciones.filter(c => c.id !== id)
      }))
    );
  };

  // Product methods
  const addProduct = (data: Omit<Product, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    const nuevo: Product = {
      ...data,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    setProducts(prev => [nuevo, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, ...updates, fechaActualizacion: new Date() } : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Template methods
  const addQuoteTemplate = (data: Omit<QuoteTemplate, 'id' | 'fechaCreacion'>) => {
    const nueva: QuoteTemplate = {
      ...data,
      id: Date.now().toString(),
      fechaCreacion: new Date()
    };
    setQuoteTemplates(prev => [nueva, ...prev]);
  };

  const updateQuoteTemplate = (id: string, updates: Partial<QuoteTemplate>) => {
    setQuoteTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteQuoteTemplate = (id: string) => {
    setQuoteTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Settings & Webhook
  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...settings }));
  };

  const processWebhook = (data: WebhookData) => {
    addProspect({
      nombre: data.nombre,
      telefono: data.telefono,
      correo: data.correo || '',
      plataforma: data.plataforma,
      servicioInteres: data.servicio_interes,
      fechaContacto: new Date(data.fecha_contacto),
      estado: 'Nuevo',
      notasInternas: `Ingresado desde ${data.plataforma}`,
      responsable: '1'
    });
  };

  // Dashboard metrics
  const allQuotes = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];
  const dashboardMetrics: DashboardMetrics = {
    totalProspectos: prospects.length,
    prospectosPorPlataforma: prospects.reduce((acc, p) => {
      acc[p.plataforma] = (acc[p.plataforma] || 0) + 1;
      return acc;
    }, {} as Record<Platform, number>),
    prospectosPorEstado: prospects.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {} as Record<Prospect['estado'], number>),
    cotizacionesGeneradas: allQuotes.length,
    ventasCerradas: prospects.filter(p => p.estado === 'Venta cerrada').length,
    tasaConversion:
      prospects.length > 0
        ? (prospects.filter(p => p.estado === 'Venta cerrada').length / prospects.length) * 100
        : 0,
    cotizacionesPorEstado: allQuotes.reduce((acc, q) => {
      acc[q.estado] = (acc[q.estado] || 0) + 1;
      return acc;
    }, {} as Record<Quote['estado'], number>),
    valorTotalCotizaciones: allQuotes.reduce((sum, q) => sum + q.total, 0),
    tasaAceptacion:
      allQuotes.length > 0
        ? (allQuotes.filter(q => q.estado === 'Aceptada').length / allQuotes.length) * 100
        : 0
  };

  return (
    <CRMContext.Provider
      value={{
        prospects,
        products,
        quotes,
        quoteTemplates,
        companySettings,
        selectedProspect,
        dashboardMetrics,
        loading,
        addProspect,
        updateProspect,
        selectProspect,
        addFollowUp,
        deleteProspect,
        assignProspectToUser,
        getProspectsByUser,
        addQuote,
        updateQuote,
        deleteQuote,
        generateQuoteNumber,
        calculateQuoteTotal,
        addProduct,
        updateProduct,
        deleteProduct,
        addQuoteTemplate,
        updateQuoteTemplate,
        deleteQuoteTemplate,
        updateCompanySettings,
        processWebhook
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};
