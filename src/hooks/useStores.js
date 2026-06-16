import { useState, useEffect } from 'react'
import { showToast } from '../lib/toast'
import { getStores, insertStore, deleteStoreById } from '../lib/db'

export function useStores(userId) {
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)

  useEffect(() => {
    if (userId) fetchStores()
  }, [userId])

  async function fetchStores() {
    setStoresLoading(true)
    const { data } = await getStores(userId)
    if (data) setStores(data)
    setStoresLoading(false)
  }

  async function saveStore(storeData) {
    const { error } = await insertStore({ ...storeData, user_id: userId })
    if (error) {
      showToast('Error saving store: ' + error.message, 'error')
      return false
    }
    await fetchStores()
    return true
  }

  async function deleteStore(storeId) {
    const { error } = await deleteStoreById(storeId)
    if (error) {
      showToast('Error deleting store: ' + error.message, 'error')
      return false
    }
    await fetchStores()
    return true
  }

  return { stores, storesLoading, fetchStores, saveStore, deleteStore }
}