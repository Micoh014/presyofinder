import { useState } from "react";
import { searchItemsByName } from "../../lib/db";
import { STORE_TYPE_FILTERS, getDistanceMeters } from "../../lib/mapUtils";

export default function SearchTab({ userId, userPosition, onSelectStore }) {
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

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          🔍
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            activeFilter === "all"
              ? "bg-green-500 text-white border-green-500"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
          }`}
        >
          All
        </button>
        {STORE_TYPE_FILTERS.filter((f) => f.value !== "all").map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
              activeFilter === f.value
                ? "bg-green-500 text-white border-green-500"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
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
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-left"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {item.stores?.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {item.stores?.type}
                    {dist !== null &&
                      ` · ${dist < 1000 ? Math.round(dist) + "m" : (dist / 1000).toFixed(1) + "km"} away`}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
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
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
