import { useMemo } from 'react'
import { getDistanceMeters } from '../services/mapUtils'

// Computes avg price per store and assigns a price tier (cheap/mid/expensive)
// relative to other stores currently in view. Falls back to 'neutral' when
// a store has no logged items yet, or when there's too few stores to rank.
export function useStoreTiers(stores, allItemsByStore, userPosition, radiusMeters) {
  return useMemo(() => {
    const inRadius = userPosition
      ? stores.filter(
          (s) =>
            getDistanceMeters(userPosition.lat, userPosition.lng, s.latitude, s.longitude) <=
            radiusMeters
        )
      : stores

    const withAvg = inRadius.map((store) => {
      const items = allItemsByStore[store.id] || []
      const avg =
        items.length > 0
          ? items.reduce((sum, i) => sum + parseFloat(i.price), 0) / items.length
          : null
      return { ...store, avgPrice: avg }
    })

    const priced = withAvg.filter((s) => s.avgPrice !== null).sort((a, b) => a.avgPrice - b.avgPrice)
    const tierSize = Math.ceil(priced.length / 3)

    const tierMap = {}
    priced.forEach((store, i) => {
      tierMap[store.id] = i < tierSize ? 'cheap' : i < tierSize * 2 ? 'mid' : 'expensive'
    })

    const tiered = withAvg.map((s) => ({
      ...s,
      tier: tierMap[s.id] || 'neutral',
    }))

    return { storesInRadius: tiered }
  }, [stores, allItemsByStore, userPosition, radiusMeters])
}