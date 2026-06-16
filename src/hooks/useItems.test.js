import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useItems } from './useItems'

vi.mock('../lib/db', () => ({
  getItems: vi.fn(),
  insertItem: vi.fn(),
  updateItemById: vi.fn(),
  deleteItemById: vi.fn(),
}))

vi.mock('../lib/toast', () => ({
  showToast: vi.fn(),
}))

vi.mock('../lib/rateLimit', () => ({
  isRateLimited: vi.fn(() => false),
}))

import { getItems, insertItem, updateItemById, deleteItemById } from '../lib/db'

describe('useItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches items on mount when storeId is provided', async () => {
    getItems.mockResolvedValue({ data: [{ id: '1', name: 'Rice', price: 50 }], error: null })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    expect(result.current.items).toHaveLength(1)
  })

  it('sets itemsError when fetch fails', async () => {
    getItems.mockResolvedValue({ data: null, error: { message: 'fail' } })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    expect(result.current.itemsError).toBeTruthy()
  })

  it('addItem rejects empty name', async () => {
    getItems.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.addItem('', 50)
      expect(ok).toBe(false)
    })
    expect(insertItem).not.toHaveBeenCalled()
  })

  it('addItem rejects invalid price', async () => {
    getItems.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.addItem('Rice', -5)
      expect(ok).toBe(false)
    })
    expect(insertItem).not.toHaveBeenCalled()
  })

  it('addItem succeeds with valid inputs', async () => {
    getItems.mockResolvedValue({ data: [], error: null })
    insertItem.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.addItem('Rice', 50)
      expect(ok).toBe(true)
    })
    expect(insertItem).toHaveBeenCalledTimes(1)
  })

  it('deleteItem calls deleteItemById', async () => {
    getItems.mockResolvedValue({ data: [], error: null })
    deleteItemById.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.deleteItem('item-1')
      expect(ok).toBe(true)
    })
    expect(deleteItemById).toHaveBeenCalledWith('item-1')
  })

  it('addItemsBatch skips invalid items', async () => {
    getItems.mockResolvedValue({ data: [], error: null })
    insertItem.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useItems('store-1', 'user-1'))
    await waitFor(() => expect(result.current.itemsLoading).toBe(false))
    await act(async () => {
      await result.current.addItemsBatch([
        { name: 'Rice', price: 50 },
        { name: '', price: 50 },
        { name: 'Egg', price: -1 },
      ])
    })
    expect(insertItem).toHaveBeenCalledTimes(1)
  })
})