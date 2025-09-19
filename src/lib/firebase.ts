// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-4915696253-c9f72",
  "appId": "1:1008659312641:web:ca7dec9099b3e23a5f9000",
  "apiKey": "AIzaSyDC8UxZn7k9QCARXNFstYz2FNzsKVNc_WQ",
  "authDomain": "studio-4915696253-c9f72.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1008659312641"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
