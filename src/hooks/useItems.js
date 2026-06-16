import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../lib/toast'

export function useItems(storeId, userId) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (storeId) fetchItems()
  }, [storeId])

  async function fetchItems() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('store_id', storeId)
      .order('recorded_at', { ascending: false })
    if (data) setItems(data)
  }

  async function addItem(name, price) {
    const { error } = await supabase.from('items').insert([{
      store_id: storeId,
      name: name.trim(),
      price: parseFloat(price),
      user_id: userId,
    }])
    if (error) {
      showToast('Error saving item: ' + error.message, 'error')
      return false
    }
    await fetchItems()
    return true
  }

  async function updateItem(itemId, name, price) {
    const { error } = await supabase
      .from('items')
      .update({ name: name.trim(), price: parseFloat(price), recorded_at: new Date().toISOString() })
      .eq('id', itemId)
    if (error) {
      showToast('Error updating item: ' + error.message, 'error')
      return false
    }
    await fetchItems()
    return true
  }

  async function deleteItem(itemId) {
    const { error } = await supabase.from('items').delete().eq('id', itemId)
    if (error) {
      showToast('Error deleting item: ' + error.message, 'error')
      return false
    }
    await fetchItems()
    return true
  }

  async function addItemsBatch(scannedItems) {
    for (const item of scannedItems) {
      await supabase.from('items').insert([{
        store_id: storeId,
        name: item.name,
        price: parseFloat(item.price),
        user_id: userId,
      }])
    }
    await fetchItems()
  }

  return { items, fetchItems, addItem, updateItem, deleteItem, addItemsBatch }
}