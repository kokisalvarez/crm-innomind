// project/lib/googleAuth.ts

// Solo en desarrollo cargamos .env; en Vercel usaremos las env vars del dashboard
if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable @typescript-eslint/no-var-requires */
  require('dotenv/config');
}

import { google } from 'googleapis';
import admin from 'firebase-admin';
import type { Credentials } from 'google-auth-library';

// ——————————————
// 1) DEBUG: imprime las env vars de Firestore
// ——————————————
console.log('[googleAuth] FIRESTORE_PROJECT_ID:', process.env.FIRESTORE_PROJECT_ID);
console.log('[googleAuth] FIRESTORE_CLIENT_EMAIL:', process.env.FIRESTORE_CLIENT_EMAIL);
console.log('[googleAuth] FIRESTORE_PRIVATE_KEY exists:', 
  Boolean(process.env.FIRESTORE_PRIVATE_KEY)
);

// ——————————————
// 2) Inicializar Firebase Admin (una sola vez)
// ——————————————
const projectId     = process.env.FIRESTORE_PROJECT_ID!;
const clientEmail   = process.env.FIRESTORE_CLIENT_EMAIL!;
const rawPrivateKey = process.env.FIRESTORE_PRIVATE_KEY!;

if (!projectId || !clientEmail || !rawPrivateKey) {
  throw new Error(
    `Missing Firestore env vars. ` +
    `FIRESTORE_PROJECT_ID=${projectId}, ` +
    `FIRESTORE_CLIENT_EMAIL=${clientEmail}, ` +
    `FIRESTORE_PRIVATE_KEY=${rawPrivateKey ? '[OK]' : rawPrivateKey}`
  );
}

const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });
}

const db = admin.firestore();

// ——————————————
// 3) Crea un cliente OAuth2 e imprime sus env vars
// ——————————————
function createOAuthClient() {
  console.log('[googleAuth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('[googleAuth] GOOGLE_CLIENT_SECRET exists:',
    Boolean(process.env.GOOGLE_CLIENT_SECRET)
  );
  console.log('[googleAuth] GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI!;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      `Missing Google OAuth env vars. ` +
      `GOOGLE_CLIENT_ID=${clientId}, ` +
      `GOOGLE_CLIENT_SECRET=${clientSecret}, ` +
      `GOOGLE_REDIRECT_URI=${redirectUri}`
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// ——————————————
// 4) Exports
// ——————————————

/**
 * Genera la URL de autorización de Google Calendar.
 */
export function getAuthUrl(): string {
  const oAuth2 = createOAuthClient();
  return oAuth2.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope:       ['https://www.googleapis.com/auth/calendar']
  });
}

/**
 * Intercambia el code por tokens y guarda en Firestore.
 */
export async function exchangeCodeAndStore(code: string): Promise<Credentials> {
  const oAuth2    = createOAuthClient();
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

/**
 * Recupera los tokens almacenados (o null si no existen).
 */
export async function getStoredTokens(): Promise<Credentials | null> {
  const snap = await db.collection('settings').doc('calendarTokens').get();
  if (!snap.exists) return null;
  return snap.data()!.tokens as Credentials;
}

/**
 * Elimina los tokens de Firestore (logout).
 */
export async function deleteStoredTokens(): Promise<void> {
  await db.collection('settings').doc('calendarTokens').delete();
}

/**
 * Sincroniza un array de eventos a Firestore.
 */
export async function syncEventsToFirestore(events: any[]): Promise<void> {
  const batch = db.batch();
  events.forEach(evt => {
    const ref = db.collection('calendarEvents').doc(evt.id);
    batch.set(ref, evt, { merge: true });
  });
  await batch.commit();
}
