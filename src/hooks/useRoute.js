import { useState } from 'react'

export function useRoute() {
  const [trailRoute, setTrailRoute] = useState(null)

  async function fetchRoute(start, end) {
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data = await res.json()
      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setTrailRoute(coords)
      }
    } catch (err) {
      console.error('Routing error:', err)
      setTrailRoute(null)
    }
  }

  function clearRoute() {
    setTrailRoute(null)
  }

  return { trailRoute, fetchRoute, clearRoute }
}