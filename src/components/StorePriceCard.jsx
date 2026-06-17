import { useCallback } from "react";
import { useItems } from "../hooks/useItems";
import Spinner from "./ui/Spinner";

const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

const FRESHNESS_DAYS = 30;
function isStale(dateStr) {
  return (
    (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24) > FRESHNESS_DAYS
  );
}

export default function StorePriceCard({
  store,
  userId,
  onClose,
  onViewFull,
  onGetDirections,
}) {
  return (
    <div className="absolute bottom-24 left-0 right-0 px-4 z-1000">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{STORE_ICONS[store.type] || "📍"}</span>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-base leading-tight">
                {store.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">
                {store.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close price card"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none p-1 -mt-1"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <PriceList storeId={store.id} userId={userId} />

        {/* Actions */}
        <div className="px-4 pb-4 pt-2 flex gap-2 border-t border-gray-100 dark:border-gray-700 mt-1">
          <button
            onClick={onGetDirections}
            className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            🧭 Directions
          </button>
          <button
            onClick={onViewFull}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
          >
            View & Log Prices
          </button>
        </div>
      </div>
    </div>
  );
}

// Separate component so useItems only runs when the card is open
function PriceList({ storeId, userId }) {
  const { items, itemsLoading, itemsError } = useItems(storeId, userId);

  if (itemsLoading) {
    return (
      <div className="flex justify-center py-5">
        <Spinner size="md" />
      </div>
    );
  }

  if (itemsError) {
    return <p className="px-4 py-3 text-sm text-red-400">{itemsError}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No prices logged yet.
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
          Tap "View & Log Prices" to add some.
        </p>
      </div>
    );
  }

  // Show up to 4 items, sorted cheapest first
  const sorted = [...items].sort((a, b) => a.price - b.price).slice(0, 4);
  const hasMore = items.length > 4;

  return (
    <div className="px-4 pb-1 space-y-1.5">
      {sorted.map((item) => {
        const stale = isStale(item.recorded_at);
        return (
          <div
            key={item.id}
            className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                {item.name}
              </p>
              {stale && (
                <span className="text-xs text-orange-400 shrink-0">⚠️</span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-white shrink-0 ml-3">
              ₱{parseFloat(item.price).toFixed(2)}
            </p>
          </div>
        );
      })}
      {hasMore && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
          +{items.length - 4} more items
        </p>
      )}
    </div>
  );
}
