// src/components/Settings/Settings.js
import React, { useState, useEffect, useContext } from 'react';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { ThemeContext } from '../../context/ThemeContext';
import styles from './Settings.module.css';

const Settings = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklySummaries: true,
    });
    const [privacy, setPrivacy] = useState({
        profileVisible: true,
        dataSharing: false,
    });
    const [fontSize, setFontSize] = useState('medium');
    const [settingsFeedback, setSettingsFeedback] = useState('');
    const [feedback, setFeedback] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (auth.currentUser) {
                const userSettingsRef = doc(db, 'userSettings', auth.currentUser.uid);
                try {
                    const settingsSnap = await getDoc(userSettingsRef);
                    if (settingsSnap.exists()) {
                        const userData = settingsSnap.data();
                        setNotifications(userData.notifications || notifications);
                        setPrivacy(userData.privacy || privacy);
                        setFontSize(userData.fontSize || fontSize);
                        document.documentElement.style.fontSize =
                            userData.fontSize === 'large' ? '18px' :
                                userData.fontSize === 'medium' ? '16px' : '14px';
                    } else {
                        await setDoc(userSettingsRef, {
                            notifications,
                            privacy,
                            theme,
                            fontSize,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user settings: ", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchSettings();
    }, [auth.currentUser]);

    const handleSaveSettings = async () => {
        if (auth.currentUser) {
            const userSettingsRef = doc(db, 'userSettings', auth.currentUser.uid);
            try {
                await updateDoc(userSettingsRef, {
                    notifications,
                    privacy,
                    theme,
                    fontSize,
                });
                setSettingsFeedback('Settings updated successfully.');
                setUnsavedChanges(false);
                setTimeout(() => setSettingsFeedback(''), 3000);
            } catch (error) {
                console.error('Error saving settings:', error);
                setSettingsFeedback('Error saving settings. Please try again.');
                setTimeout(() => setSettingsFeedback(''), 3000);
            }
        }
    };

    const handleNotificationChange = (type) => {
        setNotifications((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
        setUnsavedChanges(true);
    };

    const handlePrivacyChange = (type) => {
        setPrivacy((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
        setUnsavedChanges(true);
    };

    const handleFontSizeChange = (e) => {
        const newFontSize = e.target.value;
        setFontSize(newFontSize);
        document.documentElement.style.fontSize =
            newFontSize === 'large' ? '18px' :
                newFontSize === 'medium' ? '16px' : '14px';
        setUnsavedChanges(true);
    };

    const handleFeedbackSubmit = async () => {
        if (feedback.trim()) {
            try {
                const feedbackRef = collection(db, 'appFeedback');
                await addDoc(feedbackRef, {
                    feedback,
                    userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
                    timestamp: new Date(),
                });
                setFeedbackMessage('Thank you for your feedback!');
                setFeedback('');
                setTimeout(() => setFeedbackMessage(''), 3000);
            } catch (error) {
                console.error('Error submitting feedback:', error);
                setFeedbackMessage('Error submitting feedback. Please try again.');
                setTimeout(() => setFeedbackMessage(''), 3000);
            }
        }
    };

    return (
        <div className={`${styles.settingsContainer} ${theme === 'dark' ? styles.dark : styles.light}`}>
            <h2 className={styles.header}>Settings</h2>
            {settingsFeedback && (
                <div className={styles.feedbackPopup}>
                    <p>{settingsFeedback}</p>
                </div>
            )}
            {loading ? (
                <p>Loading settings...</p>
            ) : (
                <>
                    <div className={styles.section}>
                        <h3 className={styles.sectionHeader}>Notification Preferences</h3>
                        <div className={styles.settingsOptions}>
                            <label className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={notifications.emailNotifications}
                                    onChange={() => handleNotificationChange('emailNotifications')}
                                />
                                Email Notifications
                            </label>
                            <label className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={notifications.pushNotifications}
                                    onChange={() => handleNotificationChange('pushNotifications')}
                                />
                                Push Notifications
                            </label>
                            <label className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={notifications.weeklySummaries}
                                    onChange={() => handleNotificationChange('weeklySummaries')}
                                />
                                Weekly Summaries
                            </label>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionHeader}>Privacy Settings</h3>
                        <div className={styles.settingsOptions}>
                            <label className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={privacy.profileVisible}
                                    onChange={() => handlePrivacyChange('profileVisible')}
                                />
                                Profile Visible to Others
                            </label>
                            <label className={styles.checkboxField}>
                                <input
                                    type="checkbox"
                                    checked={privacy.dataSharing}
                                    onChange={() => handlePrivacyChange('dataSharing')}
                                />
                                Allow Data Sharing for Research
                            </label>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionHeader}>Theme & Appearance</h3>
                        <div className={styles.settingsOptions}>
                            <button onClick={toggleTheme} className={styles.toggleThemeButton}>
                                {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            </button>
                            <select value={fontSize} onChange={handleFontSizeChange} className={styles.selectField}>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionHeader}>Feedback</h3>
                        <textarea
                            className={styles.feedbackInput}
                            placeholder="Share your feedback..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button onClick={handleFeedbackSubmit} className={styles.submitFeedbackButton}>
                            Submit Feedback
                        </button>
                        {feedbackMessage && <p className={styles.feedbackMessage}>{feedbackMessage}</p>}
                    </div>

                    {unsavedChanges && (
                        <div className={styles.saveButtonContainer}>
                            <button onClick={handleSaveSettings} className={styles.saveSettingsButton}>
                                Save Changes
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Settings;
