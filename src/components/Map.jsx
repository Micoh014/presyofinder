import { useState, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
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
import ConfirmDialog from "./ConfirmDialog";

import Spinner from "./ui/Spinner";
import EmptyState from "./ui/EmptyState";

// Code-split heavy panels — only loaded when first opened
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Basket = lazy(() => import("./Basket"));

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

  // Memoize filtered stores so StoreMarkers and the SR list
  // don't recompute on every unrelated state change
  const filteredStores = useMemo(
    () =>
      activeFilter === "all"
        ? stores
        : stores.filter((s) => s.type === activeFilter),
    [stores, activeFilter],
  );

  // Memoize tile URL so TileLayer doesn't remount on unrelated re-renders
  const tileUrl = useMemo(
    () =>
      darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    [darkMode],
  );

  // Stable callbacks — these won't change reference between renders,
  // so children wrapped in React.memo won't re-render unnecessarily
  const handleRecenter = useCallback(() => {
    if (!userPosition || !mapRef.current) return;
    mapRef.current.flyTo(userPosition, 16);
  }, [userPosition]);

  const handleSaveStore = useCallback(
    async (storeData) => {
      const success = await saveStore(storeData);
      if (success) setShowModal(false);
    },
    [saveStore],
  );

  const handleDeleteStore = useCallback(
    (storeId) => {
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
    },
    [showConfirm, hideConfirm, deleteStore],
  );

  const handleMapClick = useCallback(
    (latlng) => {
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
    },
    [searching, stores, showConfirm, hideConfirm, hideSearch],
  );

  const handleDropPin = useCallback(() => {
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
  }, [hideSearch, userPosition, stores, showConfirm, hideConfirm]);

  const handleSelectStoreFromSearch = useCallback(
    (store) => {
      setTrailTarget(store);
      hideSearch();
      if (userPosition) fetchRoute(userPosition, store);
      if (mapRef.current)
        mapRef.current.flyTo([store.latitude, store.longitude], 16);
    },
    [hideSearch, userPosition, fetchRoute],
  );

  const handleCloseStoreDetail = useCallback(() => {
    setSelectedStore(null);
    setTrailTarget(null);
    clearRoute();
  }, [clearRoute]);

  const handleSearchClearFull = useCallback(() => {
    handleSearchClear();
    setTrailTarget(null);
    clearRoute();
  }, [handleSearchClear, clearRoute]);

  const handleSearchResultsWithClose = useCallback(
    (results) => {
      handleSearchResults(results);
      setShowModal(false);
    },
    [handleSearchResults],
  );

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
          url={tileUrl}
          noWrap={true}
        />
        <LocationMarker
          onLocationFound={onLocationFound}
          onLocationError={onLocationError}
        />
        <MapRefSetter mapRef={mapRef} />
        <MapClickHandler onMapClick={handleMapClick} />
        <StoreMarkers
          stores={filteredStores}
          searchResults={searchResults}
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
          {filteredStores.map((store) => (
            <li key={store.id}>
              {store.name}, {store.type}
            </li>
          ))}
        </ul>
      </div>

      {/* Recenter */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRecenter();
        }}
        aria-label="Recenter map to my location"
        className="absolute bottom-24 right-4 z-1000 bg-white dark:bg-gray-800 text-blue-500 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
      >
        🏠
      </button>

      {/* Loading */}
      {storesLoading && stores.length === 0 && (
        <div className="absolute top-4 left-4 z-1000 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Spinner size="sm" />
          Loading stores...
        </div>
      )}

      {/* Empty state */}
      {!storesLoading && filteredStores.length === 0 && (
        <div className="absolute inset-0 z-999 flex items-center justify-center pointer-events-none px-6">
          <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl px-6 py-4 shadow-lg max-w-xs">
            <EmptyState
              title="No stores yet"
              description={
                activeFilter === "all"
                  ? 'Tap anywhere on the map or use the "+ Drop Pin" button below.'
                  : `No ${activeFilter} stores yet. Try a different filter or add one!`
              }
            />
          </div>
        </div>
      )}

      <div className="absolute top-3 left-0 right-0 z-1000 px-3">
        <div style={{ width: "100%", marginBottom: "8px" }}>
          <SearchBar
            onResults={handleSearchResultsWithClose}
            onClear={handleSearchClearFull}
            userPosition={userPosition}
            getDistance={getDistanceMeters}
            onReshow={reshowSearch}
            onSortModeChange={setSortMode}
            userId={userId}
          />
        </div>
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

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

      {/* Lazy-loaded panels — Suspense fallback is a simple spinner */}
      {showDashboard && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-2000">
              <Spinner size="lg" />
            </div>
          }
        >
          <Dashboard onClose={() => setShowDashboard(false)} userId={userId} />
        </Suspense>
      )}

      {showBasket && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
              <Spinner size="lg" />
            </div>
          }
        >
          <Basket onClose={() => setShowBasket(false)} />
        </Suspense>
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
