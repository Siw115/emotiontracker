import React, { useState, useEffect, useContext } from 'react';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import styles from './Profile.module.css';
import { ThemeContext } from '../../context/ThemeContext';

const Profile = ({ user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [profileUpdated, setProfileUpdated] = useState(true);
    const [passwordUpdated, setPasswordUpdated] = useState(true);
    const [emailUpdated, setEmailUpdated] = useState(true);
    const [showPasswords, setShowPasswords] = useState(false);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                try {
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setName(userData.name || '');
                        setEmail(user.email);
                        setBio(userData.bio || '');
                    } else {
                        await setDoc(userRef, {
                            name: 'Your Name',
                            bio: 'Add a short bio...',
                            email: user.email,
                        });
                        setName('Your Name');
                        setEmail(user.email);
                        setBio('Add a short bio...');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfileData();
    }, [user]);

    const handleSaveProfile = async () => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            try {
                await updateDoc(userRef, { name, bio });
                setFeedback('Profile updated successfully.');
                setProfileUpdated(true);
                setTimeout(() => setFeedback(''), 3000);
            } catch (error) {
                console.error('Error updating profile:', error);
                setFeedback('Error updating profile. Please try again.');
                setTimeout(() => setFeedback(''), 3000);
            }
        }
    };

    const handleEmailChange = async () => {
        if (email !== user.email && currentPassword) {
            try {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
                await updateEmail(user, email);
                setFeedback('Email updated successfully.');
                setEmailUpdated(true);
                setCurrentPassword('');
                setTimeout(() => setFeedback(''), 3000);
            } catch (error) {
                console.error('Error updating email:', error);
                setFeedback(error.code === 'auth/wrong-password' ? 'Incorrect current password.' : 'Error updating email. Please try again.');
                setTimeout(() => setFeedback(''), 3000);
            }
        } else {
            setFeedback('Please provide the current password to update your email.');
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword && currentPassword) {
            try {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                setFeedback('Password updated successfully.');
                setPasswordUpdated(true);
                setCurrentPassword('');
                setNewPassword('');
                setTimeout(() => setFeedback(''), 3000);
            } catch (error) {
                console.error('Error updating password:', error);
                setFeedback(error.code === 'auth/wrong-password' ? 'Incorrect current password.' : 'Error updating password. Please try again.');
                setTimeout(() => setFeedback(''), 3000);
            }
        } else {
            setFeedback('Please fill out both password fields.');
            setTimeout(() => setFeedback(''), 3000);
        }
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        setProfileUpdated(false);
    };

    const handleBioChange = (e) => {
        setBio(e.target.value);
        setProfileUpdated(false);
    };

    const handleEmailInputChange = (e) => {
        setEmail(e.target.value);
        setEmailUpdated(false);
    };

    const handleCurrentPasswordChange = (e) => {
        setCurrentPassword(e.target.value);
        setPasswordUpdated(false);
        setEmailUpdated(false);
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        setPasswordUpdated(false);
    };

    const togglePasswordVisibility = () => {
        setShowPasswords((prev) => !prev);
    };

    return (
        <div className={`${styles.profileContainer} ${theme === 'dark' ? styles.dark : styles.light}`}>
            <div className={styles.container}>
                {loading ? (
                    <p className={styles.loading}>Loading profile...</p>
                ) : (
                    <>
                        {feedback && (
                            <div className={styles.feedbackPopup}>
                                <p className={styles.feedbackText} aria-live="polite">{feedback}</p>
                            </div>
                        )}
                        <h2>Profile Page</h2>
                        <div className={styles.profileSection}>
                            <h3>Profile Information</h3>
                            <div className={styles.profileField}>
                                <label htmlFor="name">Name:</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className={styles.profileField}>
                                <label htmlFor="email">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailInputChange}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className={styles.profileField}>
                                <label htmlFor="bio">Bio:</label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={handleBioChange}
                                    className={styles.textArea}
                                />
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                className={styles.saveProfileButton}
                                disabled={profileUpdated}
                            >
                                Save Profile
                            </button>
                            <button
                                onClick={handleEmailChange}
                                className={styles.saveProfileButton}
                                disabled={emailUpdated}
                            >
                                Update Email
                            </button>
                        </div>
                        <div className={styles.profileSection}>
                            <h3>Change Password</h3>
                            <div className={styles.profileField}>
                                <label htmlFor="currentPassword">Current Password:</label>
                                <input
                                    id="currentPassword"
                                    type={showPasswords ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={handleCurrentPasswordChange}
                                    className={styles.inputField}
                                />
                            </div>
                            <div className={styles.profileField}>
                                <label htmlFor="newPassword">New Password:</label>
                                <input
                                    id="newPassword"
                                    type={showPasswords ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                    className={styles.inputField}
                                />
                            </div>
                            <button onClick={togglePasswordVisibility} className={styles.togglePasswordButton}>
                                {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className={styles.saveProfileButton}
                                disabled={passwordUpdated}
                            >
                                Update Password
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
