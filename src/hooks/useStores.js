import { useState, useEffect } from 'react'
import { showToast } from '../lib/toast'
import { getStores, insertStore, deleteStoreById } from '../lib/db'
import { isRateLimited } from '../lib/rateLimit'

export function useStores(userId) {
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [storesError, setStoresError] = useState(null)

  useEffect(() => {
    if (userId) fetchStores()
  }, [userId])

  async function fetchStores() {
    setStoresLoading(true)
    setStoresError(null)
    const { data, error } = await getStores(userId)
    if (error) {
      setStoresError('Could not load stores. Check your connection and try again.')
      showToast('Failed to load stores.', 'error')
    } else {
      setStores(data ?? [])
    }
    setStoresLoading(false)
  }

  async function saveStore(storeData) {
     if (isRateLimited('saveStore', 2000)) {
    showToast('Please wait before adding another store.', 'error')
    return false
    }
    const { error } = await insertStore({ ...storeData, user_id: userId })
    if (error) {
      showToast('Error saving store: ' + error.message, 'error')
      return false
    }
    await fetchStores()
    showToast('Store saved!', 'success')
    return true
  }

  async function deleteStore(storeId) {
    if (!storeId) return false
    const { error } = await deleteStoreById(storeId)
    if (error) {
      showToast('Error deleting store: ' + error.message, 'error')
      return false
    }
    await fetchStores()
    return true
  }

  return { stores, storesLoading, storesError, fetchStores, saveStore, deleteStore }
}