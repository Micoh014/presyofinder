import { useMemo, useState } from "react";
import { getDistanceMeters } from "../../lib/mapUtils";
import Spinner from "../ui/Spinner";

const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

export default function LogTab({
  stores,
  storesLoading,
  userPosition,
  radiusMeters,
  onSelectStore,
  onDropPin,
}) {
  const [search, setSearch] = useState("");

  const inRadius = useMemo(() => {
    if (!userPosition) return [];
    return stores
      .map((s) => ({
        ...s,
        distance: getDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          s.latitude,
          s.longitude,
        ),
      }))
      .filter((s) => s.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }, [stores, userPosition, radiusMeters]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return stores.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [stores, search]);

  function formatDistance(meters) {
    return meters < 1000
      ? `${Math.round(meters)}m`
      : `${(meters / 1000).toFixed(1)}km`;
  }

  const showingSearch = search.trim().length > 0;
  const list = showingSearch ? searchResults : inRadius;

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          🔍
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your stores..."
          className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
        {showingSearch
          ? "Search results"
          : `Within ${(radiusMeters / 1000).toFixed(1)}km`}
      </p>

      <div className="flex-1 overflow-y-auto -mx-4">
        {storesLoading || !userPosition ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Spinner size="md" />
            <p className="text-sm text-gray-400">
              {!userPosition ? "Getting location..." : "Loading stores..."}
            </p>
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 px-4">
            {showingSearch
              ? `No stores found for "${search}"`
              : "No stores in this radius."}
          </p>
        ) : (
          list.map((store) => (
            <button
              key={store.id}
              onClick={() => onSelectStore(store)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">
                  {STORE_ICONS[store.type] || "📍"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {store.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {store.type}
                  </p>
                </div>
              </div>
              {store.distance !== undefined && (
                <p className="text-xs font-medium text-green-500 shrink-0 ml-2">
                  {formatDistance(store.distance)}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      <button
        onClick={onDropPin}
        className="w-full border-2 border-dashed border-green-400 text-green-600 dark:text-green-400 rounded-xl py-2.5 text-sm font-bold hover:bg-green-50 dark:hover:bg-green-900/20 mt-3 not-last:shrink-0"
      >
        + Pin a New Store
      </button>
    </div>
  );
}
