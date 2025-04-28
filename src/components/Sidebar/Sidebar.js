import React from "react";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import styles from "./Sidebar.module.css";

const Sidebar = React.memo(({ setView, role }) => {
    const handleSignOut = async () => {
        await signOut(auth);
        alert("You have been logged out.");
        window.location.reload(); // Ensures the app resets after logout
    };

    return (
        <div className={styles.sidebar}>
            <h2 className={styles.title}>Emotion Tracker</h2>
            <nav className={styles.nav}>
                {/* Options for both clients and caregivers */}
                <button onClick={() => setView("home")} className={styles.navItem}>
                    Home
                </button>
                {role === "client" && (
                    <>
                        <button onClick={() => setView("history")} className={styles.navItem}>
                            Emotion History
                        </button>
                        <button onClick={() => setView("insights")} className={styles.navItem}>
                            Emotion Insights
                        </button>
                        <button onClick={() => setView("profile")} className={styles.navItem}>
                            Profile
                        </button>
                        <button onClick={() => setView("settings")} className={styles.navItem}>
                            Settings
                        </button>
                        <button onClick={() => setView("feedback")} className={styles.navItem}>
                            Feedback
                        </button>
                    </>
                )}
                {role === "caregiver" && (
                    <>
                        <button onClick={() => setView("clients")} className={styles.navItem}>
                            Clients
                        </button>

                        <button onClick={() => setView("feedback")} className={styles.navItem}>
                            Feedback
                        </button>
                    </>
                )}
            </nav>
            <button onClick={handleSignOut} className={styles.signOutButton}>
                Logout
            </button>
        </div>
    );
});

export default Sidebar;
