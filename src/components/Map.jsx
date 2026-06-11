import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  CircleMarker,
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
  const hex = color || "#6366f1";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.444 14.028 24.917 15.149 26.076a1.2 1.2 0 0 0 1.702 0C17.972 40.917 32 26.444 32 16 32 7.163 24.837 0 16 0z" fill="${hex}"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}
export default function Map() {
  const [userPosition, setUserPosition] = useState(null);
  const [pinPosition, setPinPosition] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showBasket, setShowBasket] = useState(false);

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
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationFound={setUserPosition} />
        <MapClickHandler
          onMapClick={(latlng) => {
            setPinPosition(latlng);
            setShowModal(true);
          }}
        />

        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            eventHandlers={{
              click: () => setSelectedStore(store),
            }}
          >
            <Popup>{store.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

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
          onClose={() => setSelectedStore(null)}
          onDelete={handleDeleteStore}
        />
      )}

      <SearchBar onResults={handleSearchResults} onClear={handleSearchClear} />

      {searching && (
        <SearchResults
          results={searchResults}
          onSelectStore={(store) => {
            setSelectedStore(store);
            setSearching(false);
          }}
        />
      )}
      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
      {showBasket && <Basket onClose={() => setShowBasket(false)} />}
    </div>
  );
}
