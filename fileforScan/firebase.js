// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
//const { getAnalytics } = require("firebase/analytics");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyD-AWAfpguCayLoAif85QC_f53_jU-58A8",
  authDomain: "project-tuitionclass.firebaseapp.com",
  projectId: "project-tuitionclass",
  storageBucket: "project-tuitionclass.appspot.com",
  messagingSenderId: "916988210112",
  appId: "1:916988210112:web:8390e95aff1a2aef9ab625",
  measurementId: "G-SNNN8K3NS8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

const storage = getStorage(app);

module.exports = { storage }; // Export an object with 'storage' property
