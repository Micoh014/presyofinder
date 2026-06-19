import { useState, useEffect } from "react";
import Map from "./components/Map";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./components/Login";
import Onboarding from "./components/Onboarding";
import Toast from "./components/Toast";
import { supabase } from "./services/supabase";
import { useDarkMode } from "./hooks/useDarkMode";
import OfflineBanner from "./components/OfflineBanner";
import { useIsDesktop } from "./hooks/useIsDesktop";
import DesktopLayout from "./components/desktop/DesktopLayout";

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isDesktop = useIsDesktop();

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
      <OfflineBanner />
      <Toast />
      {!isDesktop && (
        <div className="flex items-center justify-between px-4 py-3 safe-top bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-1000 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-sm shadow-green-200">
              <span className="text-white text-sm">📍</span>
            </div>

            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                PresyoFinder
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                Price tracker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              aria-pressed={darkMode}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center px-1 ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full shadow-sm flex items-center justify-center text-xs transition-transform duration-300 ${
                  darkMode
                    ? "translate-x-7 bg-gray-900"
                    : "translate-x-0 bg-white"
                }`}
              >
                {darkMode ? "🌙" : "☀️"}
              </div>
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Log out"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        {isDesktop ? (
          <DesktopLayout
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            userId={session.user.id}
            userEmail={session.user.email}
          />
        ) : (
          <Map darkMode={darkMode} userId={session.user.id} />
        )}
      </div>
    </div>
  );
}

export default App;
