import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgWabFznGiDfrJ0PE444FuHRVh6_dd5-M",
  authDomain: "surrogatedatabase.firebaseapp.com",
  projectId: "surrogatedatabase",
  storageBucket: "surrogatedatabase.firebasestorage.app",
  messagingSenderId: "849755742356",
  appId: "1:849755742356:web:fb3e50ce99386eeb15d481",
  measurementId: "G-WWRDS39MEL"
};

const app = initializeApp(firebaseConfig);

// Export services so they can be used throughout the app
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
