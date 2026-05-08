// ─────────────────────────────────────────────────────────────
//  SKYCAST — Firebase Configuration
//  
//  HOW TO SET UP (free, no credit card needed):
//
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → give it a name → Continue
//  3. Disable Google Analytics (optional) → Create project
//  4. Click the "</>" Web icon to register your app
//  5. Give it a nickname → Register app
//  6. COPY the firebaseConfig object below and paste here
//  7. In Firebase console → Authentication → Get Started
//  8. Click "Google" provider → Enable → Save
//  9. Add your domain to Authorized domains
//     (for localhost: already added by default)


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

import { getAnalytics } from "firebase/analytics";

// ⬇️  REPLACE THIS WITH YOUR OWN firebaseConfig from Firebase Console
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
