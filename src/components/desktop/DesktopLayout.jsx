import { useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { useStores } from "../../hooks/useStores";
import { useAllItems } from "../../hooks/useAllItems";
import { useStoreTiers } from "../../hooks/useStoreTiers";
import { useLocation } from "../../hooks/useLocation";
import { createColoredIcon } from "../../services/mapUtils";
import SearchTab from "./SearchTab";
import LogTab from "./LogTab";
import StorePanelDesktop from "./StorePanelDesktop";
import AddStoreModal from "../AddStoreModal";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import ConfirmDialog from "../ConfirmDialog";
import LocationMarker from "../map/LocationMarker";
import { latLng } from "leaflet";
import BasketPanel from "../BasketPanel";
import StorePriceCard from "../StorePriceCard";

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
  const hasCenteredRef = useRef(false);
  const { userPosition, onLocationFound, onLocationError } = useLocation();
  const {
    stores,
    storesLoading,
    storesError,
    fetchStores,
    saveStore,
    deleteStore,
  } = useStores(userId);
  const { allItemsByStore } = useAllItems(userId);
  const { storesInRadius } = useStoreTiers(
    stores,
    allItemsByStore,
    userPosition,
    radiusMeters,
  );
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const { confirmDialog, showConfirm, hideConfirm } = useConfirmDialog();
  const [previewStore, setPreviewStore] = useState(null);

  const handleLocationFound = useCallback(
    (latlng) => {
      onLocationFound(latlng);
      if (!hasCenteredRef.current && mapRef.current) {
        hasCenteredRef.current = true;
        mapRef.current.flyTo([latlng.lat, latlng.lng], 15);
      }
    },
    [onLocationFound],
  );
  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const handlePinClick = useCallback((store) => {
    setPreviewStore(store);
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
            <LogTab
              stores={stores}
              storesLoading={storesLoading}
              userPosition={userPosition}
              radiusMeters={radiusMeters}
              onSelectStore={(store) => {
                setSelectedStore(store);
                if (mapRef.current) {
                  mapRef.current.flyTo([store.latitude, store.longitude], 16);
                }
              }}
              onDropPin={() => {
                if (!userPosition) return;
                setPinPosition(userPosition);
                setShowAddStoreModal(true);
              }}
            />
          )}

          {activeTab === "basket" && (
            <BasketPanel
              onSelectStore={(store) => {
                setSelectedStore(store);
                if (mapRef.current) {
                  mapRef.current.flyTo([store.latitude, store.longitude], 16);
                }
              }}
            />
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
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrl}
          />
          <ZoomControl position="bottomright" />

          <LocationMarker
            onLocationFound={handleLocationFound}
            onLocationError={onLocationError}
          />
          {storesInRadius.map((store) => (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude]}
              icon={createColoredIcon(TIER_COLORS[store.tier])}
              eventHandlers={{ click: () => handlePinClick(store) }}
            ></Marker>
          ))}
        </MapContainer>

        {previewStore && !selectedStore && (
          <StorePriceCard
            store={previewStore}
            userId={userId}
            onClose={() => setPreviewStore(null)}
            onViewFull={() => {
              setSelectedStore(previewStore);
              setPreviewStore(null);
            }}
            onGetDirections={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${previewStore.latitude},${previewStore.longitude}`,
                "_blank",
              );
            }}
          />
        )}

        {selectedStore && (
          <StorePanelDesktop
            store={selectedStore}
            userId={userId}
            onClose={() => setSelectedStore(null)}
            onDelete={(storeId) => {
              showConfirm({
                title: "Delete Store?",
                message:
                  "This will also delete all items logged for this store. This cannot be undone.",
                danger: true,
                onConfirm: async () => {
                  hideConfirm();
                  const success = await deleteStore(storeId);
                  if (success) setSelectedStore(null);
                },
              });
            }}
          />
        )}

        {showAddStoreModal && pinPosition && (
          <AddStoreModal
            position={pinPosition}
            onSave={async (storeData) => {
              const success = await saveStore(storeData);
              if (success) setShowAddStoreModal(false);
            }}
            onClose={() => setShowAddStoreModal(false)}
          />
        )}

        {storesLoading && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow text-xs text-gray-500 dark:text-gray-400">
            Loading stores...
          </div>
        )}
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            danger={confirmDialog.danger}
            onConfirm={confirmDialog.onConfirm}
            onCancel={hideConfirm}
          />
        )}
      </div>
    </div>
  );
}
