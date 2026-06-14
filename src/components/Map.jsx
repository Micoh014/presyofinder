import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  CircleMarker,
  Polyline,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import AddStoreModal from "./AddStoreModal";
import { supabase } from "../lib/supabase";
import StoreDetail from "./StoreDetail";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import Dashboard from "../pages/Dashboard";
import Basket from "./Basket";
import { useRef } from "react";

function LocationMarker({ onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });

    map.on("locationfound", (e) => {
      onLocationFound(e.latlng);
      L.circleMarker(e.latlng, {
        radius: 10,
        fillColor: "#3b82f6",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
    });

    map.on("locationerror", () => {
      alert("Could not get your location. Please allow location access.");
    });
  }, [map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}
function getPinColor(store, searchResults) {
  if (!searchResults || searchResults.length === 0) return "#6366f1";

  const prices = searchResults.map((r) => r.price);
  const cheapest = Math.min(...prices);
  const mostExpensive = Math.max(...prices);

  const storeResult = searchResults.find((r) => r.stores?.id === store.id);
  if (!storeResult) return "#9ca3af";

  if (storeResult.price === cheapest) return "#22c55e";
  if (storeResult.price === mostExpensive) return "#ef4444";
  return "#eab308";
}
function createColoredIcon(color) {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 42;
  const ctx = canvas.getContext("2d");

  // Draw teardrop pin shape
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw pointer
  ctx.beginPath();
  ctx.moveTo(10, 26);
  ctx.lineTo(16, 42);
  ctx.lineTo(22, 26);
  ctx.fillStyle = color;
  ctx.fill();

  // White circle inside
  ctx.beginPath();
  ctx.arc(16, 16, 6, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  return L.icon({
    iconUrl: canvas.toDataURL(),
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const STORE_TYPE_FILTERS = [
  { value: "all", label: "All", icon: "📍" },
  { value: "sari-sari", label: "Sari-sari", icon: "🏪" },
  { value: "karinderia", label: "Karinderia", icon: "🍚" },
  { value: "palengke", label: "Palengke", icon: "🥬" },
  { value: "mall", label: "Mall", icon: "🏬" },
  { value: "supermarket", label: "Supermarket", icon: "🛒" },
  { value: "street-vendor", label: "Street Vendor", icon: "🛵" },
  { value: "online", label: "Online", icon: "📦" },
];

function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map]);
  return null;
}

export default function Map({ darkMode }) {
  const [userPosition, setUserPosition] = useState(null);
  const [pinPosition, setPinPosition] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showBasket, setShowBasket] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const mapRef = useRef(null);
  const [trailTarget, setTrailTarget] = useState(null);
  const [sortMode, setSortMode] = useState("price-asc");

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    const { data } = await supabase.from("stores").select("*");
    if (data) setStores(data);
  }

  async function handleSaveStore(storeData) {
    const { error } = await supabase.from("stores").insert([storeData]);
    if (error) return alert("Error saving store: " + error.message);
    setShowModal(false);
    fetchStores();
  }

  function handleSearchResults(results) {
    setSearchResults(results);
    setSearching(true);
  }

  function handleSearchClear() {
    setSearchResults([]);
    setSearching(false);
    setTrailTarget(null);
  }
  function handleRecenter() {
    if (!userPosition || !mapRef.current) return;
    mapRef.current.flyTo(userPosition, 16);
  }
  async function handleDeleteStore(storeId) {
    if (!confirm("Delete this store and all its items?")) return;
    const { error } = await supabase.from("stores").delete().eq("id", storeId);
    if (error) return alert("Error deleting store: " + error.message);
    setSelectedStore(null);
    fetchStores();
  }
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[14.5995, 120.9842]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        <LocationMarker onLocationFound={setUserPosition} />
        <MapRefSetter mapRef={mapRef} />

        <MapClickHandler
          onMapClick={(latlng) => {
            if (searching) {
              setSearching(false);
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
              const proceed = confirm(
                `There's already a store "${nearby.name}" within 20 meters. Add a new pin anyway?`,
              );
              if (!proceed) return;
            }

            setPinPosition(latlng);
            setShowModal(true);
          }}
        />

        {stores
          .filter(
            (store) => activeFilter === "all" || store.type === activeFilter,
          )
          .map((store) => (
            <Marker
              key={`${store.id}-${getPinColor(store, searchResults)}`}
              position={[store.latitude, store.longitude]}
              icon={createColoredIcon(getPinColor(store, searchResults))}
              eventHandlers={{
                click: () => setSelectedStore(store),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
            >
              <Popup closeButton={false} autoPan={false}>
                <span className="text-sm font-medium">{store.name}</span>
              </Popup>
            </Marker>
          ))}

        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full overflow-x-auto px-4 z-1000">
          <div className="flex gap-2 w-max mx-auto">
            {STORE_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-md transition-colors ${
                  activeFilter === f.value
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                {f.icon} {f.label}
              </button>
            ))}

            {trailTarget && userPosition && (
              <Polyline
                positions={[
                  [userPosition.lat, userPosition.lng],
                  [trailTarget.latitude, trailTarget.longitude],
                ]}
                pathOptions={{ color: "#3b82f6", weight: 3, dashArray: "8, 8" }}
              />
            )}
          </div>
        </div>
      </MapContainer>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRecenter();
        }}
        className="absolute top-4 right-4 z-1000 bg-white dark:bg-gray-800 text-blue-500 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
        title="Recenter to my location"
      >
        🏠
      </button>

      {/* Bottom Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 flex gap-3">
        <button
          onClick={() => setShowDashboard(true)}
          className="flex items-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-full shadow-lg font-semibold text-sm border border-gray-100"
        >
          📊 Stats
        </button>
        <button
          onClick={() => {
            if (!userPosition) return alert("Waiting for your location...");
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
              const proceed = confirm(
                `There's already a store "${nearby.name}" within 20 meters. Add a new pin anyway?`,
              );
              if (!proceed) return;
            }
            setPinPosition(userPosition);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm"
        >
          + Drop Pin
        </button>
        <button
          onClick={() => setShowBasket(true)}
          className="flex items-center gap-2 bg-white text-gray-700 px-5 py-3 rounded-full shadow-lg font-semibold text-sm border border-gray-100"
        >
          🧺 Basket
        </button>
      </div>

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
          onClose={() => {
            setSelectedStore(null);
            setTrailTarget(null);
          }}
          onDelete={handleDeleteStore}
        />
      )}

      <SearchBar
        onResults={handleSearchResults}
        onClear={handleSearchClear}
        userPosition={userPosition}
        getDistance={getDistanceMeters}
        onReshow={() => {
          if (searchResults.length > 0) setSearching(true);
        }}
        onSortModeChange={setSortMode}
      />

      {searching && searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          userPosition={userPosition}
          getDistance={getDistanceMeters}
          sortMode={sortMode}
          onSelectStore={(store) => {
            setTrailTarget(store);
            setSearching(false);
            if (mapRef.current) {
              mapRef.current.flyTo([store.latitude, store.longitude], 16);
            }
          }}
        />
      )}
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
      {showBasket && <Basket onClose={() => setShowBasket(false)} />}
    </div>
  );
}
