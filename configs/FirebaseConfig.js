//@ts-ignore
import { getReactNativePersistence } from "@firebase/auth/dist/rn/index.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrm1soUPhQksvGQx-bUC-gay3dTNkdUYk",
  authDomain: "ai-nutritional-search-535e3.firebaseapp.com",
  projectId: "ai-nutritional-search-535e3",
  storageBucket: "ai-nutritional-search-535e3.firebasestorage.app",
  messagingSenderId: "131598266540",
  appId: "1:131598266540:web:d7b0a213409a8b3a22af09",
  measurementId: "G-PDYCEGNGWJ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
