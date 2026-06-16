import { useState, useEffect } from 'react'
import { showToast } from '../lib/toast'
import { getItems, insertItem, updateItemById, deleteItemById } from '../lib/db'
import { isRateLimited } from '../lib/rateLimit'


export function useItems(storeId, userId) {
  const [items, setItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState(null)

  useEffect(() => {
    if (storeId) fetchItems()
  }, [storeId])

  async function fetchItems() {
    setItemsLoading(true)
    setItemsError(null)
    const { data, error } = await getItems(storeId)
    if (error) {
      setItemsError('Could not load items. Check your connection and try again.')
    } else {
      setItems(data ?? [])
    }
    setItemsLoading(false)
  }

  async function addItem(name, price) {
    if (isRateLimited('addItem', 1500)) {
    showToast('Slow down — please wait before adding another item.', 'error')
    return false
  }
    if (isNaN(parsed) || parsed <= 0) {
      showToast('Enter a valid price greater than 0.', 'error')
      return false
    }

    const { error } = await insertItem({
      store_id: storeId,
      name: trimmed,
      price: parsed,
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
    const trimmed = name?.trim()
    const parsed = parseFloat(price)

    if (!trimmed) {
      showToast('Item name is required.', 'error')
      return false
    }
    if (isNaN(parsed) || parsed <= 0) {
      showToast('Enter a valid price greater than 0.', 'error')
      return false
    }

    const { error } = await updateItemById(itemId, {
      name: trimmed,
      price: parsed,
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
    if (isRateLimited('deleteItem', 1000)) {
    showToast('Too many requests — please wait.', 'error')
    return false
  }
    await fetchItems()
    return true
  }

  async function addItemsBatch(scannedItems) {
    const valid = scannedItems.filter(
      i => i.name?.trim() && !isNaN(parseFloat(i.price)) && parseFloat(i.price) > 0
    )

    if (valid.length === 0) {
      showToast('No valid items to add.', 'error')
      return false
    }

    const results = await Promise.all(
      valid.map(item =>
        insertItem({
          store_id: storeId,
          name: item.name.trim(),
          price: parseFloat(item.price),
          user_id: userId,
        })
      )
    )

    const failed = results.filter(r => r.error).length
    if (failed > 0) {
      showToast(`${failed} item(s) failed to save. The rest were added.`, 'error')
    }

    await fetchItems()
    return failed === 0
  }

  return { items, itemsLoading, itemsError, fetchItems, addItem, updateItem, deleteItem, addItemsBatch }
}