const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth, GoogleAuthProvider } = require('firebase/auth');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Client SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Admin SDK
let serviceAccount = null;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("Invalid FIREBASE_SERVICE_ACCOUNT format in .env");
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} else {
  console.warn("Firebase Admin not initialized due to missing service account");
}

const adminAuth = admin.auth();

// Export modules for usage in app
module.exports = {
  db,
  auth,
  googleProvider,
  adminAuth,
};
