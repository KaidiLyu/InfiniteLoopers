//@ts-ignore
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Configuration Module
 * 
 * This module initializes Firebase services used throughout the application:
 * - Firebase Authentication with React Native persistence
 * - Firestore database for storing user data and food records
 * - Firebase Storage for storing profile images
 */

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/**
 * Firebase configuration object containing API keys and project identifiers
 * These values are specific to the AI Nutritional Search project Firebase instance
 */
const firebaseConfig = {
  apiKey: "AIzaSyBrm1soUPhQksvGQx-bUC-gay3dTNkdUYk",
  authDomain: "ai-nutritional-search-535e3.firebaseapp.com",
  projectId: "ai-nutritional-search-535e3",
  storageBucket: "ai-nutritional-search-535e3.firebasestorage.app",
  messagingSenderId: "131598266540",
  appId: "1:131598266540:web:d7b0a213409a8b3a22af09",
  measurementId: "G-PDYCEGNGWJ",
};

// Initialize Firebase app with the provided configuration
export const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication with AsyncStorage persistence
 * This allows the user to stay logged in even when the app is closed
 */
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize and export Firestore database instance
export const db = getFirestore(app);

// Initialize and export Firebase Storage instance for storing images
export const storage = getStorage(app);
