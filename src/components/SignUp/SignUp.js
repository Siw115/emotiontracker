// src/SignUp.js
import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from './SignUp.module.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client');
    const [error, setError] = useState(null);

    const handleSignUp = async () => {
        try {
            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Save user data to Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email,
                role,
            });

            alert("User signed up successfully!");
            setEmail('');
            setPassword('');
            setRole('client');
            setError(null);
        } catch (error) {
            handleAuthError(error.code);
        }
    };

    const handleAuthError = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                setError('This email is already in use. Please use a different email or sign in.');
                break;
            case 'auth/invalid-email':
                setError('The email address is invalid. Please enter a valid email address.');
                break;
            case 'auth/operation-not-allowed':
                setError('Signing up with email and password is not enabled. Contact support.');
                break;
            case 'auth/weak-password':
                setError('Password is too weak. Please use a password with at least 6 characters.');
                break;
            default:
                setError('An unknown error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <h1>Emotion Tracker</h1>
            <h2 className={styles.title}>Sign Up</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.select}
            >
                <option value="client">Client</option>
                <option value="caregiver">Caregiver</option>
            </select>
            <button onClick={handleSignUp} className={styles.button}>Sign Up</button>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default SignUp;
