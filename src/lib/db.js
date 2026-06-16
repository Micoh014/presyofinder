import { supabase } from './supabase'

export const TABLES = {
  STORES: 'stores',
  ITEMS: 'items',
}

export async function getStores(userId) {
  return supabase.from(TABLES.STORES).select('*').eq('user_id', userId)
}

export async function insertStore(storeData) {
  return supabase.from(TABLES.STORES).insert([storeData])
}

export async function updateStore(storeId, fields) {
  return supabase.from(TABLES.STORES).update(fields).eq('id', storeId)
}

export async function deleteStoreById(storeId) {
  return supabase.from(TABLES.STORES).delete().eq('id', storeId)
}

export async function getItems(storeId) {
  return supabase
    .from(TABLES.ITEMS)
    .select('*')
    .eq('store_id', storeId)
    .order('recorded_at', { ascending: false })
}

export async function insertItem(itemData) {
  return supabase.from(TABLES.ITEMS).insert([itemData])
}

export async function updateItemById(itemId, fields) {
  return supabase.from(TABLES.ITEMS).update(fields).eq('id', itemId)
}

export async function deleteItemById(itemId) {
  return supabase.from(TABLES.ITEMS).delete().eq('id', itemId)
}

export async function searchItemsByName(userId, query, ascending = true) {
  return supabase
    .from(TABLES.ITEMS)
    .select('*, stores(*)')
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('price', { ascending })
}