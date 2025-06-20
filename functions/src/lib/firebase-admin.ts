//NEVER IMPORT IN A CLIENT SIDE FILE

const isServer = typeof window === 'undefined';

if (!isServer) {
  throw new Error('Firebase Admin must not be initialized on the client-side.');
}

const admin = require('firebase-admin');
const serviceAccount = require('../../inceptionai-61b20-firebase-adminsdk-walwf-0253a7603b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import { initializeApp, App, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

serviceAccount.private_key = process.env.DB_FIREBASE_ADMIN_PRIVATE_KEY; //(process.env.DB_FIREBASE_ADMIN_PRIVATE_KEY as string).replace(/\\n/g, '\n');

// Import only what you need from the Firebase SDK for Firebase

//If App doesn't exist, initialize one
const app: App = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
      databaseURL: 'https://wonkasite-d43b5.firebaseio.com',
    });

export const dbAdmin: Firestore = getFirestore(app);

export const bucket = getStorage(app).bucket('gs://inceptionai-61b20.appspot.com');

export const auth = admin.auth();
