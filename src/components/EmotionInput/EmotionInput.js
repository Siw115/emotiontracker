import React, {useState, useEffect, useCallback, useContext} from 'react';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import styles from './EmotionInput.module.css';
import {ThemeContext} from "../../context/ThemeContext";

const EmotionInput = React.memo(() => {
    const [emotion, setEmotion] = useState('');
    const [notes, setNotes] = useState('');
    const [feedback, setFeedback] = useState('');
    const [currentEmotionDocId, setCurrentEmotionDocId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notesSaved, setNotesSaved] = useState(true);
    const { theme } = useContext(ThemeContext);

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

    const tips = {
        Happy: 'Enjoy this moment. Try to think about what makes you feel happy and do more of it.',
        Sad: 'It’s okay to feel sad. Consider talking to someone you trust or writing down your feelings.',
        Angry: 'Take a moment to breathe deeply. Count to ten and think about what makes you feel angry.',
        Excited: 'Use this energy to do something you love, like a hobby or spending time with a friend.',
        Anxious: 'Find a quiet space. Practice deep breathing: breathe in for 4 seconds, hold for 4, and breathe out for 4.',
        Confused: 'It’s alright to feel confused. Try breaking the situation down into smaller parts to understand better.',
        Tired: 'Rest is important. Try to find a comfortable place to relax, and consider a short nap if possible.',
        Relaxed: 'Enjoy this feeling. You might listen to calming music or do something peaceful like reading.',
        Surprised: 'Think about what surprised you. It might help to share your feelings with someone who understands.',
        Disappointed: 'Allow yourself to feel disappointed. Consider what you can learn from this experience and how you can cope.',
        Grateful: 'Think of one thing you are grateful for and take a moment to appreciate it. You could share this with someone too.',
        Bored: 'Try a new activity that interests you or revisit an old hobby that you enjoyed before.',
        'In Love': 'Focus on what makes you feel loved. Share your feelings with someone special or express them creatively.',
        Scared: 'Acknowledge your fear and try to identify what specifically scares you. Talk it through with someone you trust.',
        Frustrated: 'Take a break and step away from the situation. Find a comforting activity to distract yourself for a bit.',
        Proud: 'Reflect on what you did that made you proud. Consider sharing this achievement with someone who would celebrate it with you.',
    };

    useEffect(() => {
        const fetchEmotionForToday = async () => {
            const startOfDay = Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
            try {
                const emotionsRef = collection(db, 'emotions');
                const q = query(
                    emotionsRef,
                    where("userId", "==", auth.currentUser.uid),
                    where("timestamp", ">=", startOfDay)
                );

                const querySnapshot = await getDocs(q);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for a more natural loading experience

                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0];
                    setEmotion(docData.data().emotion);
                    setNotes(docData.data().notes || '');
                    setCurrentEmotionDocId(docData.id);
                    setNotesSaved(true);
                }
            } catch (error) {
                console.error("Error fetching emotion for today: ", error);
            } finally {
                setTimeout(() => setLoading(false), 1000); // Additional delay for smoother loading
            }
        };

        fetchEmotionForToday();
    }, []);

    const handleEmotionSelect = useCallback(async (selectedEmotion) => {
        if (currentEmotionDocId) {
            setFeedback(`You've already logged an emotion today: "${emotion}". Delete it first to add a new one.`);
            return;
        }

        try {
            const emotionsRef = collection(db, 'emotions');
            const newDoc = await addDoc(emotionsRef, {
                emotion: selectedEmotion,
                notes,
                timestamp: serverTimestamp(),
                userId: auth.currentUser.uid
            });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for better UX when saving emotion
            setEmotion(selectedEmotion);
            setCurrentEmotionDocId(newDoc.id);
            setFeedback(`Emotion "${selectedEmotion}" recorded!`);
            setNotesSaved(true);
            setTimeout(() => setFeedback(''), 3000);
        } catch (error) {
            console.error("Error saving emotion: ", error);
        }
    }, [currentEmotionDocId, emotion, notes]);

    const handleDeleteEmotion = useCallback(async () => {
        try {
            if (currentEmotionDocId) {
                const emotionDocRef = doc(db, 'emotions', currentEmotionDocId);
                await deleteDoc(emotionDocRef);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for a smoother deletion experience
                setEmotion('');
                setNotes('');
                setCurrentEmotionDocId(null);
                setFeedback("Emotion entry deleted. You can log a new emotion.");
                setNotesSaved(true);
                setTimeout(() => setFeedback(''), 3000);
            }
        } catch (error) {
            console.error("Error deleting emotion: ", error);
        }
    }, [currentEmotionDocId]);

    const handleSaveNotes = useCallback(async () => {
        if (currentEmotionDocId) {
            try {
                const emotionDocRef = doc(db, 'emotions', currentEmotionDocId);
                await updateDoc(emotionDocRef, { notes });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for better UX when saving notes
                setFeedback("Your notes have been saved.");
                setNotesSaved(true);
                setTimeout(() => setFeedback(''), 3000);
            } catch (error) {
                console.error("Error saving notes: ", error);
            }
        } else {
            setFeedback("No emotion logged for today to save notes.");
            setTimeout(() => setFeedback(''), 3000);
        }
    }, [currentEmotionDocId, notes]);

    const handleDeleteNotes = useCallback(async () => {
        if (currentEmotionDocId) {
            try {
                const emotionDocRef = doc(db, 'emotions', currentEmotionDocId);
                await updateDoc(emotionDocRef, { notes: '' });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for better UX during note deletion
                setNotes('');
                setNotesSaved(true);
                setFeedback("Your notes have been deleted.");
                setTimeout(() => setFeedback(''), 3000);
            } catch (error) {
                console.error("Error deleting notes: ", error);
            }
        } else {
            setFeedback("No emotion logged for today to delete notes.");
            setTimeout(() => setFeedback(''), 3000);
        }
    }, [currentEmotionDocId]);

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        setNotesSaved(false);
    };

    return (
        <div className={`${styles.emotionInputContainer} ${theme === 'dark' ? styles.dark : styles.light}`}>
        <div className={styles.container}>
            {feedback && (
                <div className={styles.feedbackPopup}>
                    <p className={styles.feedbackText} aria-live="polite">{feedback}</p>
                </div>
            )}
            <h2>How are you feeling today?</h2>
            <p className={styles.guidance}>Select an emotion below to log how you’re feeling. You can log only one emotion per day.</p>
            {loading ? (
                <p className={styles.loading}>Checking today's emotion...</p>
            ) : (
                <>
                    {emotion ? (
                        <div className={styles.loggedEmotion}>
                            <p>You logged: <strong>{emotion}</strong></p>
                            <p>Your Notes: {notes}</p>
                            <div>
                                <button onClick={handleDeleteEmotion} className={styles.deleteButton}>Delete Emotion</button>
                                <button onClick={handleSaveNotes} className={styles.saveNotesButton} disabled={notesSaved}>Update Notes</button>
                                <button onClick={handleDeleteNotes} className={styles.deleteNotesButton}>Delete Notes</button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emotionGrid}>
                            {emotionsList.map((emotionObj) => (
                                <button
                                    key={emotionObj.label}
                                    onClick={() => handleEmotionSelect(emotionObj.label)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEmotionSelect(emotionObj.label)}
                                    aria-label={emotionObj.label}
                                    className={`${styles.emotionButton} ${styles[emotionObj.label.toLowerCase()]}`}
                                >
                                    <span role="img" aria-label={emotionObj.label} className={styles.emoji}>
                                        {emotionObj.icon}
                                    </span>
                                    <span className={styles.emotionLabel}>{emotionObj.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className={styles.notesContainer}>
                <h3>Daily Notes:</h3>
                <textarea
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Write your thoughts here..."
                    className={styles.notesTextarea}
                />
            </div>

            <div className={styles.resources}>
                <h3>Helpful Resources</h3>
                <ul>
                    <li><a href="https://www.bridgecareaba.com/blog/autism-emotions" target="_blank" rel="noopener noreferrer">Understanding Autism Emotions: A Comprehensive Guide</a></li>
                    <li><a href="https://mindwellnyc.com/the-ultimate-guide-to-understanding-your-feelings-emotions-for-2022/" target="_blank" rel="noopener noreferrer">The Ultimate Guide to Understanding Your Feelings & Emotions</a></li>
                    <li><a href="https://positivepsychology.com/understanding-emotions/" target="_blank" rel="noopener noreferrer">Understanding Emotions: 15 Ways to Identify Your Feelings</a></li>
                </ul>
            </div>

            <div className={styles.tips}>
                <h3>Tips for Each Emotion</h3>
                {emotionsList.map((emotionObj) => (
                    <div className={styles.tip} key={emotionObj.label}>
                        <strong>{emotionObj.label}:</strong>
                        <p>{tips[emotionObj.label]}</p>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
});

export default EmotionInput;
