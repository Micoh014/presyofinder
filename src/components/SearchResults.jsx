const FRESHNESS_DAYS = 30;

function isStale(dateStr) {
  const diffDays = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diffDays > FRESHNESS_DAYS;
}

function formatDistance(meters) {
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

export default function SearchResults({
  results,
  onSelectStore,
  userPosition,
  getDistance,
  sortMode,
}) {
  if (!results || results.length === 0) {
    return (
      <div className="absolute bottom-24 left-0 right-0 px-4 z-1000]">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Try a different item name.
          </p>
        </div>
      </div>
    );
  }

  const prices = results.map((r) => r.price);
  const cheapest = Math.min(...prices);
  const mostExpensive = Math.max(...prices);

  return (
    <div className="absolute bottom-24 left-0 right-0 px-4 z-1000">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {sortMode === "price-asc" && "↑ Cheapest first"}
            {sortMode === "price-desc" && "↓ Most expensive first"}
            {sortMode === "distance" && "📍 Nearest first"}
          </p>
        </div>

        {/* Results list */}
        <div className="max-h-64 overflow-y-auto" aria-live="polite">
          {results.map((item) => {
            const stale = isStale(item.recorded_at);
            const isCheapest = item.price === cheapest;
            const isMostExpensive =
              item.price === mostExpensive && results.length > 1;
            const dist =
              userPosition && item.stores
                ? getDistance(
                    userPosition.lat,
                    userPosition.lng,
                    item.stores.latitude,
                    item.stores.longitude,
                  )
                : null;

            return (
              <button
                key={item.id}
                onClick={() => onSelectStore(item.stores)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 text-left transition-colors"
              >
                {/* Left — store info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Color dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isCheapest
                        ? "bg-green-400"
                        : isMostExpensive
                          ? "bg-red-400"
                          : "bg-yellow-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {item.stores?.name}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                        {item.stores?.type}
                      </p>
                      {dist !== null && (
                        <p className="text-xs text-blue-400">
                          {formatDistance(dist)}
                        </p>
                      )}
                      {stale && (
                        <p className="text-xs text-orange-400">⚠️ Outdated</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — price */}
                <div className="text-right shrink-0 ml-3">
                  <p
                    className={`font-bold text-base ${
                      isCheapest
                        ? "text-green-500"
                        : isMostExpensive
                          ? "text-red-400"
                          : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    ₱{parseFloat(item.price).toFixed(2)}
                  </p>
                  {isCheapest && (
                    <p className="text-xs text-green-400 font-medium">
                      Best price
                    </p>
                  )}
                  {isMostExpensive && (
                    <p className="text-xs text-red-400 font-medium">
                      Most expensive
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
