// Firebase Configuration
// TODO: Replace with your Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, query, orderByChild, equalTo, limitToLast } from 'firebase/database';

// Your web app's Firebase configuration
// Get these from: https://console.firebase.google.com/
// Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyD2YHUerAgPvjNWtPpuvoNnNJvLmNK-_8I",
  authDomain: "money-clicker-8ee62.firebaseapp.com",
  databaseURL: "https://money-clicker-8ee62-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "money-clicker-8ee62",
  storageBucket: "money-clicker-8ee62.firebasestorage.app",
  messagingSenderId: "1019362581052",
  appId: "1:1019362581052:web:d6e579c1308c1da66ac139",
  measurementId: "G-DK76CP057L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Database References
export const db = database;
export const dbRef = ref;
export const dbSet = set;
export const dbGet = get;
export const dbQuery = query;
export const dbOrderByChild = orderByChild;
export const dbEqualTo = equalTo;
export const dbLimitToLast = limitToLast;

export default app;
