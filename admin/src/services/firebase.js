// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_IMG_API,
  authDomain: "kicksawa.firebaseapp.com",
  databaseURL:"gs://kicksawa.appspot.com",
  projectId: "kicksawa",
  storageBucket: "kicksawa.appspot.com",
  messagingSenderId: "286161810676",
  appId: "1:286161810676:web:cbcb00b2f3dfcda7579aa1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;