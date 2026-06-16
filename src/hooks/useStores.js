import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../lib/toast'

export function useStores(userId) {
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(true)

  useEffect(() => {
    if (userId) fetchStores()
  }, [userId])

  async function fetchStores() {
    setStoresLoading(true)
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)
    if (data) setStores(data)
    setStoresLoading(false)
  }

  async function saveStore(storeData) {
    const { error } = await supabase
      .from('stores')
      .insert([{ ...storeData, user_id: userId }])
    if (error) {
      showToast('Error saving store: ' + error.message, 'error')
      return false
    }
    await fetchStores()
    return true
  }

  async function deleteStore(storeId) {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId)
    if (error) {
      showToast('Error deleting store: ' + error.message, 'error')
      return false
    }
    await fetchStores()
    return true
  }

  return { stores, storesLoading, fetchStores, saveStore, deleteStore }
}