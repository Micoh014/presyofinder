import { useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useStores } from "../../hooks/useStores";
import { useAllItems } from "../../hooks/useAllItems";
import { useStoreTiers } from "../../hooks/useStoreTiers";
import { useLocation } from "../../hooks/useLocation";
import { createColoredIcon } from "../../lib/mapUtils";
import SearchTab from "./SearchTab";

const TIER_COLORS = {
  cheap: "#22c55e",
  mid: "#f59e0b",
  expensive: "#ef4444",
  neutral: "#6366f1",
};

export default function DesktopLayout({ darkMode, userId }) {
  const [activeTab, setActiveTab] = useState("search"); // "search" | "log" | "basket"
  const [radiusMeters, setRadiusMeters] = useState(3000);
  const [selectedStore, setSelectedStore] = useState(null);
  const mapRef = useRef(null);

  const { userPosition, onLocationFound, onLocationError } = useLocation();
  const { stores, storesLoading, storesError, fetchStores, saveStore } =
    useStores(userId);
  const { allItemsByStore } = useAllItems(userId);
  const { storesInRadius } = useStoreTiers(
    stores,
    allItemsByStore,
    userPosition,
    radiusMeters,
  );

  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const handlePinClick = useCallback((store) => {
    setSelectedStore(store);
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div
        style={{
          width: 380,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--color-border, #e5e7eb)",
        }}
        className="bg-white dark:bg-gray-900"
      >
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          {[
            { key: "search", label: "🔍 Search" },
            { key: "log", label: "📝 Log" },
            { key: "basket", label: "🧺 Basket" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-green-500 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "search" && (
            <SearchTab
              userId={userId}
              userPosition={userPosition}
              onSelectStore={(store) => {
                setSelectedStore(store);
                if (mapRef.current) {
                  mapRef.current.flyTo([store.latitude, store.longitude], 16);
                }
              }}
            />
          )}

          {activeTab === "log" && (
            <div className="text-sm text-gray-400">Log tab — wiring next</div>
          )}
          {activeTab === "basket" && (
            <div className="text-sm text-gray-400">
              Basket tab — wiring next
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-2">
            Search radius — {(radiusMeters / 1000).toFixed(1)}km
          </label>
          <input
            type="range"
            min="500"
            max="10000"
            step="500"
            value={radiusMeters}
            onChange={(e) => setRadiusMeters(Number(e.target.value))}
            className="w-full accent-green-500"
          />
        </div>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={[14.5995, 120.9842]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrl}
          />
          {storesInRadius.map((store) => (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude]}
              icon={createColoredIcon(TIER_COLORS[store.tier])}
              eventHandlers={{ click: () => handlePinClick(store) }}
            >
              <Popup>
                <strong>{store.name}</strong>
                <br />
                {store.avgPrice
                  ? `Avg ₱${store.avgPrice.toFixed(2)}`
                  : "No prices logged yet"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {storesLoading && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow text-xs text-gray-500 dark:text-gray-400">
            Loading stores...
          </div>
        )}
      </div>
    </div>
  );
}
