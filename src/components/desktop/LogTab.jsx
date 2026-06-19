import { useMemo, useState } from "react";
import { getDistanceMeters } from "../../services/mapUtils";
import Spinner from "../ui/Spinner";

const STORE_TYPE_COLORS = {
  "sari-sari": "bg-red-400",
  karinderia: "bg-orange-400",
  palengke: "bg-green-500",
  mall: "bg-blue-400",
  supermarket: "bg-amber-400",
  "street-vendor": "bg-purple-400",
  online: "bg-cyan-400",
};

export default function LogTab({
  stores,
  storesLoading,
  userPosition,
  radiusMeters,
  onSelectStore,
  onSubmitItem,
  onDropPin,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");

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

  function formatDistance(meters) {
    return meters < 1000
      ? `${Math.round(meters)}m`
      : `${(meters / 1000).toFixed(1)}km`;
  }

  function handleSelectStore(store) {
    setSelectedId(store.id);
    onSelectStore(store);
  }

  const selectedStore = inRadius.find((s) => s.id === selectedId);
  const canSubmit = selectedId && itemName.trim() && price;

  return (
    <div className="flex flex-col h-full">
      {/* Section 1 */}
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
        1. Select a Store
      </p>

      <div className="flex-1 overflow-y-auto -mx-4 min-h-0">
        {storesLoading || !userPosition ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Spinner size="md" />
            <p className="text-sm text-gray-400">
              {!userPosition ? "Getting location..." : "Loading stores..."}
            </p>
          </div>
        ) : inRadius.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 px-4">
            No stores in this radius.
          </p>
        ) : (
          inRadius.map((store) => {
            const isSelected = selectedId === store.id;
            return (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className={`w-full flex items-center gap-3 px-4 py-3 mx-4 mb-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? "ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20"
                    : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                style={{ width: "calc(100% - 2rem)" }}
              >
                {/* Radio indicator */}
                <span
                  className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-green-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {store.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {store.type}
                    {store.distance !== undefined &&
                      ` · ${formatDistance(store.distance)}`}
                  </p>
                </div>

                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${STORE_TYPE_COLORS[store.type] || "bg-gray-400"}`}
                />
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={onDropPin}
        className="w-full border-2 border-dashed border-green-400 text-green-600 dark:text-green-400 rounded-xl py-2 text-sm font-bold hover:bg-green-50 dark:hover:bg-green-900/20 mt-2 shrink-0"
      >
        + Pin a New Store
      </button>

      {/* Section 2 */}
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-4 mb-2 shrink-0">
        2. Log the Price
      </p>

      <div className="shrink-0 space-y-2">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name (e.g. Rice 1kg)"
          className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
        />

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ₱
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <button className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
            📷 Photo
          </button>
        </div>

        {!selectedId && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ⓘ Select a store above to log a price.
          </p>
        )}
      </div>

      <button
        disabled={!canSubmit}
        onClick={async () => {
          if (!canSubmit) return;
          const ok = await onSubmitItem(itemName, price);
          if (ok) {
            setItemName("");
            setPrice("");
          }
        }}
        className={`w-full mt-3 py-3 rounded-xl text-sm font-bold shrink-0 transition-colors ${
          canSubmit
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
        }`}
      >
        Submit price
      </button>
    </div>
  );
}
