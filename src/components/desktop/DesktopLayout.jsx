import { useState, useRef, useCallback, useEffect } from "react";
import { User, CirclePlus, ShoppingBasket, LocateFixed } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { latLng } from "leaflet";

import SearchTab from "./SearchTab";
import StorePanelDesktop from "./StorePanelDesktop";
import LogTab from "./LogTab";
import DesktopTopBar from "./DesktopTopBar";

import AddStoreModal from "../AddStoreModal";
import ConfirmDialog from "../ConfirmDialog";
import BasketPanel from "../BasketPanel";
import StorePriceCard from "../StorePriceCard";

import { useItems } from "../../hooks/useItems";
import { useStores } from "../../hooks/useStores";
import { useAllItems } from "../../hooks/useAllItems";
import { useStoreTiers } from "../../hooks/useStoreTiers";
import { useLocation } from "../../hooks/useLocation";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

import { createColoredIcon } from "../../services/mapUtils";
import { getDistanceMeters } from "../../services/mapUtils";

import LocationMarker from "../map/LocationMarker";

const TIER_COLORS = {
  cheap: "#22c55e",
  mid: "#f59e0b",
  expensive: "#ef4444",
  neutral: "#6366f1",
};

export default function DesktopLayout({
  darkMode,
  toggleDarkMode,
  userId,
  userEmail,
}) {
  const [activeTab, setActiveTab] = useState("search"); // "search" | "log" | "basket"
  const [radiusMeters, setRadiusMeters] = useState(3000);
  const [selectedStore, setSelectedStore] = useState(null);
  const mapRef = useRef(null);
  const hasCenteredRef = useRef(false);
  const { userPosition, onLocationFound, onLocationError } = useLocation();
  const [cardPosition, setCardPosition] = useState(null);
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
  const [logStoreId, setLogStoreId] = useState(null);
  const { addItem: addLogItem } = useItems(logStoreId, userId);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [pinPosition, setPinPosition] = useState(null);
  const { confirmDialog, showConfirm, hideConfirm } = useConfirmDialog();
  const [previewStore, setPreviewStore] = useState(null);
  const [basketCount, setBasketCount] = useState(0);

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
    ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const handlePinClick = useCallback((store) => {
    setPreviewStore(store);
  }, []);
  const handleDropPin = useCallback(() => {
    if (!userPosition) return;
    setPinPosition(userPosition);
    setShowAddStoreModal(true);
  }, [userPosition]);

  useEffect(() => {
    if (!previewStore || !mapRef.current) {
      setCardPosition(null);
      return;
    }
    const map = mapRef.current;
    function updatePosition() {
      const point = map.latLngToContainerPoint([
        previewStore.latitude,
        previewStore.longitude,
      ]);
      setCardPosition({ x: point.x, y: point.y });
    }
    updatePosition();
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);
    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [previewStore]);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var (--color-border, #e5e7eb)",
        }}
        className="bg-white dark:bg-gray-900"
      >
        <div className="px-4 pt-4 pb-3 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-sm shadow-green-200">
            <span className="text-white text-sm">📍</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none tracking-tight">
              PresyoFinder
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">
              Track prices. Find deals.
            </p>
          </div>
        </div>

        <div className="flex gap-0 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
          {[
            { key: "search", Icon: User, label: "Browse" },
            { key: "log", Icon: CirclePlus, label: "Log" },
            {
              key: "basket",
              Icon: ShoppingBasket,
              label: "Basket",
              badge: basketCount,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <tab.Icon size={15} strokeWidth={2.25} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "search" && (
            <SearchTab
              userId={userId}
              userPosition={userPosition}
              radiusMeters={radiusMeters}
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
                setLogStoreId(store.id);
                if (mapRef.current) {
                  mapRef.current.flyTo([store.latitude, store.longitude], 16);
                }
              }}
              onSubmitItem={async (name, price) => {
                const ok = await addLogItem(name, price);
                return ok;
              }}
              onDropPin={handleDropPin}
            />
          )}

          {activeTab === "basket" && (
            <BasketPanel
              userId={userId}
              onSelectStore={(store) => {
                setSelectedStore(store);
                if (mapRef.current) {
                  mapRef.current.flyTo([store.latitude, store.longitude], 16);
                }
              }}
              onItemsChange={setBasketCount}
            />
          )}
        </div>

        {activeTab === "search" && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Search radius
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {(radiusMeters / 1000).toFixed(1)} km
              </p>
            </div>
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
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <DesktopTopBar
          userPosition={userPosition}
          onDropPin={handleDropPin}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          userEmail={userEmail}
        />
        <div style={{ flex: 1, position: "relative" }}>
          <MapContainer
            center={[14.5995, 120.9842]}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
            className={darkMode ? "map-dark-mode" : ""}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              key={darkMode ? "dark" : "light"}
              attribution='&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
              url={tileUrl}
            />
            <ZoomControl position="bottomright" />

            <LocationMarker
              onLocationFound={handleLocationFound}
              onLocationError={onLocationError}
            />
            {userPosition && (
              <Circle
                center={[userPosition.lat, userPosition.lng]}
                radius={radiusMeters}
                pathOptions={{
                  color: darkMode ? "#4ade80" : "#15803d",
                  weight: 2.5,
                  opacity: 0.9,
                  dashArray: "8 6",
                  fillColor: "#22c55e",
                  fillOpacity: darkMode ? 0.06 : 0.1,
                }}
              />
            )}
            {storesInRadius.map((store) => (
              <Marker
                key={store.id}
                position={[store.latitude, store.longitude]}
                icon={createColoredIcon(TIER_COLORS[store.tier])}
                eventHandlers={{ click: () => handlePinClick(store) }}
              ></Marker>
            ))}
          </MapContainer>

          <button
            onClick={() => {
              if (!userPosition || !mapRef.current) return;
              mapRef.current.flyTo([userPosition.lat, userPosition.lng], 16);
            }}
            aria-label="Recenter map to my location"
            disabled={!userPosition}
            className="absolute bottom-24 right-2.5 z-700 bg-white dark:bg-gray-800 text-white-500 dark:text-blue-400 w-9 h-9 rounded-md shadow-md flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <LocateFixed size={18} />
          </button>

          {previewStore && !selectedStore && cardPosition && (
            <StorePriceCard
              store={previewStore}
              userId={userId}
              variant="popover"
              position={cardPosition}
              tierColor={TIER_COLORS[previewStore.tier]}
              distanceMeters={
                userPosition
                  ? getDistanceMeters(
                      userPosition.lat,
                      userPosition.lng,
                      previewStore.latitude,
                      previewStore.longitude,
                    )
                  : null
              }
              onClose={() => setPreviewStore(null)}
              onLogPrice={() => {
                setSelectedStore(previewStore);
                setPreviewStore(null);
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
    </div>
  );
}
