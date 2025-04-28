// src/hooks/useDailyNotification.js
import { useEffect } from 'react';

export const useDailyNotification = () => {
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const now = new Date();
        const msUntil9AM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0) - now;
        const timeUntilNotification = msUntil9AM > 0 ? msUntil9AM : msUntil9AM + 24 * 60 * 60 * 1000; // Adjust for next day if needed

        const timer = setTimeout(() => {
            showDailyNotification();
            setInterval(showDailyNotification, 24 * 60 * 60 * 1000); // Repeat daily
        }, timeUntilNotification);

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);
};

const showDailyNotification = () => {
    if (Notification.permission === "granted") {
        new Notification("Daily Emotion Reminder", {
            body: "Don’t forget to log how you're feeling today!",
            icon: "/path/to/icon.png", // Optional icon
        });
    }
};
