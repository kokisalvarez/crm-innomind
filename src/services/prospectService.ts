// src/services/prospectService.ts
import { initializeApp, cert } from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue,
  DocumentData,
  QuerySnapshot
} from 'firebase-admin/firestore';
import {
  Prospect,
  FollowUp,
  Quote,
  ProspectStatus,
  Platform
} from '../types';

// ----------------------------------------------------------------------------
// 1) Inicializa Firebase Admin con credenciales de entorno
// ----------------------------------------------------------------------------
const firebaseApp = initializeApp({
  credential: cert({
    projectId:   process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(firebaseApp);
const collection = db.collection('prospects');

// ----------------------------------------------------------------------------
// 2) Servicio
// ----------------------------------------------------------------------------
export const prospectService = {
  /**
   * Devuelve todos los prospectos
   */
  async getAllProspects(): Promise<Prospect[]> {
    const snap: QuerySnapshot<DocumentData> = await collection.get();
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaContacto: data.fechaContacto.toDate(),
        ultimoSeguimiento: data.ultimoSeguimiento?.toDate(),
        seguimientos: (data.seguimientos || []).map((f: any) => ({
          ...f,
          fecha: f.fecha.toDate()
        })),
        cotizaciones: (data.cotizaciones || []).map((q: any) => ({
          ...q,
          fecha: q.fecha.toDate()
        })),
      } as Prospect;
    });
  },

  /**
   * Devuelve un prospecto por ID o null si no existe
   */
  async getProspectById(id: string): Promise<Prospect | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      fechaContacto: data.fechaContacto.toDate(),
      ultimoSeguimiento: data.ultimoSeguimiento?.toDate(),
      seguimientos: (data.seguimientos || []).map((f: any) => ({
        ...f,
        fecha: f.fecha.toDate()
      })),
      cotizaciones: (data.cotizaciones || []).map((q: any) => ({
        ...q,
        fecha: q.fecha.toDate()
      })),
    };
  },

  /**
   * Crea un nuevo prospecto
   */
  async createProspect(data: Omit<Prospect, 'id' | 'seguimientos' | 'cotizaciones' | 'ultimoSeguimiento'>): Promise<Prospect> {
    const now = new Date();
    const docRef = await collection.add({
      ...data,
      fechaContacto:      FieldValue.serverTimestamp(),
      seguimientos:       [],
      cotizaciones:       [],
      ultimoSeguimiento:  null,
      createdAt:          FieldValue.serverTimestamp()
    });

    // Lee de vuelta para devolverlo con ID y campos Date
    const snap = await docRef.get();
    const saved = snap.data() as any;
    return {
      id: snap.id,
      ...data,
      fechaContacto:     now,
      seguimientos:      [],
      cotizaciones:      [],
      ultimoSeguimiento: undefined
    };
  },

  /**
   * Actualiza un prospecto existente
   */
  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect> {
    const docRef = collection.doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Prospecto no encontrado');

    // Si actualizas responsable, sincroniza assignedTo
    if (updates.responsable) {
      updates.assignedTo = updates.responsable;
    }

    // Convierte Date a Timestamp
    const payload: any = { ...updates };
    if (updates.fechaContacto instanceof Date) {
      payload.fechaContacto = FieldValue.serverTimestamp();
    }
    if (updates.ultimoSeguimiento instanceof Date) {
      payload.ultimoSeguimiento = FieldValue.serverTimestamp();
    }
    await docRef.update(payload);

    // Devuelve el documento actualizado
    return this.getProspectById(id) as Promise<Prospect>;
  },

  /**
   * Elimina un prospecto
   */
  async deleteProspect(id: string): Promise<void> {
    await collection.doc(id).delete();
  },

  /**
   * Asigna un prospecto a un usuario
   */
  async assignProspectToUser(prospectId: string, userId: string): Promise<Prospect> {
    const docRef = collection.doc(prospectId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Prospecto no encontrado');

    await docRef.update({
      assignedTo: userId,
      responsable: userId
    });

    return this.getProspectById(prospectId) as Promise<Prospect>;
  },

  /**
   * Filtra prospectos por usuario asignado
   */
  async getProspectsByUser(userId: string): Promise<Prospect[]> {
    const snap = await collection.where('assignedTo', '==', userId).get();
    return snap.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        fechaContacto: data.fechaContacto.toDate(),
        ultimoSeguimiento: data.ultimoSeguimiento?.toDate(),
        seguimientos: (data.seguimientos || []).map((f: any) => ({
          ...f,
          fecha: f.fecha.toDate()
        })),
        cotizaciones: (data.cotizaciones || []).map((q: any) => ({
          ...q,
          fecha: q.fecha.toDate()
        })),
      };
    });
  },

  /**
   * Agrega un follow-up a un prospecto
   */
  async addFollowUp(prospectId: string, nota: string, usuario: string = 'sistema'): Promise<Prospect> {
    const docRef = collection.doc(prospectId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Prospecto no encontrado');
    const data = docSnap.data() as any;

    const nuevoSeguimiento: FollowUp = {
      id: Date.now().toString(),
      fecha: new Date(),
      usuario,
      nota
    };

    const nuevos = [nuevoSeguimiento, ...(data.seguimientos || [])];
    await docRef.update({
      seguimientos: nuevos,
      ultimoSeguimiento: FieldValue.serverTimestamp()
    });

    return this.getProspectById(prospectId) as Promise<Prospect>;
  },

  /**
   * Estadísticas de prospectos
   */
  async getProspectsStats(): Promise<{
    total: number;
    byStatus: Record<ProspectStatus, number>;
    byPlatform: Record<Platform, number>;
    byUser: Record<string, number>;
  }> {
    const all = await this.getAllProspects();
    const stats = {
      total: all.length,
      byStatus: {} as Record<ProspectStatus, number>,
      byPlatform: {} as Record<Platform, number>,
      byUser: {} as Record<string, number>,
    };

    // Inicializa contadores
    (['Nuevo','Contactado','En seguimiento','Cotizado','Venta cerrada','Perdido'] as ProspectStatus[])
      .forEach(s => (stats.byStatus[s] = 0));
    (['WhatsApp','Instagram','Facebook'] as Platform[])
      .forEach(p => (stats.byPlatform[p] = 0));

    // Cuenta
    all.forEach(p => {
      stats.byStatus[p.estado]++;
      stats.byPlatform[p.plataforma]++;
      const u = p.assignedTo || 'unassigned';
      stats.byUser[u] = (stats.byUser[u] || 0) + 1;
    });

    return stats;
  }
};
