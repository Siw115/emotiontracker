import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Sign Up Function with Role Assignment
export const signUp = async (email, password, role) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: role || 'client',
        });

        return user;
    } catch (error) {
        throw error;
    }
};

// Sign In Function
export const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Sign Out Function
export const logOut = () => {
    return signOut(auth);
};
