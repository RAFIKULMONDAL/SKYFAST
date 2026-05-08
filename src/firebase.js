
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyBw23bYJg-LUw76XlELxugYwZA7vNDbZAM",
  authDomain: "sktfast-f4256.firebaseapp.com",
  projectId: "sktfast-f4256",
  storageBucket: "sktfast-f4256.firebasestorage.app",
  messagingSenderId: "386897204448",
  appId: "1:386897204448:web:923e0d3e831d482701ec85",
  measurementId: "G-HXHV3MBGL5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: 'select_account' });

export { auth, provider };

// Sign in with Google popup
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Sign out
export async function signOutUser() {
  await signOut(auth);
}

// Subscribe to auth state
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
