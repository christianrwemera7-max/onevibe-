import { initializeFirebase } from '@/firebase/init';

// Version simplifiée et sécurisée utilisant l'initialisation centralisée
const sdks = initializeFirebase();

export const auth = sdks.auth;
export const db = sdks.firestore;

export enum OperationType {
  GET = 'GET',
  LIST = 'LIST',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export const handleFirestoreError = (err: any, op: OperationType, path: string) => {
  console.error(`Firestore Error [${op}] at ${path}:`, err);
};
