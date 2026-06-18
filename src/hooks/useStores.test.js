import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStores } from './useStores'

vi.mock('../services/db', () => ({
  getStores: vi.fn(),
  insertStore: vi.fn(),
  deleteStoreById: vi.fn(),
}))

vi.mock('../services/toast', () => ({
  showToast: vi.fn(),
}))

vi.mock('../services/rateLimit', () => ({
  isRateLimited: vi.fn(() => false),
}))

import { getStores, insertStore, deleteStoreById } from '../services/db'

describe('useStores', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches stores on mount when userId is provided', async () => {
    getStores.mockResolvedValue({ data: [{ id: '1', name: 'SM' }], error: null })
    const { result } = renderHook(() => useStores('user-1'))
    await waitFor(() => expect(result.current.storesLoading).toBe(false))
    expect(result.current.stores).toHaveLength(1)
    expect(result.current.stores[0].name).toBe('SM')
  })

  it('sets storesError when fetch fails', async () => {
    getStores.mockResolvedValue({ data: null, error: { message: 'Network error' } })
    const { result } = renderHook(() => useStores('user-1'))
    await waitFor(() => expect(result.current.storesLoading).toBe(false))
    expect(result.current.storesError).toBeTruthy()
    expect(result.current.stores).toHaveLength(0)
  })

  it('saveStore inserts and refetches', async () => {
    getStores.mockResolvedValue({ data: [], error: null })
    insertStore.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useStores('user-1'))
    await waitFor(() => expect(result.current.storesLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.saveStore({ name: 'Jollibee', type: 'mall' })
      expect(ok).toBe(true)
    })
    expect(insertStore).toHaveBeenCalledTimes(1)
  })

  it('saveStore returns false on error', async () => {
    getStores.mockResolvedValue({ data: [], error: null })
    insertStore.mockResolvedValue({ error: { message: 'Insert failed' } })
    const { result } = renderHook(() => useStores('user-1'))
    await waitFor(() => expect(result.current.storesLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.saveStore({ name: 'Test', type: 'mall' })
      expect(ok).toBe(false)
    })
  })

  it('deleteStore calls deleteStoreById and refetches', async () => {
    getStores.mockResolvedValue({ data: [], error: null })
    deleteStoreById.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useStores('user-1'))
    await waitFor(() => expect(result.current.storesLoading).toBe(false))
    await act(async () => {
      const ok = await result.current.deleteStore('store-1')
      expect(ok).toBe(true)
    })
    expect(deleteStoreById).toHaveBeenCalledWith('store-1')
  })
})