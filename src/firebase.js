import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_KEY,
    authDomain: "ai-typing-test.firebaseapp.com",
    projectId: "ai-typing-test",
    storageBucket: "ai-typing-test.appspot.com",
    messagingSenderId: "955220542789",
    appId: "1:955220542789:web:3eb11dacaa8999ef502a2c",
    measurementId: "G-7W4F68X03Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export const firebaseFunctionsKey = import.meta.env.VITE_FIREBASE_FUNCTIONS_KEY;
