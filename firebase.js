// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuPKBdmtXCDVH13izQWWPyxqhXuuDfpFg",
  authDomain: "inventory-management-3790f.firebaseapp.com",
  projectId: "inventory-management-3790f",
  storageBucket: "inventory-management-3790f.appspot.com",
  messagingSenderId: "79471207318",
  appId: "1:79471207318:web:5d2d09c78c43980a0ab3b7",
  measurementId: "G-R4VW905MZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export {firestore}
