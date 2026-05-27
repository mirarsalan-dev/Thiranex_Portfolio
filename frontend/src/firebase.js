import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB20tcGzKSyVK_48jhVMKJvAnW4DneXjeY",
  authDomain: "thiranex-portfolio-3feb1.firebaseapp.com",
  databaseURL: "https://thiranex-portfolio-3feb1-default-rtdb.firebaseio.com",
  projectId: "thiranex-portfolio-3feb1",
  storageBucket: "thiranex-portfolio-3feb1.firebasestorage.app",
  messagingSenderId: "116663862766",
  appId: "1:116663862766:web:ab662af78b3bb25667faff",
  measurementId: "G-20KR272Z96"
};  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);