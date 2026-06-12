import { useState, useEffect } from "react";
import Map from "./components/Map";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="flex flex-col dark:bg-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-sm z-1000 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-none">
              PresyoFinder
            </h1>
            <p className="text-xs text-gray-400">Your personal price map</p>
          </div>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="text-2xl">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map darkMode={darkMode} />
      </div>
    </div>
  );
}

export default App;
