// src/firebaseConfig.ts

// 1) Importa las funciones del SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 2) Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpO717i6uDskveEg16M2d2Kwft0EI181c",
  authDomain: "crm-innomind-f8987.firebaseapp.com",
  projectId: "crm-innomind-f8987",
  storageBucket: "crm-innomind-f8987.appspot.com",      // fíjate en ".appspot.com"
  messagingSenderId: "683876713622",
  appId: "1:683876713622:web:9111dc9b67298fa6352eb7",
  measurementId: "G-5DK60KNJ77"                        // opcional
};

// 3) Inicializa la app de Firebase
const firebaseApp = initializeApp(firebaseConfig);

// 4) Exporta los servicios que usarás
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
