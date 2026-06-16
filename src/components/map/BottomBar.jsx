import { memo, useState } from "react";

function BottomBar({ onStats, onDropPin, onBasket }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="absolute bottom-6 left-0 right-0 z-1000 px-4 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between">
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

        {/* Primary CTA — Drop Pin */}
        <button
          onClick={onDropPin}
          aria-label="Drop a pin at my current location"
          className="bg-green-500 hover:bg-green-600 active:scale-95 text-white px-8 py-3.5 rounded-full shadow-lg shadow-green-200 dark:shadow-none font-bold text-sm transition-all"
        >
          + Drop Pin
        </button>

        {/* Recenter */}
        <button
          onClick={() => {}}
          aria-label="Placeholder — spacing balance"
          className="w-12 h-12 opacity-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

export default memo(BottomBar);
