import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import AddStoreModal from './AddStoreModal'
import { supabase } from '../lib/supabase'
import StoreDetail from './StoreDetail'

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

export default function Map() {
  const [userPosition, setUserPosition] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  

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

      {/* Drop Pin Button */}
      <button
        onClick={() => {
          if (!userPosition) return alert('Waiting for your location...')
          setShowModal(true)
        }}
        className="absolute bottom-8 right-4 z-1000 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg font-semibold text-sm"
      >
        + Drop Pin
      </button>

      {showModal && userPosition && (
        <AddStoreModal
          position={userPosition}
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
    </div>
  )
}
