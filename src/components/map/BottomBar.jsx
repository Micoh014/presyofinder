import { memo, useState } from "react";

function BottomBar({ onStats, onDropPin, onBasket, mode, onModeChange }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="absolute bottom-6 left-0 right-0 z-3000 px-4 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            aria-expanded={menuOpen}
            className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg border border-gray-100 dark:border-gray-700"
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-44">
              <button
                onClick={() => {
                  onStats();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              >
                📊 <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  onBasket();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-t border-gray-100 dark:border-gray-700"
              >
                🧺 <span>Basket Finder</span>
              </button>
            </div>
          )}
        </div>

        {/* Browse / Log toggle — center */}
        <div className="flex bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 p-1 gap-1">
          <button
            onClick={() => onModeChange("browse")}
            aria-pressed={mode === "browse"}
            className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === "browse"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            🗺 Browse
          </button>
          <button
            onClick={() => onModeChange("log")}
            aria-pressed={mode === "log"}
            className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
              mode === "log"
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            📝 Log
          </button>
        </div>

        {/* Drop Pin — only in browse mode */}
        {mode === "browse" ? (
          <button
            onClick={onDropPin}
            aria-label="Drop a pin at my current location"
            className="bg-green-500 hover:bg-green-600 active:scale-95 text-white w-12 h-12 rounded-full shadow-lg shadow-green-200 dark:shadow-none font-bold text-lg transition-all flex items-center justify-center"
          >
            +
          </button>
        ) : (
          <div className="w-12 h-12 opacity-0 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export default memo(BottomBar);
