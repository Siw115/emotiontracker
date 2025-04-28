// src/components/SignIn.js
import React, { useState } from 'react';
import { signIn } from '../../Auth';
import styles from './SignIn.module.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignIn = async () => {
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        try {
            await signIn(email, password);
            alert("User signed in successfully!");
            setEmail('');
            setPassword('');
            setError(null);
        } catch (error) {
            handleAuthError(error.code);
        }
    };

    const handleAuthError = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                setError('Invalid email format. Please enter a valid email address.');
                break;
            case 'auth/user-disabled':
                setError('This account has been disabled. Please contact support.');
                break;
            case 'auth/user-not-found':
                setError('No account found with this email. Please check your email or sign up.');
                break;
            case 'auth/wrong-password':
                setError('Incorrect password. Please try again.');
                break;
            case 'auth/too-many-requests':
                setError('Too many failed attempts. Please try again later or reset your password.');
                break;
            default:
                setError('An unknown error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <h1>Emotion Tracker</h1>
            <h2 className={styles.title}>Sign In</h2>
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
            <button onClick={handleSignIn} className={styles.button}>Sign In</button>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default SignIn;
