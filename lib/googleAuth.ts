// project/api/services/googleAuth.ts

import 'dotenv/config';    // <- esto carga .env antes que nada
import { google } from 'googleapis';
import admin from 'firebase-admin';
import type { Credentials } from 'google-auth-library';

// Validar y preparar credenciales de Firebase
const projectId = process.env.FIRESTORE_PROJECT_ID;
const clientEmail = process.env.FIRESTORE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIRESTORE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawPrivateKey) {
  throw new Error(
    'Missing Firestore env vars. ' +
    `FIRESTORE_PROJECT_ID=${projectId}, ` +
    `FIRESTORE_CLIENT_EMAIL=${clientEmail}, ` +
    `FIRESTORE_PRIVATE_KEY=${rawPrivateKey ? '[OK]' : rawPrivateKey}`
  );
}

// Convertir los `\n` literales en saltos de línea reales
const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

// Inicializar Firebase Admin solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

const db = admin.firestore();

// Crear cliente OAuth2 configurado con tus vars de Google
function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing Google OAuth env vars. ' +
      `GOOGLE_CLIENT_ID=${clientId}, ` +
      `GOOGLE_CLIENT_SECRET=${clientSecret}, ` +
      `GOOGLE_REDIRECT_URI=${redirectUri}`
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Genera URL de autenticación para Google Calendar
export function getAuthUrl(): string {
  const oAuth2 = createOAuthClient();
  return oAuth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar']
  });
}

// Intercambia código por tokens y los guarda en Firestore
export async function exchangeCodeAndStore(code: string): Promise<Credentials> {
  const oAuth2 = createOAuthClient();
  const { tokens } = await oAuth2.getToken(code);
  await db
    .collection('settings')
    .doc('calendarTokens')
    .set({
      tokens,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  return tokens;
}

// Recupera tokens guardados en Firestore
export async function getStoredTokens(): Promise<Credentials | null> {
  const snap = await db.collection('settings').doc('calendarTokens').get();
  if (!snap.exists) return null;
  return snap.data()!.tokens as Credentials;
}

// Sincroniza un array de eventos en Firestore (opcional)
export async function syncEventsToFirestore(events: any[]): Promise<void> {
  const batch = db.batch();
  events.forEach(evt => {
    const ref = db.collection('calendarEvents').doc(evt.id);
    batch.set(ref, evt, { merge: true });
  });
  await batch.commit();
}
