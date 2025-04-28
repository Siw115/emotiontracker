// src/components/SignOut/SignOut.js
import React from 'react';
import { logOut } from '../../Auth';
import styles from './SignOut.module.css'; // Import CSS module

const SignOut = () => {
    const handleSignOut = async () => {
        try {
            await logOut();
            alert("User signed out!");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <button onClick={handleSignOut} className={styles.button}>Sign Out</button>
        </div>
    );
};

export default SignOut;
