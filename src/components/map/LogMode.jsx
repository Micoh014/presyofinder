import { useMemo, useState } from "react";
import { getDistanceMeters } from "../../lib/mapUtils";
import Spinner from "../ui/Spinner";
import { motion } from "framer-motion";

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
    return stores.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [stores, search]);

  function formatDistance(meters) {
    return meters < 1000
      ? `${Math.round(meters)}m away`
      : `${(meters / 1000).toFixed(1)}km away`;
  }

  const isLoading = storesLoading || !userPosition;

  return (
    // Full-screen overlay — covers the map completely
    <motion.div
      className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-2000 flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Section header */}
      <div className="px-4 pt-4 pb-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
          Log Mode
        </p>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {isLoading
            ? "Finding nearby stores..."
            : nearbyStores.length > 0
              ? `${nearbyStores.length} store${nearbyStores.length !== 1 ? "s" : ""} near you`
              : "Search your stores"}
        </h2>
      </div>

      {/* Search bar — always visible */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
            🔍
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your stores by name..."
            className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl pl-9 pr-9 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {!userPosition ? "Getting your location..." : "Loading stores..."}
            </p>
          </div>
        )}

        {/* Search results take priority when searching */}
        {!isLoading && search.trim() && (
          <div>
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No stores found for "{search}"
                </p>
              </div>
            ) : (
              <>
                <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Search Results
                </p>
                {searchResults.map((store) => (
                  <StoreRow
                    key={store.id}
                    store={store}
                    onSelect={onSelectStore}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Nearby stores when not searching */}
        {!isLoading && !search.trim() && nearbyStores.length > 0 && (
          <div>
            <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Nearby — within 150m
            </p>
            {nearbyStores.map((store) => (
              <StoreRow
                key={store.id}
                store={store}
                distance={store.distance}
                formatDistance={formatDistance}
                onSelect={onSelectStore}
              />
            ))}
          </div>
        )}

        {/* All stores when not searching and nothing nearby */}
        {!isLoading && !search.trim() && nearbyStores.length === 0 && (
          <div>
            <div className="px-4 pt-6 pb-4 text-center">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                No stores within 150m
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Search by name above or browse all your stores below.
              </p>
            </div>

            {stores.length > 0 && (
              <>
                <p className="px-4 pb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  All Your Stores
                </p>
                {stores.map((store) => (
                  <StoreRow
                    key={store.id}
                    store={store}
                    onSelect={onSelectStore}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add new store — sticky at bottom */}
      <div className="px-4 py-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 safe-bottom">
        <button
          onClick={onDropPin}
          className="w-full border-2 border-dashed border-green-400 text-green-600 dark:text-green-400 rounded-2xl py-3.5 text-sm font-bold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
        >
          + Pin a New Store
        </button>
      </div>
    </motion.div>
  );
}

// Reusable store row
function StoreRow({ store, distance, formatDistance, onSelect }) {
  return (
    <button
      onClick={() => onSelect(store)}
      className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl shrink-0">
          {STORE_ICONS[store.type] || "📍"}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-800 dark:text-white">
            {store.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">
            {store.type}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0 ml-3">
        {distance !== undefined && formatDistance ? (
          <>
            <p className="text-xs font-semibold text-green-500">
              {formatDistance(distance)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Tap to log →
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Tap to log →
          </p>
        )}
      </div>
    </button>
  );
}
