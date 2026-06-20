import { useEffect, useState } from "react";
import { useItems } from "../hooks/useItems";
import Spinner from "./ui/Spinner";
import { MapPin, Navigation } from "lucide-react";
import { STORE_TYPE_ICONS } from "../services/mapUtils";
import { AlertTriangle } from "lucide-react";

const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

const FRESHNESS_DAYS = 30;
function isStale(dateStr) {
  return (
    (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24) > FRESHNESS_DAYS
  );
}

function formatTimeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(diffMins, 0)}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function formatDistance(meters) {
  if (meters == null) return null;
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

export default function StorePriceCard({
  store,
  userId,
  onClose,
  onViewFull,
  onGetDirections,
  variant = "bar", // "bar" (mobile, bottom-anchored) | "popover" (desktop, pin-anchored)
  position, // { x, y } in pixels — required when variant="popover"
  distanceMeters,
  tierColor,
  onLogPrice,
}) {
  if (variant === "popover") {
    return (
      <div
        className="absolute z-1000"
        style={{
          left: position?.x ?? 0,
          top: position?.y ?? 0,
          transform: "translate(-50%, calc(-100% - 16px))",
        }}
      >
        <div className="w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl relative">
          <div className="px-4 pt-4 pb-2 flex items-start justify-between">
            <p className="font-bold text-gray-800 dark:text-white text-base leading-tight pr-4">
              {store.name}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {tierColor && (
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tierColor }}
                />
              )}
              <button
                onClick={onClose}
                aria-label="Close price card"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <p className="px-4 text-xs text-gray-400 dark:text-gray-500 capitalize -mt-1 mb-2">
            <span className="capitalize"> {store.type} </span>
            {distanceMeters != null &&
              ` · ${formatDistance(distanceMeters)} away`}
          </p>

          <PriceList storeId={store.id} userId={userId} compact />

          <div className="px-4 pb-4">
            <button
              onClick={onLogPrice}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
            >
              Log Price Here
            </button>
          </div>

          {/* Pointer arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45"
            style={{ boxShadow: "2px 2px 2px rgba(0,0,0,0.04)" }}
          />
        </div>
      </div>
    );
  }

  // Default mobile bottom-bar variant — unchanged
  return (
    <div className="absolute bottom-24 left-0 right-0 px-4 z-1000">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = STORE_TYPE_ICONS[store.type] || MapPin;
              return (
                <Icon
                  size={24}
                  className="text-gray-600 dark:text-gray-300"
                  strokeWidth={1.75}
                />
              );
            })()}
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-base leading-tight">
                {store.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">
                {store.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close price card"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none p-1 -mt-1"
          >
            ×
          </button>
        </div>

        <PriceList storeId={store.id} userId={userId} />

        <div className="px-4 pb-4 pt-2 flex gap-2 border-t border-gray-100 dark:border-gray-700 mt-1">
          <button onClick={onGetDirections} className="...">
            <span className="flex items-center justify-center gap-1.5">
              <Navigation size={14} /> Directions
            </span>
          </button>
          <button
            onClick={onViewFull}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
          >
            View & Log Prices
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceList({ storeId, userId, compact = false }) {
  const { items, itemsLoading, itemsError } = useItems(storeId, userId);

  if (itemsLoading) {
    return (
      <div className="flex justify-center py-5">
        <Spinner size="md" />
      </div>
    );
  }

  if (itemsError) {
    return <p className="px-4 py-3 text-sm text-red-400">{itemsError}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No prices logged yet.
        </p>
        {!compact && (
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
            Tap "View & Log Prices" to add some.
          </p>
        )}
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.price - b.price).slice(0, 4);
  const hasMore = items.length > 4;
  const mostRecent = items.reduce(
    (latest, i) =>
      new Date(i.recorded_at) > new Date(latest.recorded_at) ? i : latest,
    items[0],
  );

  return (
    <div className="px-4 pb-1">
      <div className="space-y-1.5">
        {sorted.map((item) => {
          const stale = isStale(item.recorded_at);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                {!compact && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                )}
                <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                  {item.name}
                </p>
                <button onClick={onGetDirections} className="...">
                  <span className="flex items-center justify-center gap-1.5">
                    <Navigation size={14} /> Directions
                  </span>
                </button>
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-white shrink-0 ml-3">
                ₱{parseFloat(item.price).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
          +{items.length - 4} more items
        </p>
      )}
      {compact && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Updated {formatTimeAgo(mostRecent.recorded_at)}
        </p>
      )}
    </div>
  );
}
