const FRESHNESS_DAYS = 30;

function isStale(dateStr) {
  const recorded = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - recorded) / (1000 * 60 * 60 * 24);
  return diffDays > FRESHNESS_DAYS;
}

export default function SearchResults({
  results,
  onSelectStore,
  userPosition,
  getDistance,
  sortMode,
}) {
  if (!results || results.length === 0)
    return (
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-4">
        <p className="text-center text-gray-400 text-sm">No results found.</p>
      </div>
    );

  function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }

  const prices = results.map((r) => r.price);
  const cheapest = Math.min(...prices);
  const mostExpensive = Math.max(...prices);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-h-64 overflow-y-auto">
      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {results.length} result{results.length > 1 ? "s" : ""} — sorted by{" "}
          {sortMode === "price-asc" && "cheapest first"}
          {sortMode === "price-desc" && "most expensive first"}
          {sortMode === "distance" && "nearest first"}
        </p>
      </div>
      {results.map((item, index) => {
        const stale = isStale(item.recorded_at);
        const isCheapest = item.price === cheapest;
        const isMostExpensive =
          item.price === mostExpensive && results.length > 1;

        return (
          <button
            key={item.id}
            onClick={() => onSelectStore(item.stores)}
            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 text-left"
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {item.stores?.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                {item.stores?.type}
              </p>
              {sortMode === "distance" && userPosition && item.stores && (
                <p className="text-xs text-blue-400 dark:text-blue-300">
                  📍
                  {formatDistance(
                    getDistance(
                      userPosition.lat,
                      userPosition.lng,
                      item.stores.latitude,
                      item.stores.longitude,
                    ),
                  )}{" "}
                  away
                </p>
              )}
              {stale && (
                <p className="text-xs text-orange-400">
                  ⚠️ Price may be outdated
                </p>
              )}
            </div>

            {sortMode !== "distance" && (
              <div className="text-right">
                <p
                  className={`font-bold text-lg ${isCheapest ? "text-green-500" : isMostExpensive ? "text-red-400" : "text-gray-700"}`}
                >
                  ₱{parseFloat(item.price).toFixed(2)}
                </p>
                {isCheapest && (
                  <p className="text-xs text-green-400">Cheapest</p>
                )}
                {isMostExpensive && (
                  <p className="text-xs text-red-400">Most expensive</p>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
