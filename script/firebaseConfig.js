// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


import { getFirestore, collection, addDoc, getDocs,getDoc,doc,query,where,deleteDoc } from "firebase/firestore"; // Importing firestore functions

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTiqLojpv_yN4GqnecYJo-2OWZoz3gT8E",
  authDomain: "evaluationform-f4f6a.firebaseapp.com",
  projectId: "evaluationform-f4f6a",
  storageBucket: "evaluationform-f4f6a.firebasestorage.app",
  messagingSenderId: "157960868087",
  appId: "1:157960868087:web:6302e90b9f71576768c3f2",
  measurementId: "G-XGWZGPW4HP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore methods
export { db, collection, addDoc, getDocs,getDoc,doc,query,where,deleteDoc };