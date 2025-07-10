import { Prospect, ProspectStatus, Platform } from '../types';

interface MockProspect extends Prospect {
  assignedTo?: string; // User ID
}

class ProspectService {
  private prospects: MockProspect[] = [];
  private initialized = false;

  constructor() {
    this.loadProspects();
  }

  private loadProspects(): void {
    if (this.initialized) return;
    
    const savedProspects = localStorage.getItem('crm-prospects');
    if (savedProspects) {
      try {
        const parsed = JSON.parse(savedProspects);
        this.prospects = parsed.map((prospect: any) => ({
          ...prospect,
          fechaContacto: new Date(prospect.fechaContacto),
          ultimoSeguimiento: prospect.ultimoSeguimiento ? new Date(prospect.ultimoSeguimiento) : undefined,
          seguimientos: prospect.seguimientos.map((seg: any) => ({
            ...seg,
            fecha: new Date(seg.fecha)
          })),
          cotizaciones: prospect.cotizaciones.map((cot: any) => ({
            ...cot,
            fecha: new Date(cot.fecha)
          }))
        }));
      } catch (error) {
        console.error('Error loading prospects:', error);
        this.prospects = this.getDefaultProspects();
      }
    } else {
      this.prospects = this.getDefaultProspects();
    }
    
    this.initialized = true;
    this.saveProspects();
  }

  private saveProspects(): void {
    localStorage.setItem('crm-prospects', JSON.stringify(this.prospects));
  }

  private getDefaultProspects(): MockProspect[] {
    return [
      {
        id: '1',
        nombre: 'María García',
        telefono: '+52 55 1234 5678',
        correo: 'maria.garcia@empresa.com',
        plataforma: 'WhatsApp',
        servicioInteres: 'Chatbot WhatsApp',
        fechaContacto: new Date('2024-01-15'),
        estado: 'Nuevo',
        responsable: '1', // Admin user ID
        assignedTo: '1',
        notasInternas: 'Interesada en automatización de atención al cliente',
        seguimientos: [],
        cotizaciones: []
      },
      {
        id: '2',
        nombre: 'Carlos López',
        telefono: '+52 55 8765 4321',
        correo: 'carlos.lopez@startup.com',
        plataforma: 'Instagram',
        servicioInteres: 'CRM personalizado',
        fechaContacto: new Date('2024-01-20'),
        estado: 'Contactado',
        responsable: '2', // Demo user ID
        assignedTo: '2',
        notasInternas: 'Startup en crecimiento, necesita gestión de leads',
        seguimientos: [
          {
            id: '1',
            fecha: new Date('2024-01-21'),
            usuario: 'Usuario Demo',
            nota: 'Primera llamada realizada, muy interesado en el producto'
          }
        ],
        cotizaciones: [],
        ultimoSeguimiento: new Date('2024-01-21')
      }
    ];
  }

  async getAllProspects(): Promise<MockProspect[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.prospects];
  }

  async getProspectById(id: string): Promise<MockProspect | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.prospects.find(prospect => prospect.id === id) || null;
  }

  async createProspect(prospectData: Omit<MockProspect, 'id' | 'seguimientos' | 'cotizaciones'>): Promise<MockProspect> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newProspect: MockProspect = {
      ...prospectData,
      id: Date.now().toString(),
      seguimientos: [],
      cotizaciones: [],
      assignedTo: prospectData.responsable // Set assignedTo to the same as responsable
    };

    this.prospects.unshift(newProspect);
    this.saveProspects();
    return newProspect;
  }

  async updateProspect(id: string, updates: Partial<MockProspect>): Promise<MockProspect> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const prospectIndex = this.prospects.findIndex(prospect => prospect.id === id);
    if (prospectIndex === -1) {
      throw new Error('Prospecto no encontrado');
    }

    // If responsable is being updated, also update assignedTo
    if (updates.responsable) {
      updates.assignedTo = updates.responsable;
    }

    const updatedProspect = {
      ...this.prospects[prospectIndex],
      ...updates
    };

    this.prospects[prospectIndex] = updatedProspect;
    this.saveProspects();
    return updatedProspect;
  }

  async deleteProspect(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    this.prospects = this.prospects.filter(prospect => prospect.id !== id);
    this.saveProspects();
  }

  async assignProspectToUser(prospectId: string, userId: string): Promise<MockProspect> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const prospectIndex = this.prospects.findIndex(prospect => prospect.id === prospectId);
    if (prospectIndex === -1) {
      throw new Error('Prospecto no encontrado');
    }

    this.prospects[prospectIndex].assignedTo = userId;
    this.prospects[prospectIndex].responsable = userId;
    this.saveProspects();
    
    return this.prospects[prospectIndex];
  }

  async getProspectsByUser(userId: string): Promise<MockProspect[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.prospects.filter(prospect => prospect.assignedTo === userId);
  }

  async addFollowUp(prospectId: string, note: string, userId: string = 'current-user'): Promise<MockProspect> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const prospectIndex = this.prospects.findIndex(prospect => prospect.id === prospectId);
    if (prospectIndex === -1) {
      throw new Error('Prospecto no encontrado');
    }

    const newFollowUp = {
      id: Date.now().toString(),
      fecha: new Date(),
      usuario: 'Usuario Actual', // In a real app, get from auth context
      nota: note
    };

    this.prospects[prospectIndex].seguimientos.unshift(newFollowUp);
    this.prospects[prospectIndex].ultimoSeguimiento = new Date();
    this.saveProspects();

    return this.prospects[prospectIndex];
  }

  async getProspectsStats(): Promise<{
    total: number;
    byStatus: Record<ProspectStatus, number>;
    byPlatform: Record<Platform, number>;
    byUser: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const stats = {
      total: this.prospects.length,
      byStatus: {} as Record<ProspectStatus, number>,
      byPlatform: {} as Record<Platform, number>,
      byUser: {} as Record<string, number>
    };

    // Initialize counters
    const statuses: ProspectStatus[] = ['Nuevo', 'Contactado', 'En seguimiento', 'Cotizado', 'Venta cerrada', 'Perdido'];
    const platforms: Platform[] = ['WhatsApp', 'Instagram', 'Facebook'];

    statuses.forEach(status => stats.byStatus[status] = 0);
    platforms.forEach(platform => stats.byPlatform[platform] = 0);

    // Count prospects
    this.prospects.forEach(prospect => {
      stats.byStatus[prospect.estado]++;
      stats.byPlatform[prospect.plataforma]++;
      
      const userId = prospect.assignedTo || 'unassigned';
      stats.byUser[userId] = (stats.byUser[userId] || 0) + 1;
    });

    return stats;
  }
}

export const prospectService = new ProspectService();