import { useState, memo } from "react";
import { searchItemsByName } from "../services/db";
import Spinner from "./ui/Spinner";

function SearchBar({
  onResults,
  onClear,
  onReshow,
  userPosition,
  getDistance,
  onSortModeChange,
  userId,
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortMode, setSortMode] = useState("price-asc");

  async function handleSearch(value, mode = sortMode) {
    setQuery(value);
    if (!value.trim()) {
      onClear();
      return;
    }
    setLoading(true);
    const { data } = await searchItemsByName(
      userId,
      value,
      mode !== "price-desc",
    );
    setLoading(false);
    if (!data) return;

    let sorted = data;
    if (mode === "distance" && userPosition) {
      sorted = [...data].sort((a, b) => {
        const distA = getDistance(
          userPosition.lat,
          userPosition.lng,
          a.stores.latitude,
          a.stores.longitude,
        );
        const distB = getDistance(
          userPosition.lat,
          userPosition.lng,
          b.stores.latitude,
          b.stores.longitude,
        );
        return distA - distB;
      });
    }
    onResults(sorted);
  }

  function cycleSortMode() {
    const modes = ["price-asc", "price-desc", "distance"];
    const next = modes[(modes.indexOf(sortMode) + 1) % modes.length];
    setSortMode(next);
    onSortModeChange(next);
    if (query.trim()) handleSearch(query, next);
  }

  const sortLabel =
    sortMode === "price-asc"
      ? "↑ Price"
      : sortMode === "price-desc"
        ? "↓ Price"
        : "📍 Near";

  return (
    <div className="flex gap-2 items-center" style={{ width: "100%" }}>
      <div className="relative" style={{ flex: 1 }}>
        <label htmlFor="item-search" className="sr-only">
          Search for an item
        </label>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          🔍
        </div>
        <input
          id="item-search"
          style={{ width: "100%" }}
          className="bg-white dark:bg-gray-800 dark:text-white shadow-xl rounded-2xl pl-11 pr-10 py-4 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 dark:placeholder-gray-500 placeholder-gray-400 text-sm font-medium border border-gray-100 dark:border-gray-700"
          placeholder="What are you looking for"
          aria-label="Search for an item"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={onReshow}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
        {query && !loading && (
          <button
            onClick={() => handleSearch("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {query && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            cycleSortMode();
          }}
          aria-label={`Sort: ${sortLabel}`}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors whitespace-nowrap"
          style={{ flexShrink: 0 }}
        >
          {sortLabel}
        </button>
      )}
    </div>
  );
}

export default memo(SearchBar);
