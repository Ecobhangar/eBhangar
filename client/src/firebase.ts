// client/src/lib/firebase.ts
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// ❗ Direct static values use karo — Firebase OTP modular env variables break karta hai
const firebaseConfig = {
  apiKey: "AIzaSyCLEnHodLazsZn_PLqwIuwvMAndVFZyg",
  authDomain: "ebhangar-4e9ac.firebaseapp.com",
  projectId: "ebhangar-4e9ac",
  storageBucket: "ebhangar-4e9ac.appspot.com",
  messagingSenderId: "336983550215",
  appId: "1:336983550215:web:0e51b5b9808bceacd7ba2",
  measurementId: "G-E3RDNXSHQC"
};

// Initialize
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// EXPORTS
export const auth = firebase.auth();
export const RecaptchaVerifier = firebase.auth.RecaptchaVerifier;
export const signInWithPhoneNumber = firebase.auth().signInWithPhoneNumber.bind(firebase.auth());

export default firebase;
