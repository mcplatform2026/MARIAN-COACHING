import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDpL26jtZF_9AuYgCHJkk2B5Gwjy6xjV2k",
  authDomain: "marian-coaching.firebaseapp.com",
  projectId: "marian-coaching",
  storageBucket: "marian-coaching.firebasestorage.app",
  messagingSenderId: "876483735447",
  appId: "1:876483735447:web:8b2c3a1495d4ff25be9ed2",
  measurementId: "G-74R6R2CTGZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Explicitly configure local persistence so users stay logged in across sessions, days, and page refreshes
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Could not set auth persistence to browserLocalPersistence:", err);
});

export const db = getFirestore(app);

export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence).catch(() => {});
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    try {
      localStorage.removeItem('marian_coaching_auth_active');
    } catch {}
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
