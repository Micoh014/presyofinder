import { useState, useEffect } from 'react'
import { getAllItemsForUser } from '../services/db'

export function useAllItems(userId) {
  const [allItemsByStore, setAllItemsByStore] = useState({})

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function fetch() {
      const { data, error } = await getAllItemsForUser(userId)
      if (cancelled || error || !data) return
      const grouped = {}
      data.forEach((item) => {
        if (!grouped[item.store_id]) grouped[item.store_id] = []
        grouped[item.store_id].push(item)
      })
      setAllItemsByStore(grouped)
    }

    fetch()
    return () => { cancelled = true }
  }, [userId])

  return { allItemsByStore }
}