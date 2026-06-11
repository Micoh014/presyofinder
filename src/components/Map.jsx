import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import AddStoreModal from './AddStoreModal'
import { supabase } from '../lib/supabase'
import StoreDetail from './StoreDetail'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'

function LocationMarker({ onLocationFound }) {
  const map = useMap()

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 })

    map.on('locationfound', (e) => {
      onLocationFound(e.latlng)
      L.circleMarker(e.latlng, {
        radius: 10,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map)
    })

    map.on('locationerror', () => {
      alert('Could not get your location. Please allow location access.')
    })
  }, [map])

  return null
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng)
  })
  return null
}

export default function Map() {
  const [userPosition, setUserPosition] = useState(null)
  const [pinPosition, setPinPosition] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [])

  async function fetchStores() {
    const { data } = await supabase.from('stores').select('*')
    if (data) setStores(data)
  }

  async function handleSaveStore(storeData) {
    const { error } = await supabase.from('stores').insert([storeData])
    if (error) return alert('Error saving store: ' + error.message)
    setShowModal(false)
    fetchStores()
  }

  function handleSearchResults(results) {
    setSearchResults(results)
    setSearching(true)
  }

  function handleSearchClear() {
    setSearchResults([])
    setSearching(false)
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[14.5995, 120.9842]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationFound={setUserPosition} />
        <MapClickHandler onMapClick={(latlng) => {
          setPinPosition(latlng)
          setShowModal(true)
        }} />

        {stores.map(store => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            eventHandlers={{
              click: () => setSelectedStore(store)
            }}
          >
            <Popup>{store.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={() => {
          if (!userPosition) return alert('Waiting for your location...')
          setPinPosition(userPosition)
          setShowModal(true)
        }}
        className="absolute bottom-8 right-4 z-[1000] bg-green-500 text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm"
      >
        + Drop Pin
      </button>

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
        />
      )}

      <SearchBar onResults={handleSearchResults} onClear={handleSearchClear} />

      {searching && (
        <SearchResults
          results={searchResults}
          onSelectStore={(store) => {
            setSelectedStore(store)
            setSearching(false)
          }}
        />
      )}
    </div>
  )
}