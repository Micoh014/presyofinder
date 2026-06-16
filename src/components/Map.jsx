import { useState, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { supabase } from "../lib/supabase";
import { showToast } from "../lib/toast";
import { getDistanceMeters } from "../lib/mapUtils";

import { useStores } from "../hooks/useStores";
import { useRoute } from "../hooks/useRoute";
import { useSearch } from "../hooks/useSearch";
import { useLocation } from "../hooks/useLocation";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

import LocationMarker from "./map/LocationMarker";
import MapClickHandler from "./map/MapClickHandler";
import MapRefSetter from "./map/MapRefSetter";
import StoreMarkers from "./map/StoreMarkers";
import FilterBar from "./map/FilterBar";
import BottomBar from "./map/BottomBar";
import TrailLine from "./map/TrailLine";

import AddStoreModal from "./AddStoreModal";
import StoreDetail from "./StoreDetail";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import Dashboard from "../pages/Dashboard";
import Basket from "./Basket";
import ConfirmDialog from "./ConfirmDialog";

export default function Map({ darkMode, userId }) {
  const { userPosition, onLocationFound, onLocationError } = useLocation();
  const [pinPosition, setPinPosition] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [trailTarget, setTrailTarget] = useState(null);
  const { confirmDialog, showConfirm, hideConfirm } = useConfirmDialog();

  const mapRef = useRef(null);

  const {
    stores,
    storesLoading,
    storesError,
    fetchStores,
    saveStore,
    deleteStore,
  } = useStores(userId);
  const { trailRoute, fetchRoute, clearRoute } = useRoute();
  const {
    searchResults,
    searching,
    sortMode,
    setSortMode,
    handleSearchResults,
    handleSearchClear,
    hideSearch,
    reshowSearch,
  } = useSearch();

  function handleRecenter() {
    if (!userPosition || !mapRef.current) return;
    mapRef.current.flyTo(userPosition, 16);
  }

  async function handleSaveStore(storeData) {
    const success = await saveStore(storeData);
    if (success) setShowModal(false);
  }

  function handleDeleteStore(storeId) {
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
  }

  function handleMapClick(latlng) {
    if (searching) {
      hideSearch();
      return;
    }

    const nearby = stores.find(
      (store) =>
        getDistanceMeters(
          latlng.lat,
          latlng.lng,
          store.latitude,
          store.longitude,
        ) < 20,
    );

    if (nearby) {
      showConfirm({
        title: "Nearby Store Found",
        message: `There's already a store "${nearby.name}" within 20 meters. Add a new pin anyway?`,
        confirmLabel: "Add Anyway",
        onConfirm: () => {
          hideConfirm();
          hideSearch();
          setPinPosition(latlng);
          setShowModal(true);
        },
      });
      return;
    }

    hideSearch();
    setPinPosition(latlng);
    setShowModal(true);
  }

  function handleDropPin() {
    hideSearch();
    if (!userPosition) return showToast("Waiting for your location...", "info");

    const nearby = stores.find(
      (store) =>
        getDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          store.latitude,
          store.longitude,
        ) < 20,
    );

    if (nearby) {
      showConfirm({
        title: "Nearby Store Found",
        message: `There's already a store "${nearby.name}" within 20 meters. Add a new pin anyway?`,
        confirmLabel: "Add Anyway",
        onConfirm: () => {
          hideConfirm();
          setPinPosition(userPosition);
          setShowModal(true);
        },
      });
      return;
    }

    setPinPosition(userPosition);
    setShowModal(true);
  }

  function handleSelectStoreFromSearch(store) {
    setTrailTarget(store);
    hideSearch();
    if (userPosition) fetchRoute(userPosition, store);
    if (mapRef.current)
      mapRef.current.flyTo([store.latitude, store.longitude], 16);
  }

  function handleCloseStoreDetail() {
    setSelectedStore(null);
    setTrailTarget(null);
    clearRoute();
  }

  function handleSearchClearFull() {
    handleSearchClear();
    setTrailTarget(null);
    clearRoute();
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[14.5995, 120.9842]}
        zoom={13}
        minZoom={2}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          noWrap={true}
        />
        <LocationMarker
          onLocationFound={onLocationFound}
          onLocationError={onLocationError}
        />
        <MapRefSetter mapRef={mapRef} />
        <MapClickHandler onMapClick={handleMapClick} />
        <StoreMarkers
          stores={stores}
          searchResults={searchResults}
          activeFilter={activeFilter}
          onStoreClick={setSelectedStore}
        />
        <TrailLine
          trailTarget={trailTarget}
          userPosition={userPosition}
          trailRoute={trailRoute}
        />
      </MapContainer>

      {/* Screen reader store list */}
      <div className="sr-only" aria-live="polite">
        <h2>Stores on map</h2>
        <ul>
          {stores
            .filter(
              (store) => activeFilter === "all" || store.type === activeFilter,
            )
            .map((store) => (
              <li key={store.id}>
                {store.name}, {store.type}
              </li>
            ))}
        </ul>
      </div>

      {/* Recenter button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRecenter();
        }}
        aria-label="Recenter map to my location"
        className="absolute top-4 right-4 z-1000 bg-white dark:bg-gray-800 text-blue-500 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
      >
        🏠
      </button>

      {/* Loading indicator */}
      {storesLoading && stores.length === 0 && (
        <div className="absolute top-4 left-4 z-1000 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
          Loading stores...
        </div>
      )}

      {/* Empty state */}
      {!storesLoading &&
        stores.filter((s) => activeFilter === "all" || s.type === activeFilter)
          .length === 0 && (
          <div className="absolute inset-0 z-999 flex items-center justify-center pointer-events-none px-6">
            <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl px-6 py-4 shadow-lg text-center max-w-xs">
              <p className="text-2xl mb-2">📍</p>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">
                No stores yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeFilter === "all"
                  ? 'Tap anywhere on the map to drop your first pin, or use the "+ Drop Pin" button below.'
                  : `No ${activeFilter} stores yet. Try a different filter or add one!`}
              </p>
            </div>
          </div>
        )}

      <SearchBar
        onResults={(results) => {
          handleSearchResults(results);
          setShowModal(false);
        }}
        onClear={handleSearchClearFull}
        userPosition={userPosition}
        getDistance={getDistanceMeters}
        onReshow={reshowSearch}
        onSortModeChange={setSortMode}
        userId={userId}
      />

      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <BottomBar
        onStats={() => setShowDashboard(true)}
        onDropPin={handleDropPin}
        onBasket={() => setShowBasket(true)}
      />

      {showModal && pinPosition && (
        <AddStoreModal
          position={pinPosition}
          onSave={handleSaveStore}
          onClose={() => setShowModal(false)}
        />
      )}

      {selectedStore && (
        <StoreDetail
          store={selectedStore}
          onClose={handleCloseStoreDetail}
          onDelete={handleDeleteStore}
          userId={userId}
        />
      )}

      {searching && searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          userPosition={userPosition}
          getDistance={getDistanceMeters}
          sortMode={sortMode}
          onSelectStore={handleSelectStoreFromSearch}
        />
      )}

      {showDashboard && (
        <Dashboard onClose={() => setShowDashboard(false)} userId={userId} />
      )}

      {showBasket && <Basket onClose={() => setShowBasket(false)} />}

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

      {storesError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-1000 bg-red-500 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {storesError} —{" "}
          <button onClick={fetchStores} className="underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
