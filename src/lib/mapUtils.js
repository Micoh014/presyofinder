import L from 'leaflet'

export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getPinColor(store, searchResults) {
  if (!searchResults || searchResults.length === 0) return '#6366f1'

  const prices = searchResults.map((r) => r.price)
  const cheapest = Math.min(...prices)
  const mostExpensive = Math.max(...prices)

  const storeResult = searchResults.find((r) => r.stores?.id === store.id)
  if (!storeResult) return '#9ca3af'

  if (storeResult.price === cheapest) return '#22c55e'
  if (storeResult.price === mostExpensive) return '#ef4444'
  return '#eab308'
}

export function createColoredIcon(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 42
  const ctx = canvas.getContext('2d')

  ctx.beginPath()
  ctx.arc(16, 16, 14, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(10, 26)
  ctx.lineTo(16, 42)
  ctx.lineTo(22, 26)
  ctx.fillStyle = color
  ctx.fill()

  ctx.beginPath()
  ctx.arc(16, 16, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()

  return L.icon({
    iconUrl: canvas.toDataURL(),
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })
}

export const STORE_TYPE_FILTERS = [
  { value: 'all', label: 'All', icon: '📍' },
  { value: 'sari-sari', label: 'Sari-sari', icon: '🏪' },
  { value: 'karinderia', label: 'Karinderia', icon: '🍚' },
  { value: 'palengke', label: 'Palengke', icon: '🥬' },
  { value: 'mall', label: 'Mall', icon: '🏬' },
  { value: 'supermarket', label: 'Supermarket', icon: '🛒' },
  { value: 'street-vendor', label: 'Street Vendor', icon: '🛵' },
  { value: 'online', label: 'Online', icon: '📦' },
]