import React, { useEffect, useState, useMemo } from 'react';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import 'chart.js/auto';
import { Bar, Line, Pie } from 'react-chartjs-2';
import styles from './EmotionInsights.module.css';
import { ThemeContext } from '../../context/ThemeContext';

const EmotionInsights = React.memo(() => {
    const [emotionTrends, setEmotionTrends] = useState({});
    const [emotionDistribution, setEmotionDistribution] = useState({});
    const [emotionFrequency, setEmotionFrequency] = useState({});
    const [emotionNotes, setEmotionNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmotions = async () => {
            setLoading(true);
            if (!auth.currentUser) {
                setError("User not authenticated");
                setLoading(false);
                return;
            }
            try {
                const emotionsRef = collection(db, 'emotions');
                const q = query(emotionsRef, where("userId", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);

                const trends = {};
                const distribution = {};
                const frequency = {};
                const notes = {};

                querySnapshot.forEach((doc) => {
                    const { emotion, timestamp, notes: emotionNote } = doc.data();
                    const date = new Date(timestamp?.toDate()).toLocaleDateString();

                    if (!trends[emotion]) trends[emotion] = [];
                    trends[emotion].push(date);

                    distribution[emotion] = (distribution[emotion] || 0) + 1;

                    if (!frequency[date]) frequency[date] = {};
                    frequency[date][emotion] = (frequency[date][emotion] || 0) + 1;

                    if (!notes[date]) notes[date] = {};
                    notes[date][emotion] = emotionNote || '';
                });
                setTimeout(() => {
                    setEmotionTrends(trends);
                    setEmotionDistribution(distribution);
                    setEmotionFrequency(frequency);
                    setEmotionNotes(notes);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error fetching emotions: ", error);
                setError("Failed to fetch emotion data.");
                setLoading(false);
            }
        };

        fetchEmotions();
    }, []);

    const exportEmotionData = () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Emotion,Count,Notes\n";
        Object.keys(emotionFrequency).forEach(date => {
            Object.entries(emotionFrequency[date]).forEach(([emotion, count]) => {
                const note = emotionNotes[date] && emotionNotes[date][emotion] ? emotionNotes[date][emotion] : "";
                csvContent += `${date},${emotion},${count},"${note}"\n`;
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "emotion_data_with_notes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const streak = useMemo(() => {
        const dates = Object.keys(emotionFrequency).sort((a, b) => new Date(b) - new Date(a));
        let currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const previousDate = new Date(dates[i - 1]);
            if (currentDate.getTime() === previousDate.getTime() - 86400000) {
                currentStreak++;
            } else {
                break;
            }
        }
        return currentStreak;
    }, [emotionFrequency]);

    const weeklyComparison = useMemo(() => {
        const currentWeek = {};
        const lastWeek = {};
        const now = new Date();
        const dayInMs = 86400000;
        const currentWeekStart = new Date(now.getTime() - (now.getDay() * dayInMs));
        const lastWeekStart = new Date(currentWeekStart.getTime() - 7 * dayInMs);

        if (!emotionFrequency || Object.keys(emotionFrequency).length === 0) {
            return null;
        }

        Object.keys(emotionFrequency).forEach((date) => {
            const emotionDate = new Date(date);
            if (emotionDate >= currentWeekStart) {
                Object.entries(emotionFrequency[date]).forEach(([emotion, count]) => {
                    currentWeek[emotion] = (currentWeek[emotion] || 0) + count;
                });
            } else if (emotionDate >= lastWeekStart && emotionDate < currentWeekStart) {
                Object.entries(emotionFrequency[date]).forEach(([emotion, count]) => {
                    lastWeek[emotion] = (lastWeek[emotion] || 0) + count;
                });
            }
        });

        const comparison = {};
        Object.keys(currentWeek).forEach((emotion) => {
            const current = currentWeek[emotion] || 0;
            const previous = lastWeek[emotion] || 0;
            const percentageChange = previous ? ((current - previous) / previous) * 100 : 100;
            comparison[emotion] = `${percentageChange >= 0 ? "+" : ""}${Math.round(percentageChange)}%`;
        });

        return Object.keys(comparison).length > 0 ? comparison : null;
    }, [emotionFrequency]);

    const topEmotions = useMemo(() => {
        return Object.entries(emotionDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [emotionDistribution]);

    const frequentEmotion = useMemo(() => {
        return Object.keys(emotionDistribution).find(emotion => emotionDistribution[emotion] > 3);
    }, [emotionDistribution]);

    const lineData = useMemo(() => ({
        labels: Object.keys(emotionFrequency),
        datasets: Object.keys(emotionTrends).map((emotion, index) => ({
            label: emotion,
            data: Object.values(emotionFrequency).map(day => day[emotion] || 0),
            borderColor: `hsl(${index * 50}, 70%, 50%)`,
            fill: false,
        })),
    }), [emotionFrequency, emotionTrends]);

    const pieData = useMemo(() => ({
        labels: Object.keys(emotionDistribution),
        datasets: [{
            data: Object.values(emotionDistribution),
            backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff'],
        }],
    }), [emotionDistribution]);

    const barData = useMemo(() => ({
        labels: Object.keys(emotionFrequency),
        datasets: Object.keys(emotionTrends).map((emotion, index) => ({
            label: emotion,
            data: Object.keys(emotionFrequency).map(date => emotionFrequency[date][emotion] || 0),
            backgroundColor: `hsl(${index * 50}, 70%, 70%)`,
        })),
    }), [emotionFrequency, emotionTrends]);

    return (
        <div className={`${styles.emotionInputContainer} ${ThemeContext === 'dark' ? styles.dark : styles.light}`}>
            <div className={styles.insightsContainer}>
                {loading ? (
                    <p className={styles.loadingMessage}>Loading insights, please wait...</p>
                ) : (
                    <>
                        <h2>Emotion Insights</h2>
                        <button onClick={exportEmotionData} className={styles.exportButton}>Export Emotion Data with Notes</button>

                        <p className={styles.streakInfo}>
                            {streak > 1 ? `You are on a ${streak}-day emotion logging streak! 🎉` : 'Start logging daily to build your streak!'}
                        </p>

                        <p className={styles.weeklyComparison}>
                            <strong>This week vs Last week:</strong>
                            {weeklyComparison ? (
                                Object.entries(weeklyComparison).map(([emotion, change]) => (
                                    <span key={emotion} className={styles.comparisonItem}>
                                    {emotion}: {change}
                                </span>
                                ))
                            ) : (
                                <span> Not enough data to compare.</span>
                            )}
                        </p>

                        <p className={styles.topEmotions}>
                            <strong>Your Top Emotions:</strong>
                            {topEmotions.map(([emotion, count]) => (
                                <span key={emotion} className={styles.topEmotion}>
                                {emotion}: {count} times
                            </span>
                            ))}
                        </p>

                        <p className={styles.tips}>
                            {frequentEmotion ? (
                                `It seems you've been feeling ${frequentEmotion} frequently. Consider engaging in relaxing activities or practicing mindfulness.`
                            ) : (
                                'Log your emotions regularly to receive personalized insights and tips!'
                            )}
                        </p>

                        <div className={styles.chartRow}>
                            <div className={styles.chartBox}>
                                <Line data={lineData} options={{responsive: true}}/>
                                <p className={styles.chartDescription}>This chart shows how your emotions vary over time.</p>
                            </div>
                            <div className={styles.chartBox}>
                                <Pie data={pieData} options={{responsive: true}}/>
                                <p className={styles.chartDescription}>This chart represents the distribution of each emotion.</p>
                            </div>
                            <div className={styles.chartBox}>
                                <Bar data={barData} options={{responsive: true}}/>
                                <p className={styles.chartDescription}>This chart shows how frequently each emotion was logged daily.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default EmotionInsights;
