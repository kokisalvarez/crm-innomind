// project/api/services/prospectService.ts

import { initializeApp, cert } from 'firebase-admin/app';
import {
  getFirestore,
  FieldValue,
  DocumentData,
  QuerySnapshot
} from 'firebase-admin/firestore';
import type {
  Prospect,
  FollowUp,
  ProspectStatus,
  Platform
} from '../../src/types';  // desde project/api/services → subir dos niveles a src/types

// 1) Validar vars de entorno
const projectId     = process.env.FIRESTORE_PROJECT_ID;
const clientEmail   = process.env.FIRESTORE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIRESTORE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawPrivateKey) {
  throw new Error(
    `Faltan credenciales de Firestore:\n` +
    ` FIRESTORE_PROJECT_ID=${projectId}\n` +
    ` FIRESTORE_CLIENT_EMAIL=${clientEmail}\n` +
    ` FIRESTORE_PRIVATE_KEY=${rawPrivateKey ? '[OK]' : rawPrivateKey}`
  );
}

// convierte literales "\n" en saltos de línea reales
const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

// 2) Inicializar Firebase Admin (una sola vez)
initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
});

const db         = getFirestore();
const collection = db.collection('prospects');

// 3) Servicio de Prospectos
export const prospectService = {
  /**
   * Crea un nuevo prospecto.
   * Ya no recibe `fechaContacto` en el input: lo genera internamente.
   */
  async createProspect(
    data: Omit<
      Prospect,
      'id' | 'seguimientos' | 'cotizaciones' | 'ultimoSeguimiento' | 'fechaContacto'
    >
  ): Promise<Prospect> {
    const now = new Date();
    const ref = await collection.add({
      ...data,
      fechaContacto:     FieldValue.serverTimestamp(),
      seguimientos:      [],
      cotizaciones:      [],
      ultimoSeguimiento: null,
      createdAt:         FieldValue.serverTimestamp()
    });

    return {
      id: ref.id,
      ...data,
      fechaContacto:     now,
      seguimientos:      [],
      cotizaciones:      [],
      ultimoSeguimiento: undefined
    };
  },

  async getAllProspects(): Promise<Prospect[]> {
    const snap: QuerySnapshot<DocumentData> = await collection.get();
    return snap.docs.map(doc => {
      const d = doc.data() as any;
      return {
        id: doc.id,
        ...d,
        fechaContacto:     d.fechaContacto.toDate(),
        ultimoSeguimiento: d.ultimoSeguimiento?.toDate(),
        seguimientos:      (d.seguimientos || []).map((f: any) => ({ ...f, fecha: f.fecha.toDate() })),
        cotizaciones:      (d.cotizaciones || []).map((q: any) => ({ ...q, fecha: q.fecha.toDate() }))
      } as Prospect;
    });
  },

  async getProspectById(id: string): Promise<Prospect | null> {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    const d = doc.data() as any;
    return {
      id: doc.id,
      ...d,
      fechaContacto:     d.fechaContacto.toDate(),
      ultimoSeguimiento: d.ultimoSeguimiento?.toDate(),
      seguimientos:      (d.seguimientos || []).map((f: any) => ({ ...f, fecha: f.fecha.toDate() })),
      cotizaciones:      (d.cotizaciones || []).map((q: any) => ({ ...q, fecha: q.fecha.toDate() }))
    };
  },

  async updateProspect(
    id: string,
    updates: Partial<Prospect> & { assignedTo?: string }
  ): Promise<Prospect> {
    const ref  = collection.doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Prospecto no encontrado');

    if (updates.responsable) {
      (updates as any).assignedTo = updates.responsable;
    }

    const payload: any = { ...updates };
    if (updates.fechaContacto instanceof Date) {
      payload.fechaContacto = FieldValue.serverTimestamp();
    }
    if (updates.ultimoSeguimiento instanceof Date) {
      payload.ultimoSeguimiento = FieldValue.serverTimestamp();
    }

    await ref.update(payload);
    return (await this.getProspectById(id))!;
  },

  async deleteProspect(id: string): Promise<void> {
    await collection.doc(id).delete();
  },

  async assignProspectToUser(prospectId: string, userId: string): Promise<Prospect> {
    const ref  = collection.doc(prospectId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Prospecto no encontrado');

    await ref.update({ assignedTo: userId, responsable: userId });
    return (await this.getProspectById(prospectId))!;
  },

  async getProspectsByUser(userId: string): Promise<Prospect[]> {
    const snap = await collection.where('assignedTo', '==', userId).get();
    return snap.docs.map(doc => {
      const d = doc.data() as any;
      return {
        id: doc.id,
        ...d,
        fechaContacto:     d.fechaContacto.toDate(),
        ultimoSeguimiento: d.ultimoSeguimiento?.toDate(),
        seguimientos:      (d.seguimientos || []).map((f: any) => ({ ...f, fecha: f.fecha.toDate() })),
        cotizaciones:      (d.cotizaciones || []).map((q: any) => ({ ...q, fecha: q.fecha.toDate() }))
      } as Prospect;
    });
  },

  async addFollowUp(prospectId: string, nota: string, usuario = 'sistema'): Promise<Prospect> {
    const ref  = collection.doc(prospectId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Prospecto no encontrado');
    const d = snap.data() as any;

    const nuevo: FollowUp = {
      id:    Date.now().toString(),
      fecha: new Date(),
      usuario,
      nota
    };
    const todos = [nuevo, ...(d.seguimientos || [])];
    await ref.update({
      seguimientos:      todos,
      ultimoSeguimiento: FieldValue.serverTimestamp()
    });

    return (await this.getProspectById(prospectId))!;
  },

  async getProspectsStats(): Promise<{
    total: number;
    byStatus: Record<ProspectStatus, number>;
    byPlatform: Record<Platform, number>;
    byUser: Record<string, number>;
  }> {
    const all = await this.getAllProspects();
    const stats = {
      total:     all.length,
      byStatus:   {} as Record<ProspectStatus, number>,
      byPlatform: {} as Record<Platform, number>,
      byUser:     {} as Record<string, number>
    };

    (['Nuevo','Contactado','En seguimiento','Cotizado','Venta cerrada','Perdido'] as ProspectStatus[])
      .forEach(s => (stats.byStatus[s] = 0));
    (['WhatsApp','Instagram','Facebook'] as Platform[])
      .forEach(p => (stats.byPlatform[p] = 0));

    all.forEach(p => {
      stats.byStatus[p.estado]++;
      stats.byPlatform[p.plataforma]++;
      const u = (p as any).assignedTo || 'unassigned';
      stats.byUser[u] = (stats.byUser[u] || 0) + 1;
    });

    return stats;
  }
};
