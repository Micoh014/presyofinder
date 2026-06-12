const FRESHNESS_DAYS = 30;

function isStale(dateStr) {
  const recorded = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - recorded) / (1000 * 60 * 60 * 24);
  return diffDays > FRESHNESS_DAYS;
}

export default function SearchResults({ results, onSelectStore }) {
  if (!results || results.length === 0)
    return (
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md bg-white rounded-2xl shadow-lg p-4">
        <p className="text-center text-gray-400 text-sm">No results found.</p>
      </div>
    );

  const prices = results.map((r) => r.price);
  const cheapest = Math.min(...prices);
  const mostExpensive = Math.max(...prices);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md bg-white rounded-2xl shadow-lg max-h-64 overflow-y-auto">
      <div className="p-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          {results.length} result{results.length > 1 ? "s" : ""} — sorted
          cheapest first
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
            className="w-full flex justify-between items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
          >
            <div>
              <p className="font-medium text-gray-800">{item.stores?.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {item.stores?.type}
              </p>
              {stale && (
                <p className="text-xs text-orange-400">
                  ⚠️ Price may be outdated
                </p>
              )}
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-lg ${isCheapest ? "text-green-500" : isMostExpensive ? "text-red-400" : "text-gray-700"}`}
              >
                ₱{parseFloat(item.price).toFixed(2)}
              </p>
              {isCheapest && <p className="text-xs text-green-400">Cheapest</p>}
              {isMostExpensive && (
                <p className="text-xs text-red-400">Most expensive</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
