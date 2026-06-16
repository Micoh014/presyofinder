import { useMemo, useState } from "react";
import { getDistanceMeters } from "../../lib/mapUtils";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

const NEARBY_RADIUS_METERS = 150;

const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

export default function LogMode({
  stores,
  storesLoading,
  userPosition,
  onSelectStore,
  onDropPin,
}) {
  const [search, setSearch] = useState("");

  const nearbyStores = useMemo(() => {
    if (!userPosition || stores.length === 0) return [];
    return stores
      .map((store) => ({
        ...store,
        distance: getDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          store.latitude,
          store.longitude,
        ),
      }))
      .filter((s) => s.distance <= NEARBY_RADIUS_METERS)
      .sort((a, b) => a.distance - b.distance);
  }, [stores, userPosition]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return stores.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [stores, search]);

  const showSearch = nearbyStores.length === 0;

  function formatDistance(meters) {
    return meters < 1000
      ? `${Math.round(meters)}m away`
      : `${(meters / 1000).toFixed(1)}km away`;
  }

  return (
    <div className="absolute bottom-28 left-0 right-0 px-4 z-1000">
      <div className="max-w-md mx-auto">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  Log Mode
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {storesLoading
                    ? "Finding nearby stores..."
                    : nearbyStores.length > 0
                      ? `${nearbyStores.length} store${nearbyStores.length !== 1 ? "s" : ""} nearby`
                      : !userPosition
                        ? "Getting your location..."
                        : "No stores within 150m"}
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {(storesLoading || !userPosition) && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Spinner size="md" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {!userPosition ? "Getting location..." : "Loading stores..."}
              </p>
            </div>
          )}

          {/* Nearby stores list */}
          {!storesLoading && userPosition && nearbyStores.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-56 overflow-y-auto">
              {nearbyStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => onSelectStore(store)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {STORE_ICONS[store.type] || "📍"}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-gray-800 dark:text-white">
                        {store.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                        {store.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-medium text-green-500">
                      {formatDistance(store.distance)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Tap to log →
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No nearby stores — show search */}
          {!storesLoading && userPosition && nearbyStores.length === 0 && (
            <div className="px-4 py-3 space-y-3">
              <EmptyState
                icon="🔍"
                description="No pinned stores nearby. Search by name or add a new one."
              />

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your stores..."
                  className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-40 overflow-y-auto">
                  {searchResults.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => onSelectStore(store)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                      <span>{STORE_ICONS[store.type] || "📍"}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {store.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {store.type}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No search results */}
              {search.trim() && searchResults.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-1">
                  No stores found for "{search}"
                </p>
              )}

              {/* Add new store here */}
              <button
                onClick={onDropPin}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 text-sm font-bold transition-colors"
              >
                + Add New Store Here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
