import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SearchBar({ onResults, onClear, onReshow }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  async function handleSearch(value, ascending = sortAsc) {
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
      .order("price", { ascending });
    setLoading(false);

    if (data) onResults(data);
  }

  function toggleSort() {
    const newAsc = !sortAsc;
    setSortAsc(newAsc);
    if (query.trim()) handleSearch(query, newAsc);
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
          onClick={toggleSort}
          className="bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center text-gray-600 hover:text-green-500 transition-colors"
          title={sortAsc ? "Cheapest first" : "Most expensive first"}
        >
          {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      {/* Sort label */}
      {query && (
        <p className="text-xs text-gray-400 mt-1 ml-4">
          {sortAsc ? "↑ Cheapest first" : "↓ Most expensive first"}
        </p>
      )}
    </div>
  );
}
