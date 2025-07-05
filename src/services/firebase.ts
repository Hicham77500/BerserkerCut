/**
 * Configuration Firebase pour BerserkerCut
 */

import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuration Firebase - À remplacer par vos vraies clés
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "your-api-key",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "berserkercut-app.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "berserkercut-app",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "berserkercut-app.appspot.com",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "123456789",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;
