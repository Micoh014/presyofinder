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

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
            darkMode ? "bg-gray-700" : "bg-yellow-100"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center text-sm transition-transform duration-300 ${
              darkMode ? "translate-x-8 bg-gray-900" : "translate-x-0 bg-white"
            }`}
          >
            {darkMode ? "🌙" : "☀️"}
          </div>
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
