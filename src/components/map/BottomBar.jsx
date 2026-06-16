export default function BottomBar({ onStats, onDropPin, onBasket }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 flex gap-3 safe-bottom">
      <button
        onClick={onStats}
        aria-label="Open dashboard statistics"
        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-3 rounded-full shadow-lg font-semibold text-sm border border-gray-100 dark:border-gray-700"
      >
        📊 Stats
      </button>
      <button
        onClick={onDropPin}
        aria-label="Drop a pin at my current location"
        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm"
      >
        + Drop Pin
      </button>
      <button
        onClick={onBasket}
        aria-label="Open basket finder"
        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-3 rounded-full shadow-lg font-semibold text-sm border border-gray-100 dark:border-gray-700"
      >
        🧺 Basket
      </button>
    </div>
  );
}
