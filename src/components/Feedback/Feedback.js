import React, { useState } from 'react';
import styles from './Feedback.module.css';

const Feedback = () => {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (feedback.trim() === '') {
            alert('Please enter your feedback.');
            return;
        }
        // Here you can send the feedback to the database
        console.log('Feedback submitted:', feedback);
        setSubmitted(true);
        setFeedback('');
    };

    return (
        <div className={styles.feedbackContainer}>
            {submitted ? (
                <p className={styles.thankYouMessage}>Thank you for your feedback!</p>
            ) : (
                <>
                    <h2 className={styles.header}>We Value Your Feedback</h2>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write your feedback here..."
                        className={styles.textarea}
                    />
                    <button onClick={handleSubmit} className={styles.submitButton}>
                        Submit Feedback
                    </button>
                </>
            )}
        </div>
    );
};

export default Feedback;
