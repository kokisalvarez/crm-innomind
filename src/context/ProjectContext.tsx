import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, 
  Project, 
  ProjectMilestone, 
  ProjectNote, 
  PaymentSchedule, 
  ProjectMeeting,
  Invoice,
  SalesMetrics,
  Budget,
  ProjectExpense,
  FinancialReport
} from '../types/projects';
import { mockClients, mockProjects, mockInvoices } from '../data/mockProjectData';

interface ProjectContextType {
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  getProjectsByClient: (clientId: string) => Project[];

  // Milestones
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  // Notes
  addNote: (projectId: string, note: Omit<ProjectNote, 'id' | 'createdAt'>) => void;
  updateNote: (projectId: string, noteId: string, updates: Partial<ProjectNote>) => void;
  deleteNote: (projectId: string, noteId: string) => void;

  // Payments
  addPayment: (projectId: string, payment: Omit<PaymentSchedule, 'id'>) => void;
  updatePayment: (projectId: string, paymentId: string, updates: Partial<PaymentSchedule>) => void;
  deletePayment: (projectId: string, paymentId: string) => void;

  // Meetings
  addMeeting: (projectId: string, meeting: Omit<ProjectMeeting, 'id'>) => void;
  updateMeeting: (projectId: string, meetingId: string, updates: Partial<ProjectMeeting>) => void;
  deleteMeeting: (projectId: string, meetingId: string) => void;

  // Expenses
  addExpense: (projectId: string, expense: Omit<ProjectExpense, 'id'>) => void;
  updateExpense: (projectId: string, expenseId: string, updates: Partial<ProjectExpense>) => void;
  deleteExpense: (projectId: string, expenseId: string) => void;

  // Financial
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  generateInvoice: (projectId: string, paymentId: string) => Invoice;

  // Analytics
  getSalesMetrics: () => SalesMetrics;
  getProjectBudgets: (projectId: string) => Budget[];
  generateFinancialReport: (type: FinancialReport['type'], period: { start: Date; end: Date }) => FinancialReport;

  // Notifications
  getUpcomingPayments: (days?: number) => PaymentSchedule[];
  getUpcomingMeetings: (days?: number) => ProjectMeeting[];
  getOverdueTasks: () => ProjectMilestone[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClients = localStorage.getItem('project-clients');
    const savedProjects = localStorage.getItem('project-projects');
    const savedInvoices = localStorage.getItem('project-invoices');

    if (savedClients) {
      try {
        const parsed = JSON.parse(savedClients);
        const processedClients = parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }));
        setClients(processedClients);
      } catch (error) {
        console.error('Error parsing saved clients:', error);
        setClients(mockClients);
      }
    } else {
      setClients(mockClients);
    }

    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        const processedProjects = parsed.map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          milestones: p.milestones.map((m: any) => ({
            ...m,
            dueDate: new Date(m.dueDate),
            completedDate: m.completedDate ? new Date(m.completedDate) : undefined
          })),
          notes: p.notes.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          })),
          paymentSchedule: p.paymentSchedule.map((ps: any) => ({
            ...ps,
            dueDate: new Date(ps.dueDate),
            paidDate: ps.paidDate ? new Date(ps.paidDate) : undefined
          })),
          meetings: p.meetings.map((m: any) => ({
            ...m,
            scheduledDate: new Date(m.scheduledDate)
          })),
          expenses: p.expenses.map((e: any) => ({
            ...e,
            date: new Date(e.date)
          }))
        }));
        setProjects(processedProjects);
      } catch (error) {
        console.error('Error parsing saved projects:', error);
        setProjects(mockProjects);
      }
    } else {
      setProjects(mockProjects);
    }

    if (savedInvoices) {
      try {
        const parsed = JSON.parse(savedInvoices);
        const processedInvoices = parsed.map((i: any) => ({
          ...i,
          issueDate: new Date(i.issueDate),
          dueDate: new Date(i.dueDate),
          paidDate: i.paidDate ? new Date(i.paidDate) : undefined
        }));
        setInvoices(processedInvoices);
      } catch (error) {
        console.error('Error parsing saved invoices:', error);
        setInvoices(mockInvoices);
      }
    } else {
      setInvoices(mockInvoices);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (clients.length > 0) {
      localStorage.setItem('project-clients', JSON.stringify(clients));
    }
  }, [clients]);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('project-projects', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem('project-invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  // Client methods
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Also delete associated projects
    setProjects(prev => prev.filter(p => p.clientId !== id));
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id);
  };

  // Project methods
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getProjectsByClient = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  // Milestone methods
  const addMilestone = (projectId: string, milestoneData: Omit<ProjectMilestone, 'id'>) => {
    const newMilestone: ProjectMilestone = {
      ...milestoneData,
      id: Date.now().toString()
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, milestones: [...p.milestones, newMilestone], updatedAt: new Date() }
        : p
    ));
  };

  const updateMilestone = (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            milestones: p.milestones.map(m => 
              m.id === milestoneId ? { ...m, ...updates } : m
            ),
            updatedAt: new Date()
          }
        : p
    ));
  };

  const deleteMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            milestones: p.milestones.filter(m => m.id !== milestoneId),
            updatedAt: new Date()
          }
        : p
    ));
  };

  // Note methods
  const addNote = (projectId: string, noteData: Omit<ProjectNote, 'id' | 'createdAt'>) => {
    const newNote: ProjectNote = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, notes: [newNote, ...p.notes], updatedAt: new Date() }
        : p
    ));
  };

  const updateNote = (projectId: string, noteId: string, updates: Partial<ProjectNote>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            notes: p.notes.map(n => 
              n.id === noteId ? { ...n, ...updates } : n
            ),
            updatedAt: new Date()
          }
        : p
    ));
  };

  const deleteNote = (projectId: string, noteId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            notes: p.notes.filter(n => n.id !== noteId),
            updatedAt: new Date()
          }
        : p
    ));
  };

  // Payment methods
  const addPayment = (projectId: string, paymentData: Omit<PaymentSchedule, 'id'>) => {
    const newPayment: PaymentSchedule = {
      ...paymentData,
      id: Date.now().toString()
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, paymentSchedule: [...p.paymentSchedule, newPayment], updatedAt: new Date() }
        : p
    ));
  };

  const updatePayment = (projectId: string, paymentId: string, updates: Partial<PaymentSchedule>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            paymentSchedule: p.paymentSchedule.map(ps => 
              ps.id === paymentId ? { ...ps, ...updates } : ps
            ),
            updatedAt: new Date()
          }
        : p
    ));
  };

  const deletePayment = (projectId: string, paymentId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            paymentSchedule: p.paymentSchedule.filter(ps => ps.id !== paymentId),
            updatedAt: new Date()
          }
        : p
    ));
  };

  // Meeting methods
  const addMeeting = (projectId: string, meetingData: Omit<ProjectMeeting, 'id'>) => {
    const newMeeting: ProjectMeeting = {
      ...meetingData,
      id: Date.now().toString()
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, meetings: [...p.meetings, newMeeting], updatedAt: new Date() }
        : p
    ));
  };

  const updateMeeting = (projectId: string, meetingId: string, updates: Partial<ProjectMeeting>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            meetings: p.meetings.map(m => 
              m.id === meetingId ? { ...m, ...updates } : m
            ),
            updatedAt: new Date()
          }
        : p
    ));
  };

  const deleteMeeting = (projectId: string, meetingId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            meetings: p.meetings.filter(m => m.id !== meetingId),
            updatedAt: new Date()
          }
        : p
    ));
  };

  // Expense methods
  const addExpense = (projectId: string, expenseData: Omit<ProjectExpense, 'id'>) => {
    const newExpense: ProjectExpense = {
      ...expenseData,
      id: Date.now().toString()
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, expenses: [...p.expenses, newExpense], updatedAt: new Date() }
        : p
    ));
  };

  const updateExpense = (projectId: string, expenseId: string, updates: Partial<ProjectExpense>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            expenses: p.expenses.map(e => 
              e.id === expenseId ? { ...e, ...updates } : e
            ),
            updatedAt: new Date()
          }
        : p
    ));
  };

  const deleteExpense = (projectId: string, expenseId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            expenses: p.expenses.filter(e => e.id !== expenseId),
            updatedAt: new Date()
          }
        : p
    ));
  };

  // Invoice methods
  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString()
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => 
      i.id === id ? { ...i, ...updates } : i
    ));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const generateInvoice = (projectId: string, paymentId: string): Invoice => {
    const project = getProject(projectId);
    const client = project ? getClient(project.clientId) : undefined;
    const payment = project?.paymentSchedule.find(p => p.id === paymentId);

    if (!project || !client || !payment) {
      throw new Error('Project, client, or payment not found');
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(4, '0')}`,
      clientId: client.id,
      projectId: project.id,
      issueDate: new Date(),
      dueDate: payment.dueDate,
      amount: payment.amount,
      tax: payment.amount * 0.16, // 16% IVA
      total: payment.amount * 1.16,
      status: 'draft',
      items: [{
        id: '1',
        description: payment.description,
        quantity: 1,
        rate: payment.amount,
        amount: payment.amount
      }],
      notes: payment.notes,
      paymentTerms: '30 days'
    };

    addInvoice(newInvoice);
    return newInvoice;
  };

  // Analytics methods
  const getSalesMetrics = (): SalesMetrics => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(currentMonth / 3);

    const totalRevenue = projects.reduce((sum, p) => sum + p.totalValue, 0);
    
    const monthlyRevenue = projects
      .filter(p => p.createdAt.getMonth() === currentMonth && p.createdAt.getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.totalValue, 0);

    const quarterlyRevenue = projects
      .filter(p => {
        const projectQuarter = Math.floor(p.createdAt.getMonth() / 3);
        return projectQuarter === currentQuarter && p.createdAt.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.totalValue, 0);

    const yearlyRevenue = projects
      .filter(p => p.createdAt.getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.totalValue, 0);

    const revenueByClient = projects.reduce((acc, p) => {
      const client = getClient(p.clientId);
      const clientName = client?.companyName || 'Unknown';
      acc[clientName] = (acc[clientName] || 0) + p.totalValue;
      return acc;
    }, {} as Record<string, number>);

    const revenueByProject = projects.reduce((acc, p) => {
      acc[p.name] = p.totalValue;
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = projects.reduce((sum, p) => 
      sum + p.expenses.reduce((expSum, e) => expSum + e.amount, 0), 0
    );

    return {
      totalRevenue,
      monthlyRevenue,
      quarterlyRevenue,
      yearlyRevenue,
      revenueByClient,
      revenueByProject,
      averageProjectValue: projects.length > 0 ? totalRevenue / projects.length : 0,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'in-progress').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
    };
  };

  const getProjectBudgets = (projectId: string): Budget[] => {
    const project = getProject(projectId);
    if (!project) return [];

    const expensesByCategory = project.expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const budgetCategories = ['license', 'subscription', 'hosting', 'tools', 'travel', 'other'];
    const budgetPerCategory = project.budget / budgetCategories.length;

    return budgetCategories.map(category => ({
      id: `${projectId}-${category}`,
      projectId,
      category,
      allocated: budgetPerCategory,
      spent: expensesByCategory[category] || 0,
      remaining: budgetPerCategory - (expensesByCategory[category] || 0),
      lastUpdated: new Date()
    }));
  };

  const generateFinancialReport = (type: FinancialReport['type'], period: { start: Date; end: Date }): FinancialReport => {
    const filteredProjects = projects.filter(p => 
      p.createdAt >= period.start && p.createdAt <= period.end
    );

    let data: any = {};

    switch (type) {
      case 'profit-loss':
        const revenue = filteredProjects.reduce((sum, p) => sum + p.totalValue, 0);
        const expenses = filteredProjects.reduce((sum, p) => 
          sum + p.expenses.reduce((expSum, e) => expSum + e.amount, 0), 0
        );
        data = {
          revenue,
          expenses,
          profit: revenue - expenses,
          profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
        };
        break;

      case 'cash-flow':
        const payments = filteredProjects.flatMap(p => p.paymentSchedule)
          .filter(ps => ps.paidDate && ps.paidDate >= period.start && ps.paidDate <= period.end);
        data = {
          inflow: payments.reduce((sum, p) => sum + p.amount, 0),
          outflow: expenses,
          netFlow: payments.reduce((sum, p) => sum + p.amount, 0) - expenses
        };
        break;

      case 'revenue':
        data = {
          totalRevenue: filteredProjects.reduce((sum, p) => sum + p.totalValue, 0),
          projectCount: filteredProjects.length,
          averageProjectValue: filteredProjects.length > 0 
            ? filteredProjects.reduce((sum, p) => sum + p.totalValue, 0) / filteredProjects.length 
            : 0
        };
        break;

      default:
        data = {};
    }

    return {
      id: Date.now().toString(),
      type,
      period,
      data,
      generatedAt: new Date(),
      generatedBy: 'System'
    };
  };

  // Notification methods
  const getUpcomingPayments = (days: number = 7): PaymentSchedule[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return projects
      .flatMap(p => p.paymentSchedule)
      .filter(ps => ps.status === 'pending' && ps.dueDate <= cutoffDate)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const getUpcomingMeetings = (days: number = 7): ProjectMeeting[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return projects
      .flatMap(p => p.meetings)
      .filter(m => m.status === 'scheduled' && m.scheduledDate <= cutoffDate)
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  };

  const getOverdueTasks = (): ProjectMilestone[] => {
    const now = new Date();
    return projects
      .flatMap(p => p.milestones)
      .filter(m => m.status !== 'completed' && m.dueDate < now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  return (
    <ProjectContext.Provider value={{
      clients,
      addClient,
      updateClient,
      deleteClient,
      getClient,
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProject,
      getProjectsByClient,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addNote,
      updateNote,
      deleteNote,
      addPayment,
      updatePayment,
      deletePayment,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      addExpense,
      updateExpense,
      deleteExpense,
      invoices,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoice,
      getSalesMetrics,
      getProjectBudgets,
      generateFinancialReport,
      getUpcomingPayments,
      getUpcomingMeetings,
      getOverdueTasks
    }}>
      {children}
    </ProjectContext.Provider>
  );
};