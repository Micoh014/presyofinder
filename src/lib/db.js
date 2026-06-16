import { supabase } from './supabase'

export const TABLES = {
  STORES: 'stores',
  ITEMS: 'items',
}

// Retries a Supabase call up to `attempts` times on network failure
async function withRetry(fn, attempts = 3, delayMs = 800) {
  for (let i = 0; i < attempts; i++) {
    const result = await fn()
    if (!result.error) return result

    const isNetworkError =
      result.error.message?.includes('fetch') ||
      result.error.message?.includes('network') ||
      result.error.code === 'PGRST301'

    if (!isNetworkError || i === attempts - 1) return result

    await new Promise(r => setTimeout(r, delayMs * (i + 1)))
  }
}

export async function getStores(userId) {
  return withRetry(() =>
    supabase.from(TABLES.STORES).select('*').eq('user_id', userId)
  )
}

export async function insertStore(storeData) {
  return withRetry(() =>
    supabase.from(TABLES.STORES).insert([storeData])
  )
}

export async function updateStore(storeId, fields) {
  return withRetry(() =>
    supabase.from(TABLES.STORES).update(fields).eq('id', storeId)
  )
}

export async function deleteStoreById(storeId) {
  return withRetry(() =>
    supabase.from(TABLES.STORES).delete().eq('id', storeId)
  )
}

export async function getItems(storeId) {
  return withRetry(() =>
    supabase
      .from(TABLES.ITEMS)
      .select('*')
      .eq('store_id', storeId)
      .order('recorded_at', { ascending: false })
  )
}

export async function insertItem(itemData) {
  return withRetry(() =>
    supabase.from(TABLES.ITEMS).insert([itemData])
  )
}

export async function updateItemById(itemId, fields) {
  return withRetry(() =>
    supabase.from(TABLES.ITEMS).update(fields).eq('id', itemId)
  )
}

export async function deleteItemById(itemId) {
  return withRetry(() =>
    supabase.from(TABLES.ITEMS).delete().eq('id', itemId)
  )
}

export async function searchItemsByName(userId, query, ascending = true) {
  return withRetry(() =>
    supabase
      .from(TABLES.ITEMS)
      .select('*, stores(*)')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .order('price', { ascending })
  )
}