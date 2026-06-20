import { useState } from "react";
import { Search, ListFilter, Clock } from "lucide-react";
import { searchItemsByName } from "../../services/db";
import { STORE_TYPE_FILTERS, getDistanceMeters } from "../../services/mapUtils";

function formatTimeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(diffMins, 0)}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function SearchTab({
  userId,
  userPosition,
  radiusMeters,
  onSelectStore,
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data } = await searchItemsByName(userId, value, true);
    setLoading(false);
    if (data) setResults(data);
  }

  const filteredResults =
    activeFilter === "all"
      ? results
      : results.filter((r) => r.stores?.type === activeFilter);

  const prices = filteredResults.map((r) => r.price);
  const cheapest = prices.length ? Math.min(...prices) : null;
  const mostExpensive = prices.length ? Math.max(...prices) : null;

  function getTierColor(price) {
    if (price === cheapest) return "bg-green-500";
    if (price === mostExpensive && filteredResults.length > 1)
      return "bg-red-400";
    return "bg-amber-400";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3">
        <Search
          size={16}
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search items or stores..."
          className="w-full bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <ListFilter size={13} strokeWidth={2.25} className="text-gray-400" />
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Categories
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4 items-center">
        {STORE_TYPE_FILTERS.filter((f) => f.value !== "all").map((f) => (
          <button
            key={f.value}
            onClick={() =>
              setActiveFilter(activeFilter === f.value ? "all" : f.value)
            }
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-colors ${
              activeFilter === f.value
                ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-green-500"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
        {activeFilter !== "all" && (
          <button
            onClick={() => setActiveFilter("all")}
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-green-500 hover:text-green-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto -mx-4">
        {loading && (
          <p className="text-sm text-gray-400 text-center py-4">Searching...</p>
        )}

        {!loading && query.trim() && filteredResults.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No results found.
          </p>
        )}

        {!loading && query.trim() && filteredResults.length > 0 && (
          <div className="flex items-center justify-between mb-2 px-4">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">
              {filteredResults.length} store
              {filteredResults.length !== 1 ? "s" : ""}
              {radiusMeters && ` within ${(radiusMeters / 1000).toFixed(1)} km`}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Sorted by price
            </p>
          </div>
        )}

        {!loading &&
          filteredResults.map((item) => {
            const isCheapest = item.price === cheapest;
            const isMostExpensive =
              item.price === mostExpensive && filteredResults.length > 1;
            const dist =
              userPosition && item.stores
                ? getDistanceMeters(
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
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-left gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${getTierColor(item.price)}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate">
                      {item.stores?.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {dist !== null &&
                        `${dist < 1000 ? Math.round(dist) + "m" : (dist / 1000).toFixed(1) + "km"} · `}
                      {item.name}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      isCheapest
                        ? "text-green-500"
                        : isMostExpensive
                          ? "text-red-400"
                          : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    ₱{parseFloat(item.price).toFixed(2)}
                  </p>
                  {item.recorded_at && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-end gap-1">
                      <Clock size={11} strokeWidth={2} />
                      {formatTimeAgo(item.recorded_at)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
