// src/Firestore.js
import { db } from './firebaseConfig';
import {collection, addDoc, getDocs, serverTimestamp} from 'firebase/firestore';

export const addEmotion = (emotion, notes) => {
    const emotionsCollection = collection(db, 'emotions');
    return addDoc(emotionsCollection, {
        emotion,
        notes,
        timestamp: serverTimestamp(),
    });
};

// Function to get all emotions
export const getEmotions = async () => {
    const emotionsCollection = collection(db, 'emotions');
    const emotionsSnapshot = await getDocs(emotionsCollection);
    return emotionsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};