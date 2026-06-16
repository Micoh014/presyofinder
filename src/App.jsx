import { useState, useEffect } from "react";
import Map from "./components/Map";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Toast from "./components/Toast";
import { supabase } from "./lib/supabase";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const seen = localStorage.getItem("presyofinder_onboarding_seen");
      if (!seen) setShowOnboarding(true);
    }
  }, [session]);

  function handleOnboardingDone() {
    localStorage.setItem("presyofinder_onboarding_seen", "true");
    setShowOnboarding(false);
  }

  if (loading || checkingAuth) return <LoadingScreen />;
  if (!session) return <Login />;
  if (showOnboarding) return <Onboarding onDone={handleOnboardingDone} />;

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="flex flex-col dark:bg-gray-900"
    >
      <Toast />
      <div className="flex items-center justify-between px-4 py-3 safe-top bg-white dark:bg-gray-800 shadow-sm z-1000 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-none">
              PresyoFinder
            </h1>
            <p className="text-xs text-gray-400">Your personal price map</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-400 dark:text-gray-500"
            aria-label="Log out"
          >
            Logout
          </button>
          <button
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-pressed={darkMode}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
              darkMode ? "bg-gray-700" : "bg-yellow-100"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center text-sm transition-transform duration-300 ${
                darkMode
                  ? "translate-x-8 bg-gray-900"
                  : "translate-x-0 bg-white"
              }`}
            >
              {darkMode ? "🌙" : "☀️"}
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Map darkMode={darkMode} userId={session.user.id} />
      </div>
    </div>
  );
}

export default App;
