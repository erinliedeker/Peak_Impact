import { getFirestore, collection, Firestore } from "firebase/firestore";
// Import the FirebaseApp type from where you define/initialize your Firebase app
import type { FirebaseApp } from "firebase/app";

export default defineNuxtPlugin((nuxtApp) => {
  // Use 'as FirebaseApp' to tell TypeScript the expected type
  const firebaseApp = nuxtApp.$firebaseApp as FirebaseApp; 

  const db: Firestore = getFirestore(firebaseApp);

  const modelsRef = collection(db, "models");

  return {
    provide: {
      db,
      modelsRef,
    },
  };
});