import { useState } from "react";
import { Navigation } from "lucide-react";
import { supabase } from "../../services/supabase";
import { useReverseGeocode } from "../../hooks/useReverseGeocode";

export default function DesktopTopBar({
  userPosition,
  onDropPin,
  darkMode,
  toggleDarkMode,
  userEmail,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const location = useReverseGeocode(userPosition);
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "?";

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 text-sm">
        <Navigation size={14} strokeWidth={2.5} className="text-green-500" />
        {location ? (
          <>
            <span className="font-semibold text-gray-800 dark:text-white">
              {location.city}
            </span>
            {location.subtitle && (
              <span className="text-gray-400 dark:text-gray-500">
                · {location.subtitle}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">Locating...</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onDropPin}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          + Drop Pin
        </button>

        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="text-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu((s) => !s)}
            aria-label="Account menu"
            className="w-8 h-8 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center"
          >
            {initials}
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-1000">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
