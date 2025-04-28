import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import styles from './EmotionHistory.module.css';
import chartImage from '../../images/chart_emotion.jpg';
import { ThemeContext } from '../../context/ThemeContext';

const emotionsList = [
    { label: 'Happy', icon: '😊' },
    { label: 'Sad', icon: '😢' },
    { label: 'Angry', icon: '😡' },
    { label: 'Excited', icon: '😆' },
    { label: 'Anxious', icon: '😰' },
    { label: 'Confused', icon: '😕' },
    { label: 'Tired', icon: '😴' },
    { label: 'Relaxed', icon: '😌' },
    { label: 'Surprised', icon: '😲' },
    { label: 'Disappointed', icon: '😞' },
    { label: 'Grateful', icon: '🙏' },
    { label: 'Bored', icon: '😐' },
    { label: 'In Love', icon: '😍' },
    { label: 'Scared', icon: '😱' },
    { label: 'Frustrated', icon: '😤' },
    { label: 'Proud', icon: '😌' },
];

const getEmotionIcon = (emotionLabel) => {
    const emotion = emotionsList.find((item) => item.label === emotionLabel);
    return emotion ? emotion.icon : '🙂';
};

const EmotionHistory = React.memo(() => {
    const [emotions, setEmotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'emotions'),
            where("userId", "==", auth.currentUser.uid),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Adding a delay to simulate smooth loading experience
            setTimeout(() => {
                setEmotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            }, 1000);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className={`${styles.emotionInputContainer} ${ThemeContext === 'dark' ? styles.dark : styles.light}`}>
        <div className={styles.historyContainer}>
            <h2>Your Emotion History</h2>
            <div className={styles.contentWrapper}>
                {loading ? (
                    <ul className={styles.historyList}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <li key={index} className={`${styles.historyItem} ${styles.skeleton}`}>
                                <div className={styles.skeletonIcon}></div>
                                <div className={styles.skeletonText}></div>
                                <div className={styles.skeletonDate}></div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        {emotions.length > 0 ? (
                            <ul className={styles.historyList}>
                                {emotions.map((emotion) => (
                                    <li key={emotion.id} className={styles.historyItem}>
                                        <span className={styles.emotionIcon}>{getEmotionIcon(emotion.emotion)}</span>
                                        <span className={styles.emotion}>{emotion.emotion}</span>
                                        <span className={styles.date}>
                                            {new Date(emotion.timestamp?.toDate()).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.noDataMessage}>
                                <p>No emotions recorded yet. Start logging your emotions today to see them here!</p>
                                <img src={chartImage} alt="Emotion Chart" className={styles.placeholderImage} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
        </div>
    );
});

export default EmotionHistory;
