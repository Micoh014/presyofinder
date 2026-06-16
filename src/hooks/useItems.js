import { useState, useEffect } from 'react'
import { showToast } from '../lib/toast'
import { getItems, insertItem, updateItemById, deleteItemById } from '../lib/db'

export function useItems(storeId, userId) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (storeId) fetchItems()
  }, [storeId])

  async function fetchItems() {
    const { data } = await getItems(storeId)
    if (data) setItems(data)
  }

  async function addItem(name, price) {
    const { error } = await insertItem({
      store_id: storeId,
      name: name.trim(),
      price: parseFloat(price),
      user_id: userId,
    })
    if (error) {
      showToast('Error saving item: ' + error.message, 'error')
      return false
    }
    await fetchItems()
    return true
  }

  async function updateItem(itemId, name, price) {
    const { error } = await updateItemById(itemId, {
      name: name.trim(),
      price: parseFloat(price),
      recorded_at: new Date().toISOString(),
    })
    if (error) {
      showToast('Error updating item: ' + error.message, 'error')
      return false
    }
    await fetchItems()
    return true
  }

  async function deleteItem(itemId) {
    const { error } = await deleteItemById(itemId)
    if (error) {
      showToast('Error deleting item: ' + error.message, 'error')
      return false
    }
    await fetchItems()
    return true
  }

  async function addItemsBatch(scannedItems) {
    for (const item of scannedItems) {
      await insertItem({
        store_id: storeId,
        name: item.name,
        price: parseFloat(item.price),
        user_id: userId,
      })
    }
    await fetchItems()
  }

  return { items, fetchItems, addItem, updateItem, deleteItem, addItemsBatch }
}