import { supabase } from './supabase'

export async function getAllItemsForUser(userId) {
  return withRetry(() =>
    supabase.from(TABLES.ITEMS).select('store_id, price').eq('user_id', userId)
  )
}

export const TABLES = {
  STORES: 'stores',
  ITEMS: 'items',
}

function sanitize(value) {
  if (typeof value !== 'string') return value
  return value.replace(/<[^>]*>/g, '').trim()
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
    supabase.from(TABLES.STORES).insert([{
      ...storeData,
    name: sanitize (storeData.name),
  type: sanitize (storeData.type),
}])
  )
}

export async function updateStore(storeId, fields) {
  const { user_id, ...safeFields } = fields
  const sanitized = { ...safeFields }
  if (safeFields.name) sanitized.name = sanitize (safeFields.name)
  return withRetry(() =>
    supabase.from(TABLES.STORES).update(sanitized).eq('id', storeId)
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
    supabase.from(TABLES.ITEMS).insert([{
      ...itemData,
    name: sanitize (itemData.name),
}])
  )
}

export async function updateItemById(itemId, fields) {
  const { user_id, ...safeFields } = fields
  const sanitized = { ...safeFields }
  if (safeFields.name) sanitized.name = sanitize (safeFields.name) 
  return withRetry(() =>
    supabase.from(TABLES.ITEMS).update(sanitized).eq('id', itemId)
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