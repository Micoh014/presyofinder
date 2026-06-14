import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SearchBar({
  onResults,
  onClear,
  onReshow,
  userPosition,
  getDistance,
  onSortModeChange,
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [sortMode, setSortMode] = useState("price-asc"); // price-asc, price-desc, distance

  async function handleSearch(value, mode = sortMode) {
    setQuery(value);
    if (!value.trim()) {
      onClear();
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("items")
      .select("*, stores(*)")
      .ilike("name", `%${value}%`)
      .order("price", { ascending: mode !== "price-desc" });
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
    const currentIndex = modes.indexOf(sortMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setSortMode(nextMode);
    onSortModeChange(nextMode);
    if (query.trim()) handleSearch(query, nextMode);
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-md">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="w-full bg-white shadow-lg rounded-full px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder-gray-400"
            placeholder="Search item (e.g. Rice, Egg...)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={onReshow}
          />
          {loading && (
            <span className="absolute right-4 top-3 text-gray-400 text-sm">
              ...
            </span>
          )}
          {query && !loading && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-3 text-gray-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            cycleSortMode();
          }}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors text-lg"
          title={
            sortMode === "price-asc"
              ? "Cheapest first"
              : sortMode === "price-desc"
                ? "Most expensive first"
                : "Nearest first"
          }
        >
          {sortMode === "price-asc"
            ? "↑"
            : sortMode === "price-desc"
              ? "↓"
              : "📍"}
        </button>
      </div>

      {/* Sort label */}
      {query && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-4">
          {sortMode === "price-asc" && "↓ Cheapest first"}
          {sortMode === "price-desc" && "↑ Most expensive first"}
          {sortMode === "distance" && "📍 Nearest first"}
        </p>
      )}
    </div>
  );
}
