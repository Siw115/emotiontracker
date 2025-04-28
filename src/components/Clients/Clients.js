import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import "./Clients.module.css"; // Assuming you add some custom styles here

const Clients = () => {
    const [emotions, setEmotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmotions = async () => {
            try {
                const emotionsSnapshot = await getDocs(collection(db, "emotions"));
                const emotionsData = [];

                for (const emotionDoc of emotionsSnapshot.docs) {
                    const emotion = emotionDoc.data();
                    const userId = emotion.userId;

                    // Convert Firestore timestamp to JavaScript Date
                    const timestamp = emotion.timestamp?.toDate
                        ? emotion.timestamp.toDate()
                        : "Unknown";

                    // Fetch the user's name
                    const userDoc = await getDoc(doc(db, "users", userId));
                    const userName = userDoc.exists() ? userDoc.data().name : "Unknown";

                    emotionsData.push({ ...emotion, userName, timestamp });
                }

                setEmotions(emotionsData);
            } catch (error) {
                console.error("Error fetching emotions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmotions();
    }, []);

    return (
        <div className="clients-container">
            <h2 className="clients-title">Client Emotions</h2>
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : (
                <div className="emotions-list">
                    {emotions.map((emotion, index) => (
                        <div key={index} className="emotion-card">
                            <p><strong>Emotion:</strong> {emotion.emotion}</p>
                            <p><strong>Notes:</strong> {emotion.notes || "No Notes"}</p>
                            <p>
                                <strong>Date:</strong>{" "}
                                {emotion.timestamp !== "Unknown" ? emotion.timestamp.toLocaleString() : "No Timestamp"}
                            </p>
                            <p><strong>Client Name:</strong> {emotion.userName}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Clients;
