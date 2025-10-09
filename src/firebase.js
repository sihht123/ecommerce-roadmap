// Import Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// REPLACE THIS with your config from Step 14!
const firebaseConfig = {
   apiKey: "AIzaSyBYL1uWE0BTZLtTn9ZXMih6qmfkbdYWJDA",
  authDomain: "ecommerce-roadmap.firebaseapp.com",
  projectId: "ecommerce-roadmap",
  storageBucket: "ecommerce-roadmap.firebasestorage.app",
  messagingSenderId: "994662930339",
  appId: "1:994662930339:web:b2779c6c06729883b66c16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);



// Export for use in other files
export { db, auth };