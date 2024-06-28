// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYmzECnDONQlZRg6ca0l6WXtRtE9XBCqM",
  authDomain: "find-one-67989.firebaseapp.com",
  projectId: "find-one-67989",
  storageBucket: "find-one-67989.appspot.com",
  messagingSenderId: "724810917555",
  appId: "1:724810917555:web:81e03f6448b96fed1672c6",
  measurementId: "G-5JQYD2JF9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);