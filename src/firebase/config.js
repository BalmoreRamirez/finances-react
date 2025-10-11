// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNsqGh41yB1mEODhjdicSRdz6NGeDLxZc",
  authDomain: "financesapp-4d454.firebaseapp.com",
  projectId: "financesapp-4d454",
  storageBucket: "financesapp-4d454.firebasestorage.app",
  messagingSenderId: "194210663985",
  appId: "1:194210663985:web:11444de3fe7f4d6aa94f10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom settings
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // Ayuda con problemas de conexión
});

// Initialize Auth
export const auth = getAuth(app);
