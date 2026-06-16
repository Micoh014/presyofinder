import { useState } from 'react'
import { showToast } from '../lib/toast'

export function useLocation() {
  const [userPosition, setUserPosition] = useState(null)

  function onLocationFound(latlng) {
    setUserPosition(latlng)
  }

  function onLocationError() {
    showToast('Could not get your location. Please allow location access.', 'error')
  }

  return { userPosition, onLocationFound, onLocationError }
}