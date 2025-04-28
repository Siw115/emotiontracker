import {doc, getDoc, setDoc} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { Suspense, useEffect, useState } from "react";
import SignIn from "./components/SignIn/SignIn";
import SignUp from "./components/SignUp/SignUp";
import EmotionInput from "./components/EmotionInput/EmotionInput";
import EmotionHistory from "./components/EmotionHistory/EmotionHistory";
import EmotionInsights from "./components/EmotionInsights/EmotionInsights";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Sidebar from "./components/Sidebar/Sidebar";
import Clients from "./components/Clients/Clients";
import { onAuthStateChanged } from "firebase/auth";
import Feedback from "./components/Feedback/Feedback";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isSignIn, setIsSignIn] = useState(true);
  const [view, setView] = useState("home");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || "client"); // Default to "client" if no role exists
          } else {
            // Optionally add the user to the Firestore database with a default role
            await setDoc(doc(db, "users", currentUser.uid), { role: "client" });
            setRole("client");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("client"); // Default fallback in case of an error
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);


  return (
      <div className="App">
        {user ? (
            role ? (
                <div className="appContainer">
                  <Sidebar setView={setView} role={role} />
                  <div className="mainContent">
                    <Suspense fallback={<p>Loading...</p>}>
                      {view === "home" &&
                          (role === "client" ? <EmotionInput /> : <Clients />)}
                      {view === "history" && <EmotionHistory />}
                      {view === "insights" && <EmotionInsights />}
                      {view === "profile" && <Profile user={user} />}
                      {view === "settings" && <Settings />}
                      {view === "feedback" && <Feedback />}
                    </Suspense>
                  </div>
                </div>
            ) : (
                <p>Loading role...</p>
            )
        ) : (
            <div className="authContainer">
              <Suspense fallback={<p>Loading...</p>}>
                {isSignIn ? <SignIn/> : <SignUp/>}
                <button
                    className="switchAuthButton"
                    onClick={() => setIsSignIn(!isSignIn)}
                >
                  {isSignIn
                      ? "Don't have an account? Sign Up"
                      : "Already have an account? Sign In"}
                </button>
              </Suspense>
            </div>
        )}
      </div>
  );
}

export default App;
